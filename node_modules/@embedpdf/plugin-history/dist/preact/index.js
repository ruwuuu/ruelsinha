import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { HistoryPlugin } from "@embedpdf/plugin-history";
export * from "@embedpdf/plugin-history";
const useHistoryPlugin = () => usePlugin(HistoryPlugin.id);
const useHistoryCapability = () => useCapability(HistoryPlugin.id);
export {
  useHistoryCapability,
  useHistoryPlugin
};
//# sourceMappingURL=index.js.map
