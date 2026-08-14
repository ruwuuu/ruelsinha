import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/preact";
import { initialDocumentState, CapturePlugin } from "@embedpdf/plugin-capture";
export * from "@embedpdf/plugin-capture";
import { useState, useEffect, useMemo } from "preact/hooks";
import { jsx } from "preact/jsx-runtime";
const useCaptureCapability = () => useCapability(CapturePlugin.id);
const useCapturePlugin = () => usePlugin(CapturePlugin.id);
const useCapture = (documentId) => {
  const { provides } = useCaptureCapability();
  const [state, setState] = useState(initialDocumentState);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setState(scope.getState());
    return scope.onStateChange((newState) => {
      setState(newState);
    });
  }, [provides, documentId]);
  return {
    state,
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
const MarqueeCapture = ({
  documentId,
  pageIndex,
  scale,
  className,
  stroke = "rgba(33,150,243,0.8)",
  fill = "rgba(33,150,243,0.15)"
}) => {
  const { provides: capturePlugin } = useCaptureCapability();
  const documentState = useDocumentState(documentId);
  const [rect, setRect] = useState(null);
  const actualScale = useMemo(() => {
    if (scale !== void 0) return scale;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scale, documentState == null ? void 0 : documentState.scale]);
  useEffect(() => {
    if (!capturePlugin) return;
    return capturePlugin.registerMarqueeOnPage({
      documentId,
      pageIndex,
      scale: actualScale,
      callback: {
        onPreview: setRect
      }
    });
  }, [capturePlugin, documentId, pageIndex, actualScale]);
  if (!rect) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        pointerEvents: "none",
        left: rect.origin.x * actualScale,
        top: rect.origin.y * actualScale,
        width: rect.size.width * actualScale,
        height: rect.size.height * actualScale,
        border: `1px solid ${stroke}`,
        background: fill,
        boxSizing: "border-box"
      },
      className
    }
  );
};
export {
  MarqueeCapture,
  useCapture,
  useCaptureCapability,
  useCapturePlugin
};
//# sourceMappingURL=index.js.map
