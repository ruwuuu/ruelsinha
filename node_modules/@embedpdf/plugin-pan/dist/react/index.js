import { createPluginPackage } from "@embedpdf/core";
import { PanPlugin, initialDocumentState, PanPluginPackage as PanPluginPackage$1 } from "@embedpdf/plugin-pan";
export * from "@embedpdf/plugin-pan";
import { useState, useEffect } from "react";
import { useCapability, usePlugin } from "@embedpdf/core/react";
const usePanPlugin = () => usePlugin(PanPlugin.id);
const usePanCapability = () => useCapability(PanPlugin.id);
const usePan = (documentId) => {
  const { provides } = usePanCapability();
  const [isPanning, setIsPanning] = useState(initialDocumentState.isPanMode);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setIsPanning(scope.isPanMode());
    return scope.onPanModeChange((isPan) => {
      setIsPanning(isPan);
    });
  }, [provides, documentId]);
  return {
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null,
    isPanning
  };
};
const PanMode = () => {
  const { provides: pan } = usePanCapability();
  const { plugin: panPlugin } = usePanPlugin();
  useEffect(() => {
    var _a;
    if (!pan || !panPlugin) return;
    const mode = ((_a = panPlugin.config) == null ? void 0 : _a.defaultMode) ?? "never";
    const SUPPORT_TOUCH = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (mode === "mobile" && SUPPORT_TOUCH) {
      pan.makePanDefault();
    }
  }, [pan, panPlugin]);
  return null;
};
const PanPluginPackage = createPluginPackage(PanPluginPackage$1).addUtility(PanMode).build();
export {
  PanMode,
  PanPluginPackage,
  usePan,
  usePanCapability,
  usePanPlugin
};
//# sourceMappingURL=index.js.map
