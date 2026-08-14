import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/preact";
import { TilingPlugin } from "@embedpdf/plugin-tiling";
export * from "@embedpdf/plugin-tiling";
import { jsx } from "preact/jsx-runtime";
import "preact";
import { useMemo, useState, useRef, useEffect } from "preact/hooks";
import { ignore, PdfErrorCode } from "@embedpdf/models";
const useTilingPlugin = () => usePlugin(TilingPlugin.id);
const useTilingCapability = () => useCapability(TilingPlugin.id);
function TileImg({ documentId, pageIndex, tile, dpr, scale }) {
  const { provides: tilingCapability } = useTilingCapability();
  const scope = useMemo(
    () => tilingCapability == null ? void 0 : tilingCapability.forDocument(documentId),
    [tilingCapability, documentId]
  );
  const [url, setUrl] = useState();
  const urlRef = useRef(null);
  const relativeScale = scale / tile.srcScale;
  useEffect(() => {
    if (tile.status === "ready" && urlRef.current) return;
    if (!scope) return;
    const task = scope.renderTile({ pageIndex, tile, dpr });
    task.wait((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
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
  }, [scope, pageIndex, tile.id]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  if (!url) return null;
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: url,
      onLoad: handleImageLoad,
      style: {
        position: "absolute",
        left: tile.screenRect.origin.x * relativeScale,
        top: tile.screenRect.origin.y * relativeScale,
        width: tile.screenRect.size.width * relativeScale,
        height: tile.screenRect.size.height * relativeScale,
        display: "block"
      }
    }
  );
}
function TilingLayer({
  documentId,
  pageIndex,
  scale: scaleOverride,
  style,
  ...props
}) {
  const { provides: tilingProvides } = useTilingCapability();
  const documentState = useDocumentState(documentId);
  const [tiles, setTiles] = useState([]);
  useEffect(() => {
    if (tilingProvides) {
      return tilingProvides.onTileRendering((event) => {
        if (event.documentId === documentId) {
          setTiles(event.tiles[pageIndex] ?? []);
        }
      });
    }
  }, [tilingProvides, documentId, pageIndex]);
  const actualScale = useMemo(() => {
    if (scaleOverride !== void 0) return scaleOverride;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scaleOverride, documentState == null ? void 0 : documentState.scale]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        ...style
      },
      ...props,
      children: tiles == null ? void 0 : tiles.map((tile) => /* @__PURE__ */ jsx(
        TileImg,
        {
          documentId,
          pageIndex,
          tile,
          dpr: window.devicePixelRatio,
          scale: actualScale
        },
        tile.id
      ))
    }
  );
}
export {
  TilingLayer,
  useTilingCapability,
  useTilingPlugin
};
//# sourceMappingURL=index.js.map
