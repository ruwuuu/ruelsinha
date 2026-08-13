import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { ThumbnailPlugin } from "@embedpdf/plugin-thumbnail";
export * from "@embedpdf/plugin-thumbnail";
import { jsx } from "preact/jsx-runtime";
import "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import { ignore, PdfErrorCode } from "@embedpdf/models";
const useThumbnailPlugin = () => usePlugin(ThumbnailPlugin.id);
const useThumbnailCapability = () => useCapability(ThumbnailPlugin.id);
function ThumbnailsPane({ documentId, style, children, ...props }) {
  const { plugin: thumbnailPlugin } = useThumbnailPlugin();
  const viewportRef = useRef(null);
  const [windowData, setWindowData] = useState({ window: null, docId: null });
  const window2 = windowData.docId === documentId ? windowData.window : null;
  useEffect(() => {
    if (!thumbnailPlugin) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    const initialWindow = scope.getWindow();
    if (initialWindow) {
      setWindowData({ window: initialWindow, docId: documentId });
    }
    const unsubscribe = scope.onWindow((newWindow) => {
      setWindowData({ window: newWindow, docId: documentId });
    });
    return () => {
      unsubscribe();
      setWindowData({ window: null, docId: null });
    };
  }, [thumbnailPlugin, documentId]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !thumbnailPlugin) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    const onScroll = () => scope.updateWindow(vp.scrollTop, vp.clientHeight);
    vp.addEventListener("scroll", onScroll);
    return () => vp.removeEventListener("scroll", onScroll);
  }, [thumbnailPlugin, documentId]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !thumbnailPlugin) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    const resizeObserver = new ResizeObserver(() => {
      scope.updateWindow(vp.scrollTop, vp.clientHeight);
    });
    resizeObserver.observe(vp);
    return () => resizeObserver.disconnect();
  }, [thumbnailPlugin, documentId]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !thumbnailPlugin) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    scope.updateWindow(vp.scrollTop, vp.clientHeight);
  }, [window2, thumbnailPlugin, documentId]);
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !thumbnailPlugin || !window2) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    return scope.onScrollTo(({ top, behavior }) => {
      vp.scrollTo({ top, behavior });
    });
  }, [thumbnailPlugin, documentId, !!window2]);
  const paddingY = (thumbnailPlugin == null ? void 0 : thumbnailPlugin.cfg.paddingY) ?? 0;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: viewportRef,
      style: {
        overflowY: "auto",
        position: "relative",
        paddingTop: paddingY,
        paddingBottom: paddingY,
        height: "100%",
        ...style
      },
      ...props,
      children: /* @__PURE__ */ jsx("div", { style: { height: (window2 == null ? void 0 : window2.totalHeight) ?? 0, position: "relative" }, children: window2 == null ? void 0 : window2.items.map((m) => children(m)) })
    }
  );
}
function ThumbImg({ documentId, meta, style, ...props }) {
  const { provides: thumbs } = useThumbnailCapability();
  const { plugin: thumbnailPlugin } = useThumbnailPlugin();
  const [url, setUrl] = useState();
  const urlRef = useRef(null);
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    if (!thumbnailPlugin) return;
    const scope = thumbnailPlugin.provides().forDocument(documentId);
    return scope.onRefreshPages((pages) => {
      if (pages.includes(meta.pageIndex)) {
        setRefreshTick((tick) => tick + 1);
      }
    });
  }, [thumbnailPlugin, documentId, meta.pageIndex]);
  useEffect(() => {
    const scope = thumbs == null ? void 0 : thumbs.forDocument(documentId);
    const task = scope == null ? void 0 : scope.renderThumb(meta.pageIndex, window.devicePixelRatio);
    task == null ? void 0 : task.wait((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
    }, ignore);
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      } else {
        task == null ? void 0 : task.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled render task"
        });
      }
    };
  }, [thumbs, documentId, meta.pageIndex, refreshTick]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  return url ? /* @__PURE__ */ jsx("img", { src: url, onLoad: handleImageLoad, style, ...props }) : null;
}
export {
  ThumbImg,
  ThumbnailsPane,
  useThumbnailCapability,
  useThumbnailPlugin
};
//# sourceMappingURL=index.js.map
