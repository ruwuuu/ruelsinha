import { ref, watch, toValue, computed, readonly } from "vue";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { SpreadPlugin, initialDocumentState } from "@embedpdf/plugin-spread";
export * from "@embedpdf/plugin-spread";
const useSpreadPlugin = () => usePlugin(SpreadPlugin.id);
const useSpreadCapability = () => useCapability(SpreadPlugin.id);
const useSpread = (documentId) => {
  const { provides } = useSpreadCapability();
  const spreadMode = ref(initialDocumentState.spreadMode);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        spreadMode.value = initialDocumentState.spreadMode;
        return;
      }
      const scope = providesValue.forDocument(docId);
      spreadMode.value = scope.getSpreadMode();
      const unsubscribe = scope.onSpreadChange((newSpreadMode) => {
        spreadMode.value = newSpreadMode;
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
    spreadMode: readonly(spreadMode)
  };
};
export {
  useSpread,
  useSpreadCapability,
  useSpreadPlugin
};
//# sourceMappingURL=index.js.map
