import { useCapability, usePlugin } from "@embedpdf/core/react";
import { initialDocumentState, SpreadPlugin } from "@embedpdf/plugin-spread";
export * from "@embedpdf/plugin-spread";
import { useState, useEffect } from "react";
const useSpreadPlugin = () => usePlugin(SpreadPlugin.id);
const useSpreadCapability = () => useCapability(SpreadPlugin.id);
const useSpread = (documentId) => {
  const { provides } = useSpreadCapability();
  const [spreadMode, setSpreadMode] = useState(initialDocumentState.spreadMode);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setSpreadMode(scope.getSpreadMode());
    return scope.onSpreadChange((newSpreadMode) => {
      setSpreadMode(newSpreadMode);
    });
  }, [provides, documentId]);
  return {
    spreadMode,
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
export {
  useSpread,
  useSpreadCapability,
  useSpreadPlugin
};
//# sourceMappingURL=index.js.map
