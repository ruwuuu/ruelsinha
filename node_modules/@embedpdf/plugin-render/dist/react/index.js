import { jsx } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect, Fragment } from "react";
import { ignore, PdfErrorCode } from "@embedpdf/models";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/react";
import { RenderPlugin } from "@embedpdf/plugin-render";
export * from "@embedpdf/plugin-render";
const useRenderPlugin = () => usePlugin(RenderPlugin.id);
const useRenderCapability = () => useCapability(RenderPlugin.id);
function RenderLayer({
  documentId,
  pageIndex,
  scale: scaleOverride,
  dpr: dprOverride,
  style,
  ...props
}) {
  const { provides: renderProvides } = useRenderCapability();
  const documentState = useDocumentState(documentId);
  const [imageUrl, setImageUrl] = useState(null);
  const urlRef = useRef(null);
  const refreshVersion = useMemo(() => {
    if (!documentState) return 0;
    return documentState.pageRefreshVersions[pageIndex] || 0;
  }, [documentState, pageIndex]);
  const actualScale = useMemo(() => {
    if (scaleOverride !== void 0) return scaleOverride;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scaleOverride, documentState == null ? void 0 : documentState.scale]);
  const actualDpr = useMemo(() => {
    if (dprOverride !== void 0) return dprOverride;
    return window.devicePixelRatio;
  }, [dprOverride]);
  useEffect(() => {
    if (!renderProvides) return;
    const task = renderProvides.forDocument(documentId).renderPage({
      pageIndex,
      options: {
        scaleFactor: actualScale,
        dpr: actualDpr
      }
    });
    task.wait((blob) => {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      urlRef.current = url;
    }, ignore);
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      } else {
        task.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled render task"
        });
      }
    };
  }, [documentId, pageIndex, actualScale, actualDpr, renderProvides, refreshVersion]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  return /* @__PURE__ */ jsx(Fragment, { children: imageUrl && /* @__PURE__ */ jsx(
    "img",
    {
      src: imageUrl,
      onLoad: handleImageLoad,
      ...props,
      style: {
        width: "100%",
        height: "100%",
        ...style || {}
      }
    }
  ) });
}
export {
  RenderLayer,
  useRenderCapability,
  useRenderPlugin
};
//# sourceMappingURL=index.js.map
