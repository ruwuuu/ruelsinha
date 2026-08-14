import { createPluginPackage } from "@embedpdf/core";
import { PrintPlugin, PrintPluginPackage as PrintPluginPackage$1 } from "@embedpdf/plugin-print";
export * from "@embedpdf/plugin-print";
import { jsx } from "preact/jsx-runtime";
import "preact";
import { useRef, useEffect } from "preact/hooks";
import { useCapability, usePlugin } from "@embedpdf/core/preact";
const usePrintPlugin = () => usePlugin(PrintPlugin.id);
const usePrintCapability = () => useCapability(PrintPlugin.id);
const usePrint = (documentId) => {
  const { provides } = usePrintCapability();
  return {
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
function PrintFrame() {
  const { provides: printCapability } = usePrintCapability();
  const { plugin: printPlugin } = usePrintPlugin();
  const iframeRef = useRef(null);
  const urlRef = useRef(null);
  useEffect(() => {
    if (!printCapability || !printPlugin) return;
    const unsubscribe = printPlugin.onPrintRequest(({ buffer, task }) => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
      urlRef.current = url;
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
    return () => {
      unsubscribe();
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, [printCapability, printPlugin]);
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      ref: iframeRef,
      style: { position: "absolute", display: "none" },
      title: "Print Document",
      src: "about:blank"
    }
  );
}
const PrintPluginPackage = createPluginPackage(PrintPluginPackage$1).addUtility(PrintFrame).build();
export {
  PrintFrame,
  PrintPluginPackage,
  usePrint,
  usePrintCapability,
  usePrintPlugin
};
//# sourceMappingURL=index.js.map
