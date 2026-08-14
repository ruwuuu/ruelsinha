import { ref, watch, toValue, computed, readonly, defineComponent, openBlock, createElementBlock, mergeProps, renderSlot, createCommentVNode } from "vue";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/vue";
import { RotatePlugin, initialDocumentState } from "@embedpdf/plugin-rotate";
export * from "@embedpdf/plugin-rotate";
const useRotatePlugin = () => usePlugin(RotatePlugin.id);
const useRotateCapability = () => useCapability(RotatePlugin.id);
const useRotate = (documentId) => {
  const { provides } = useRotateCapability();
  const rotation = ref(initialDocumentState.rotation);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        rotation.value = initialDocumentState.rotation;
        return;
      }
      const scope = providesValue.forDocument(docId);
      rotation.value = scope.getRotation();
      const unsubscribe = scope.onRotateChange((newRotation) => {
        rotation.value = newRotation;
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
    rotation: readonly(rotation),
    provides: scopedProvides
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "rotate",
  props: {
    documentId: {},
    pageIndex: {},
    rotation: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const { plugin: rotatePlugin } = useRotatePlugin();
    const documentState = useDocumentState(() => props.documentId);
    const page = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = documentState.value) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[props.pageIndex];
    });
    const width = computed(() => {
      var _a, _b;
      return ((_b = (_a = page.value) == null ? void 0 : _a.size) == null ? void 0 : _b.width) ?? 0;
    });
    const height = computed(() => {
      var _a, _b;
      return ((_b = (_a = page.value) == null ? void 0 : _a.size) == null ? void 0 : _b.height) ?? 0;
    });
    const pageRotation = computed(() => {
      var _a;
      return ((_a = page.value) == null ? void 0 : _a.rotation) ?? 0;
    });
    const rotation = computed(() => {
      var _a;
      if (props.rotation !== void 0) return props.rotation;
      const docRotation = ((_a = documentState.value) == null ? void 0 : _a.rotation) ?? 0;
      return (pageRotation.value + docRotation) % 4;
    });
    const scale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    const matrix = computed(() => {
      if (!rotatePlugin.value) return "matrix(1, 0, 0, 1, 0, 0)";
      return rotatePlugin.value.getMatrixAsString({
        width: width.value * scale.value,
        height: height.value * scale.value,
        rotation: rotation.value
      });
    });
    return (_ctx, _cache) => {
      return page.value ? (openBlock(), createElementBlock("div", mergeProps({
        key: 0,
        style: {
          position: "absolute",
          transformOrigin: "0 0",
          transform: matrix.value
        }
      }, _ctx.$attrs), [
        renderSlot(_ctx.$slots, "default")
      ], 16)) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as Rotate,
  useRotate,
  useRotateCapability,
  useRotatePlugin
};
//# sourceMappingURL=index.js.map
