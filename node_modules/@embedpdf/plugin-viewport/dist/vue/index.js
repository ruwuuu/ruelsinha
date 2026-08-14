import { ref, watch, toValue, onBeforeUnmount, defineComponent, useAttrs, provide, openBlock, createElementBlock, mergeProps, unref, renderSlot, createCommentVNode } from "vue";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { ViewportPlugin } from "@embedpdf/plugin-viewport";
export * from "@embedpdf/plugin-viewport";
const useViewportPlugin = () => usePlugin(ViewportPlugin.id);
const useViewportCapability = () => useCapability(ViewportPlugin.id);
const useIsViewportGated = (documentId) => {
  const { provides } = useViewportCapability();
  const isGated = ref(false);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        isGated.value = false;
        return;
      }
      isGated.value = providesValue.isGated(docId);
      const unsubscribe = providesValue.onGateChange((event) => {
        if (event.documentId === docId) {
          isGated.value = event.isGated;
        }
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return isGated;
};
const useViewportScrollActivity = (documentId) => {
  const { provides } = useViewportCapability();
  const scrollActivity = ref({
    isSmoothScrolling: false,
    isScrolling: false
  });
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        scrollActivity.value = {
          isSmoothScrolling: false,
          isScrolling: false
        };
        return;
      }
      const unsubscribe = providesValue.onScrollActivity((event) => {
        if (event.documentId === docId) {
          scrollActivity.value = event.activity;
        }
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return scrollActivity;
};
function useViewportRef(documentId) {
  const { plugin: pluginRef } = useViewportPlugin();
  const containerRef = ref(null);
  let cleanup = null;
  const setupViewport = (docId) => {
    const viewportPlugin = pluginRef.value;
    const container = containerRef.value;
    if (!container || !viewportPlugin) return;
    try {
      viewportPlugin.registerViewport(docId);
    } catch (error) {
      console.error(`Failed to register viewport for document ${docId}:`, error);
      return;
    }
    const onScroll = () => {
      viewportPlugin.setViewportScrollMetrics(docId, {
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft
      });
    };
    container.addEventListener("scroll", onScroll);
    const resizeObserver = new ResizeObserver(() => {
      viewportPlugin.setViewportResizeMetrics(docId, {
        width: container.offsetWidth,
        height: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        clientLeft: container.clientLeft,
        clientTop: container.clientTop
      });
    });
    resizeObserver.observe(container);
    const unsubscribeScrollRequest = viewportPlugin.onScrollRequest(
      docId,
      ({ x, y, behavior = "auto" }) => {
        requestAnimationFrame(() => {
          container.scrollTo({ left: x, top: y, behavior });
        });
      }
    );
    return () => {
      viewportPlugin.unregisterViewport(docId);
      container.removeEventListener("scroll", onScroll);
      unsubscribeScrollRequest();
    };
  };
  watch(
    [pluginRef, containerRef, () => toValue(documentId)],
    ([, , docId]) => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      cleanup = setupViewport(docId) || null;
    },
    { immediate: true }
  );
  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });
  return containerRef;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "viewport",
  props: {
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const attrs = useAttrs();
    const { provides: viewportProvides } = useViewportCapability();
    const viewportGap = ref(0);
    watch(
      viewportProvides,
      (vp) => {
        if (vp) viewportGap.value = vp.getViewportGap();
      },
      { immediate: true }
    );
    const isGated = useIsViewportGated(() => props.documentId);
    const viewportRef = useViewportRef(() => props.documentId);
    provide("viewport-element", viewportRef);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "viewportRef",
        ref: viewportRef
      }, unref(attrs), {
        style: { padding: `${viewportGap.value}px`, width: "100%", height: "100%", overflow: "auto" }
      }), [
        !unref(isGated) ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("", true)
      ], 16);
    };
  }
});
export {
  _sfc_main as Viewport,
  useIsViewportGated,
  useViewportCapability,
  useViewportPlugin,
  useViewportRef,
  useViewportScrollActivity
};
//# sourceMappingURL=index.js.map
