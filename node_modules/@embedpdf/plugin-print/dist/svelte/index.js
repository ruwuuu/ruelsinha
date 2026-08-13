import * as $ from "svelte/internal/client";
import { useCapability, usePlugin } from "@embedpdf/core/svelte";
import { PrintPlugin, PrintPluginPackage as PrintPluginPackage$1 } from "@embedpdf/plugin-print";
export * from "@embedpdf/plugin-print";
import "svelte/internal/disclose-version";
import { createPluginPackage } from "@embedpdf/core";
const usePrintPlugin = () => usePlugin(PrintPlugin.id);
const usePrintCapability = () => useCapability(PrintPlugin.id);
const usePrint = (getDocumentId) => {
  const capability = usePrintCapability();
  const documentId = $.derived(getDocumentId);
  const scopedProvides = $.derived(() => capability.provides && $.get(documentId) ? capability.provides.forDocument($.get(documentId)) : null);
  return {
    get provides() {
      return $.get(scopedProvides);
    }
  };
};
var root = $.from_html(`<iframe title="Print Document" src="about:blank" style="position: absolute; display: none;"></iframe>`);
function Print($$anchor, $$props) {
  $.push($$props, true);
  const printCapability = usePrintCapability();
  const printPlugin = usePrintPlugin();
  let iframeRef = $.state(null);
  let urlRef = null;
  $.user_effect(() => {
    if (!printCapability.provides || !printPlugin.plugin) return;
    const unsubscribe = printPlugin.plugin.onPrintRequest(({ buffer, task }) => {
      const iframe = $.get(iframeRef);
      if (!iframe) return;
      if (urlRef) {
        URL.revokeObjectURL(urlRef);
        urlRef = null;
      }
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
      urlRef = url;
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
      if (urlRef) {
        URL.revokeObjectURL(urlRef);
        urlRef = null;
      }
    };
  });
  var iframe_1 = root();
  $.bind_this(iframe_1, ($$value) => $.set(iframeRef, $$value), () => $.get(iframeRef));
  $.append($$anchor, iframe_1);
  $.pop();
}
const PrintPluginPackage = createPluginPackage(PrintPluginPackage$1).addUtility(Print).build();
export {
  Print as PrintFrame,
  PrintPluginPackage,
  usePrint,
  usePrintCapability,
  usePrintPlugin
};
//# sourceMappingURL=index.js.map
