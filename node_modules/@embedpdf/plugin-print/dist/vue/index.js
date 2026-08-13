import { useCapability, usePlugin } from "@embedpdf/core/vue";
import { PrintPlugin, PrintPluginPackage as PrintPluginPackage$1 } from "@embedpdf/plugin-print";
export * from "@embedpdf/plugin-print";
import { computed, toValue, defineComponent, ref, onMounted, onUnmounted, openBlock, createElementBlock } from "vue";
import { createPluginPackage } from "@embedpdf/core";
const usePrintPlugin = () => usePlugin(PrintPlugin.id);
const usePrintCapability = () => useCapability(PrintPlugin.id);
const usePrint = (documentId) => {
  const { provides } = usePrintCapability();
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    provides: scopedProvides
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "print",
  setup(__props) {
    const iframeRef = ref(null);
    const urlRef = ref(null);
    const { provides: printCapability } = usePrintCapability();
    const { plugin: printPlugin } = usePrintPlugin();
    let unsubscribe;
    onMounted(() => {
      if (!printCapability.value || !printPlugin.value) return;
      unsubscribe = printPlugin.value.onPrintRequest(({ buffer, task }) => {
        const iframe = iframeRef.value;
        if (!iframe) return;
        if (urlRef.value) {
          URL.revokeObjectURL(urlRef.value);
          urlRef.value = null;
        }
        const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
        urlRef.value = url;
        iframe.onload = () => {
          var _a, _b;
          if (iframe.src === url) {
            task.progress({ stage: "iframe-ready", message: "Ready to print" });
            (_a = iframe.contentWindow) == null ? void 0 : _a.focus();
            (_b = iframe.contentWindow) == null ? void 0 : _b.print();
            task.progress({ stage: "printing", message: "Print dialog opened" });
            task.resolve(buffer);
          }
        };
        iframe.src = url;
      });
    });
    onUnmounted(() => {
      unsubscribe == null ? void 0 : unsubscribe();
      if (urlRef.value) {
        URL.revokeObjectURL(urlRef.value);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("iframe", {
        ref_key: "iframeRef",
        ref: iframeRef,
        title: "Print Document",
        src: "about:blank",
        style: { position: "absolute", display: "none" }
      }, null, 512);
    };
  }
});
const PrintPluginPackage = createPluginPackage(PrintPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main as PrintFrame,
  PrintPluginPackage,
  usePrint,
  usePrintCapability,
  usePrintPlugin
};
//# sourceMappingURL=index.js.map
