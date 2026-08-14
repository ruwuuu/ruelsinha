import { createPluginPackage } from "@embedpdf/core";
import { ExportPlugin, ExportPluginPackage as ExportPluginPackage$1 } from "@embedpdf/plugin-export";
export * from "@embedpdf/plugin-export";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { ignore } from "@embedpdf/models";
import { useCapability, usePlugin } from "@embedpdf/core/svelte";
const useExportPlugin = () => usePlugin(ExportPlugin.id);
const useExportCapability = () => useCapability(ExportPlugin.id);
const useExport = (getDocumentId) => {
  const capability = useExportCapability();
  const documentId = $.derived(getDocumentId);
  const scopedProvides = $.derived(() => capability.provides && $.get(documentId) ? capability.provides.forDocument($.get(documentId)) : null);
  return {
    get provides() {
      return $.get(scopedProvides);
    }
  };
};
var root = $.from_html(`<a style="display: none" href="/" aria-label="Download link"></a>`);
function Download($$anchor, $$props) {
  $.push($$props, true);
  const exportCapability = useExportCapability();
  const exportPlugin = useExportPlugin();
  let anchorElement;
  $.user_effect(() => {
    if (!exportCapability.provides) return;
    if (!exportPlugin.plugin) return;
    const unsub = exportPlugin.plugin.onRequest((event) => {
      var _a;
      const el = anchorElement;
      if (!el) return;
      const task = (_a = exportPlugin.plugin) == null ? void 0 : _a.saveAsCopyAndGetBufferAndName(event.documentId);
      task == null ? void 0 : task.wait(
        ({ buffer, name }) => {
          const url = URL.createObjectURL(new Blob([buffer]));
          el.href = url;
          el.download = name;
          el.click();
          URL.revokeObjectURL(url);
        },
        ignore
      );
    });
    return unsub;
  });
  var a = root();
  $.bind_this(a, ($$value) => anchorElement = $$value, () => anchorElement);
  $.append($$anchor, a);
  $.pop();
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
