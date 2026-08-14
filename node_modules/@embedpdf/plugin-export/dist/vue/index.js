import { createPluginPackage } from "@embedpdf/core";
import { ExportPlugin, ExportPluginPackage as ExportPluginPackage$1 } from "@embedpdf/plugin-export";
export * from "@embedpdf/plugin-export";
import { computed, toValue, defineComponent, ref, onMounted, onUnmounted, openBlock, createElementBlock } from "vue";
import { ignore } from "@embedpdf/models";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
const useExportPlugin = () => usePlugin(ExportPlugin.id);
const useExportCapability = () => useCapability(ExportPlugin.id);
const useExport = (documentId) => {
  const { provides } = useExportCapability();
  return {
    provides: computed(() => {
      var _a;
      return ((_a = provides.value) == null ? void 0 : _a.forDocument(toValue(documentId))) ?? null;
    })
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "download",
  setup(__props) {
    const { provides: exportCapabilityRef } = useExportCapability();
    const { plugin: exportPluginRef } = useExportPlugin();
    const anchorRef = ref(null);
    let unsubscribe = null;
    onMounted(() => {
      const exportCapability = exportCapabilityRef.value;
      const exportPlugin = exportPluginRef.value;
      if (!exportCapability || !exportPlugin) return;
      unsubscribe = exportPlugin.onRequest((event) => {
        const el = anchorRef.value;
        if (!el) return;
        const task = exportPlugin.saveAsCopyAndGetBufferAndName(event.documentId);
        task.wait(({ buffer, name }) => {
          const url = URL.createObjectURL(new Blob([buffer]));
          el.href = url;
          el.download = name;
          el.click();
          URL.revokeObjectURL(url);
        }, ignore);
      });
    });
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("a", {
        ref_key: "anchorRef",
        ref: anchorRef,
        style: { "display": "none" }
      }, null, 512);
    };
  }
});
const ExportPluginPackage = createPluginPackage(ExportPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main as Download,
  ExportPluginPackage,
  useExport,
  useExportCapability,
  useExportPlugin
};
//# sourceMappingURL=index.js.map
