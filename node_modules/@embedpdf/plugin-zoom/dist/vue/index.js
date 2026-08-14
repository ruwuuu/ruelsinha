import { ref, watch, toValue, computed, readonly, inject, defineComponent, openBlock, createElementBlock, normalizeClass, normalizeStyle, createCommentVNode, toRef, mergeProps, renderSlot } from "vue";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/vue";
import { ZoomPlugin, initialDocumentState } from "@embedpdf/plugin-zoom";
export * from "@embedpdf/plugin-zoom";
const useZoomCapability = () => useCapability(ZoomPlugin.id);
const useZoomPlugin = () => usePlugin(ZoomPlugin.id);
const useZoom = (documentId) => {
  const { provides } = useZoomCapability();
  const state = ref(initialDocumentState);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        state.value = initialDocumentState;
        return;
      }
      const scope = providesValue.forDocument(docId);
      state.value = scope.getState();
      const unsubscribe = scope.onStateChange((newState) => {
        state.value = newState;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    state: readonly(state),
    provides: scopedProvides
  };
};
function getTouchDistance(touches) {
  const [t1, t2] = [touches[0], touches[1]];
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}
function getTouchCenter(touches) {
  const [t1, t2] = [touches[0], touches[1]];
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2
  };
}
function setupZoomGestures({
  element,
  container,
  documentId,
  zoomProvides,
  viewportGap = 0,
  options = {}
}) {
  const { enablePinch = true, enableWheel = true } = options;
  if (typeof window === "undefined") {
    return () => {
    };
  }
  const zoomScope = zoomProvides.forDocument(documentId);
  const getState = () => zoomScope.getState();
  let initialZoom = 0;
  let currentScale = 1;
  let isPinching = false;
  let initialDistance = 0;
  let wheelZoomTimeout = null;
  let accumulatedWheelScale = 1;
  let initialElementWidth = 0;
  let initialElementHeight = 0;
  let initialElementLeft = 0;
  let initialElementTop = 0;
  let containerRectWidth = 0;
  let containerRectHeight = 0;
  let layoutWidth = 0;
  let layoutCenterX = 0;
  let pointerLocalY = 0;
  let pointerContainerX = 0;
  let pointerContainerY = 0;
  let currentGap = 0;
  let pivotLocalX = 0;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const updateMargin = () => {
    const availableWidth = container.clientWidth - 2 * viewportGap;
    const elementWidth = element.offsetWidth;
    const newMargin = elementWidth < availableWidth ? (availableWidth - elementWidth) / 2 : 0;
    element.style.marginLeft = `${newMargin}px`;
  };
  const calculateTransform = (scale) => {
    const finalWidth = initialElementWidth * scale;
    const finalHeight = initialElementHeight * scale;
    let ty = pointerLocalY * (1 - scale);
    const targetX = layoutCenterX - finalWidth / 2;
    const txCenter = targetX - initialElementLeft;
    const txMouse = pointerContainerX - pivotLocalX * scale - initialElementLeft;
    const overflow = Math.max(0, finalWidth - layoutWidth);
    const blendRange = layoutWidth * 0.3;
    const blend = Math.min(1, overflow / blendRange);
    let tx = txCenter + (txMouse - txCenter) * blend;
    const safeHeight = containerRectHeight - currentGap * 2;
    if (finalHeight > safeHeight) {
      const currentTop = initialElementTop + ty;
      const maxTop = currentGap;
      const minTop = containerRectHeight - currentGap - finalHeight;
      const constrainedTop = clamp(currentTop, minTop, maxTop);
      ty = constrainedTop - initialElementTop;
    }
    const safeWidth = containerRectWidth - currentGap * 2;
    if (finalWidth > safeWidth) {
      const currentLeft = initialElementLeft + tx;
      const maxLeft = currentGap;
      const minLeft = containerRectWidth - currentGap - finalWidth;
      const constrainedLeft = clamp(currentLeft, minLeft, maxLeft);
      tx = constrainedLeft - initialElementLeft;
    }
    return { tx, ty, blend, finalWidth };
  };
  const updateTransform = (scale) => {
    currentScale = scale;
    const { tx, ty } = calculateTransform(scale);
    element.style.transformOrigin = "0 0";
    element.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const resetTransform = () => {
    element.style.transform = "none";
    element.style.transformOrigin = "0 0";
    currentScale = 1;
  };
  const commitZoom = () => {
    const { tx, finalWidth } = calculateTransform(currentScale);
    const delta = (currentScale - 1) * initialZoom;
    let anchorX;
    let anchorY = pointerContainerY;
    if (finalWidth <= layoutWidth) {
      anchorX = layoutCenterX;
    } else {
      const scaleDiff = 1 - currentScale;
      anchorX = Math.abs(scaleDiff) > 1e-3 ? initialElementLeft + tx / scaleDiff : pointerContainerX;
    }
    zoomScope.requestZoomBy(delta, { vx: anchorX, vy: anchorY });
    resetTransform();
    initialZoom = 0;
  };
  const initializeGestureState = (clientX, clientY) => {
    const containerRect = container.getBoundingClientRect();
    const innerRect = element.getBoundingClientRect();
    currentGap = viewportGap;
    initialElementWidth = innerRect.width;
    initialElementHeight = innerRect.height;
    initialElementLeft = innerRect.left - containerRect.left;
    initialElementTop = innerRect.top - containerRect.top;
    containerRectWidth = containerRect.width;
    containerRectHeight = containerRect.height;
    layoutWidth = container.clientWidth;
    layoutCenterX = container.clientLeft + layoutWidth / 2;
    const rawPointerLocalX = clientX - innerRect.left;
    pointerLocalY = clientY - innerRect.top;
    pointerContainerX = clientX - containerRect.left;
    pointerContainerY = clientY - containerRect.top;
    if (initialElementWidth < layoutWidth) {
      pivotLocalX = pointerContainerX * initialElementWidth / layoutWidth;
    } else {
      pivotLocalX = rawPointerLocalX;
    }
  };
  const handleTouchStart = (e) => {
    if (e.touches.length !== 2) return;
    isPinching = true;
    initialZoom = getState().currentZoomLevel;
    initialDistance = getTouchDistance(e.touches);
    const center = getTouchCenter(e.touches);
    initializeGestureState(center.x, center.y);
    e.preventDefault();
  };
  const handleTouchMove = (e) => {
    if (!isPinching || e.touches.length !== 2) return;
    const currentDistance = getTouchDistance(e.touches);
    const scale = currentDistance / initialDistance;
    updateTransform(scale);
    e.preventDefault();
  };
  const handleTouchEnd = (e) => {
    if (!isPinching) return;
    if (e.touches.length >= 2) return;
    isPinching = false;
    commitZoom();
  };
  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (wheelZoomTimeout === null) {
      initialZoom = getState().currentZoomLevel;
      accumulatedWheelScale = 1;
      initializeGestureState(e.clientX, e.clientY);
    } else {
      clearTimeout(wheelZoomTimeout);
    }
    const zoomFactor = 1 - e.deltaY * 0.01;
    accumulatedWheelScale *= zoomFactor;
    accumulatedWheelScale = Math.max(0.1, Math.min(10, accumulatedWheelScale));
    updateTransform(accumulatedWheelScale);
    wheelZoomTimeout = setTimeout(() => {
      wheelZoomTimeout = null;
      commitZoom();
      accumulatedWheelScale = 1;
    }, 150);
  };
  const unsubZoom = zoomScope.onStateChange(() => updateMargin());
  const resizeObserver = new ResizeObserver(() => updateMargin());
  resizeObserver.observe(element);
  resizeObserver.observe(container);
  updateMargin();
  if (enablePinch) {
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);
  }
  if (enableWheel) {
    container.addEventListener("wheel", handleWheel, { passive: false });
  }
  return () => {
    if (enablePinch) {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    }
    if (enableWheel) {
      container.removeEventListener("wheel", handleWheel);
    }
    if (wheelZoomTimeout) {
      clearTimeout(wheelZoomTimeout);
    }
    unsubZoom();
    resizeObserver.disconnect();
    resetTransform();
    element.style.marginLeft = "";
  };
}
function useZoomGesture(documentId, options = {}) {
  const { provides: viewportProvides } = useCapability("viewport");
  const { provides: zoomProvides } = useZoomCapability();
  const viewportElementRef = inject("viewport-element");
  const elementRef = ref(null);
  let cleanup;
  watch(
    [
      elementRef,
      viewportProvides,
      zoomProvides,
      () => toValue(documentId),
      () => toValue(options.enablePinch ?? true),
      () => toValue(options.enableWheel ?? true)
    ],
    ([element, viewport, zoom, docId, enablePinch, enableWheel]) => {
      if (cleanup) {
        cleanup();
        cleanup = void 0;
      }
      const container = viewportElementRef == null ? void 0 : viewportElementRef.value;
      if (!element || !container || !zoom) {
        return;
      }
      cleanup = setupZoomGestures({
        element,
        container,
        documentId: docId,
        zoomProvides: zoom,
        viewportGap: (viewport == null ? void 0 : viewport.getViewportGap()) || 0,
        options: { enablePinch, enableWheel }
      });
    },
    { immediate: true }
  );
  return { elementRef };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "marquee-zoom",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    className: {},
    stroke: { default: "rgba(33,150,243,0.8)" },
    fill: { default: "rgba(33,150,243,0.15)" }
  },
  setup(__props) {
    const props = __props;
    const { provides: zoomPlugin } = useZoomCapability();
    const documentState = useDocumentState(() => props.documentId);
    const rect = ref(null);
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    watch(
      [zoomPlugin, () => props.documentId, () => props.pageIndex, actualScale],
      ([plugin, docId, pageIdx, scale], _, onCleanup) => {
        if (!plugin) {
          rect.value = null;
          return;
        }
        const unregister = plugin.registerMarqueeOnPage({
          documentId: docId,
          pageIndex: pageIdx,
          scale,
          callback: {
            onPreview: (newRect) => {
              rect.value = newRect;
            }
          }
        });
        onCleanup(() => {
          unregister == null ? void 0 : unregister();
        });
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return rect.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        style: normalizeStyle({
          position: "absolute",
          pointerEvents: "none",
          left: `${rect.value.origin.x * actualScale.value}px`,
          top: `${rect.value.origin.y * actualScale.value}px`,
          width: `${rect.value.size.width * actualScale.value}px`,
          height: `${rect.value.size.height * actualScale.value}px`,
          border: `1px solid ${__props.stroke}`,
          background: __props.fill,
          boxSizing: "border-box"
        }),
        class: normalizeClass(__props.className)
      }, null, 6)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "zoom-gesture-wrapper",
  props: {
    documentId: {},
    enablePinch: { type: Boolean, default: true },
    enableWheel: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const { elementRef } = useZoomGesture(() => props.documentId, {
      enablePinch: toRef(() => props.enablePinch),
      enableWheel: toRef(() => props.enableWheel)
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "elementRef",
        ref: elementRef,
        style: {
          display: "inline-block",
          overflow: "visible",
          boxSizing: "border-box"
        }
      }, _ctx.$attrs), [
        renderSlot(_ctx.$slots, "default")
      ], 16);
    };
  }
});
export {
  _sfc_main$1 as MarqueeZoom,
  _sfc_main as ZoomGestureWrapper,
  useZoom,
  useZoomCapability,
  useZoomGesture,
  useZoomPlugin
};
//# sourceMappingURL=index.js.map
