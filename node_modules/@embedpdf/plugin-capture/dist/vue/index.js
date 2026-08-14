import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/vue";
import { CapturePlugin, initialDocumentState } from "@embedpdf/plugin-capture";
export * from "@embedpdf/plugin-capture";
import { ref, watch, toValue, computed, defineComponent, openBlock, createElementBlock, normalizeClass, normalizeStyle, createCommentVNode } from "vue";
const useCaptureCapability = () => useCapability(CapturePlugin.id);
const useCapturePlugin = () => usePlugin(CapturePlugin.id);
const useCapture = (documentId) => {
  const { provides } = useCaptureCapability();
  const state = ref(initialDocumentState);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (providesValue && docId) {
        const scope = providesValue.forDocument(docId);
        state.value = scope.getState();
        const unsubscribe = scope.onStateChange((newState) => {
          state.value = newState;
        });
        onCleanup(unsubscribe);
      }
    },
    { immediate: true }
  );
  return {
    state,
    provides: computed(() => {
      var _a;
      return ((_a = provides.value) == null ? void 0 : _a.forDocument(toValue(documentId))) ?? null;
    })
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "marquee-capture",
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
    const { provides: capturePlugin } = useCaptureCapability();
    const documentState = useDocumentState(() => props.documentId);
    const rect = ref(null);
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    watch(
      [capturePlugin, () => props.documentId, () => props.pageIndex, actualScale],
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
export {
  _sfc_main as MarqueeCapture,
  useCapture,
  useCaptureCapability,
  useCapturePlugin
};
//# sourceMappingURL=index.js.map
