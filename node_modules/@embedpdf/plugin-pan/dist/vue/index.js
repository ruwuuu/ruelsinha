import { createPluginPackage } from "@embedpdf/core";
import { PanPlugin, initialDocumentState, PanPluginPackage as PanPluginPackage$1 } from "@embedpdf/plugin-pan";
export * from "@embedpdf/plugin-pan";
import { ref, watch, toValue, computed, readonly, defineComponent, onMounted, watchEffect } from "vue";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
const usePanPlugin = () => usePlugin(PanPlugin.id);
const usePanCapability = () => useCapability(PanPlugin.id);
const usePan = (documentId) => {
  const { provides } = usePanCapability();
  const isPanning = ref(initialDocumentState.isPanMode);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        isPanning.value = initialDocumentState.isPanMode;
        return;
      }
      const scope = providesValue.forDocument(docId);
      isPanning.value = scope.isPanMode();
      const unsubscribe = scope.onPanModeChange((isPan) => {
        isPanning.value = isPan;
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
    provides: scopedProvides,
    isPanning: readonly(isPanning)
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pan-mode",
  setup(__props) {
    const { provides: pan } = usePanCapability();
    const { plugin: panPlugin } = usePanPlugin();
    onMounted(() => {
      watchEffect(() => {
        var _a;
        if (!pan.value || !panPlugin.value) return;
        const mode = ((_a = panPlugin.value.config) == null ? void 0 : _a.defaultMode) ?? "never";
        const SUPPORT_TOUCH = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
        if (mode === "mobile" && SUPPORT_TOUCH) {
          pan.value.makePanDefault();
        }
      });
    });
    return (_ctx, _cache) => {
      return null;
    };
  }
});
const PanPluginPackage = createPluginPackage(PanPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main as PanMode,
  PanPluginPackage,
  usePan,
  usePanCapability,
  usePanPlugin
};
//# sourceMappingURL=index.js.map
