import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/preact";
import { initialDocumentState, ZoomPlugin } from "@embedpdf/plugin-zoom";
export * from "@embedpdf/plugin-zoom";
import "preact";
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "preact/hooks";
import { useViewportElement } from "@embedpdf/plugin-viewport/preact";
import { jsx } from "preact/jsx-runtime";
const useZoomCapability = () => useCapability(ZoomPlugin.id);
const useZoomPlugin = () => usePlugin(ZoomPlugin.id);
const useZoom = (documentId) => {
  const { provides } = useZoomCapability();
  const [state, setState] = useState(initialDocumentState);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setState(scope.getState());
    return scope.onStateChange((newState) => {
      setState(newState);
    });
  }, [provides, documentId]);
  return {
    state,
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
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
  const viewportElementRef = useViewportElement();
  const elementRef = useRef(null);
  useLayoutEffect(() => {
    const element = elementRef.current;
    const container = viewportElementRef == null ? void 0 : viewportElementRef.current;
    if (!element || !container || !zoomProvides) {
      return;
    }
    return setupZoomGestures({
      element,
      container,
      documentId,
      zoomProvides,
      viewportGap: (viewportProvides == null ? void 0 : viewportProvides.getViewportGap()) || 0,
      options
    });
  }, [
    viewportProvides,
    zoomProvides,
    documentId,
    viewportElementRef,
    options.enablePinch,
    options.enableWheel
  ]);
  return { elementRef };
}
function ZoomGestureWrapper({
  children,
  documentId,
  style,
  enablePinch = true,
  enableWheel = true,
  ...props
}) {
  const options = useMemo(
    () => ({ enablePinch, enableWheel }),
    [enablePinch, enableWheel]
  );
  const { elementRef } = useZoomGesture(documentId, options);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: elementRef,
      ...props,
      style: {
        ...style,
        display: "inline-block",
        overflow: "visible",
        boxSizing: "border-box"
      },
      children
    }
  );
}
const MarqueeZoom = ({
  documentId,
  pageIndex,
  scale: scaleOverride,
  className,
  stroke = "rgba(33,150,243,0.8)",
  fill = "rgba(33,150,243,0.15)"
}) => {
  const { provides: zoomPlugin } = useZoomCapability();
  const documentState = useDocumentState(documentId);
  const [rect, setRect] = useState(null);
  const actualScale = useMemo(() => {
    if (scaleOverride !== void 0) return scaleOverride;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scaleOverride, documentState == null ? void 0 : documentState.scale]);
  useEffect(() => {
    if (!zoomPlugin) return;
    return zoomPlugin.registerMarqueeOnPage({
      documentId,
      pageIndex,
      scale: actualScale,
      callback: {
        onPreview: setRect
      }
    });
  }, [zoomPlugin, documentId, pageIndex, actualScale]);
  if (!rect) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        pointerEvents: "none",
        left: rect.origin.x * actualScale,
        top: rect.origin.y * actualScale,
        width: rect.size.width * actualScale,
        height: rect.size.height * actualScale,
        border: `1px solid ${stroke}`,
        background: fill,
        boxSizing: "border-box"
      },
      className
    }
  );
};
export {
  MarqueeZoom,
  ZoomGestureWrapper,
  useZoom,
  useZoomCapability,
  useZoomGesture,
  useZoomPlugin
};
//# sourceMappingURL=index.js.map
