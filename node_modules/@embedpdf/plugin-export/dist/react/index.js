import { createPluginPackage } from "@embedpdf/core";
import { ExportPlugin, ExportPluginPackage as ExportPluginPackage$1 } from "@embedpdf/plugin-export";
export * from "@embedpdf/plugin-export";
import { jsx } from "react/jsx-runtime";
import { ignore } from "@embedpdf/models";
import { useRef, useEffect } from "react";
import { usePlugin, useCapability } from "@embedpdf/core/react";
const useExportPlugin = () => usePlugin(ExportPlugin.id);
const useExportCapability = () => useCapability(ExportPlugin.id);
const useExport = (documentId) => {
  const { provides } = useExportCapability();
  return {
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
function Download() {
  const { plugin: exportPlugin } = useExportPlugin();
  const ref = useRef(null);
  useEffect(() => {
    if (!exportPlugin) return;
    const unsub = exportPlugin.onRequest((event) => {
      const el = ref.current;
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
    return unsub;
  }, [exportPlugin]);
  return /* @__PURE__ */ jsx("a", { style: { display: "none" }, ref });
}
const ExportPluginPackage = createPluginPackage(ExportPluginPackage$1).addUtility(Download).build();
export {
  Download,
  ExportPluginPackage,
  useExport,
  useExportCapability,
  useExportPlugin
};
//# sourceMappingURL=index.js.map
