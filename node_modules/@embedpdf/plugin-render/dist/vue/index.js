import { defineComponent, ref, computed, watch, openBlock, createElementBlock, mergeProps, createCommentVNode } from "vue";
import { ignore, PdfErrorCode } from "@embedpdf/models";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/vue";
import { RenderPlugin } from "@embedpdf/plugin-render";
export * from "@embedpdf/plugin-render";
const useRenderPlugin = () => usePlugin(RenderPlugin.id);
const useRenderCapability = () => useCapability(RenderPlugin.id);
const _hoisted_1 = ["src"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "render-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    dpr: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: renderProvides } = useRenderCapability();
    const documentState = useDocumentState(() => props.documentId);
    const imageUrl = ref(null);
    let urlRef = null;
    let hasLoaded = false;
    const refreshVersion = computed(() => {
      if (!documentState.value) return 0;
      return documentState.value.pageRefreshVersions[props.pageIndex] || 0;
    });
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    const actualDpr = computed(() => {
      if (props.dpr !== void 0) return props.dpr;
      return window.devicePixelRatio;
    });
    watch(
      [
        () => props.documentId,
        () => props.pageIndex,
        actualScale,
        actualDpr,
        renderProvides,
        refreshVersion
      ],
      ([docId, pageIdx, scale, dpr, capability], [prevDocId], onCleanup) => {
        if (!capability) {
          imageUrl.value = null;
          return;
        }
        if (prevDocId !== void 0 && prevDocId !== docId) {
          imageUrl.value = null;
          if (urlRef && hasLoaded) {
            URL.revokeObjectURL(urlRef);
            urlRef = null;
            hasLoaded = false;
          }
        }
        if (urlRef && hasLoaded && prevDocId === docId) {
          URL.revokeObjectURL(urlRef);
          urlRef = null;
          hasLoaded = false;
        }
        const task = capability.forDocument(docId).renderPage({
          pageIndex: pageIdx,
          options: {
            scaleFactor: scale,
            dpr
          }
        });
        task.wait((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          urlRef = objectUrl;
          imageUrl.value = objectUrl;
          hasLoaded = false;
        }, ignore);
        onCleanup(() => {
          if (urlRef) {
            if (hasLoaded) {
              URL.revokeObjectURL(urlRef);
              urlRef = null;
              hasLoaded = false;
            }
          } else {
            task.abort({
              code: PdfErrorCode.Cancelled,
              message: "canceled render task"
            });
          }
        });
      },
      { immediate: true }
    );
    function handleImageLoad() {
      hasLoaded = true;
    }
    return (_ctx, _cache) => {
      return imageUrl.value ? (openBlock(), createElementBlock("img", mergeProps({
        key: 0,
        src: imageUrl.value,
        style: { width: "100%", height: "100%" },
        onLoad: handleImageLoad
      }, _ctx.$attrs), null, 16, _hoisted_1)) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as RenderLayer,
  useRenderCapability,
  useRenderPlugin
};
//# sourceMappingURL=index.js.map
