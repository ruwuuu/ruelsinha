import { jsx } from "preact/jsx-runtime";
import { createContext } from "preact";
import { useState, useEffect, useContext, useRef, useLayoutEffect } from "preact/hooks";
import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { ViewportPlugin } from "@embedpdf/plugin-viewport";
export * from "@embedpdf/plugin-viewport";
const ViewportElementContext = createContext(null);
const useViewportPlugin = () => usePlugin(ViewportPlugin.id);
const useViewportCapability = () => useCapability(ViewportPlugin.id);
const useViewportElement = () => {
  return useContext(ViewportElementContext);
};
const useIsViewportGated = (documentId) => {
  const { provides } = useViewportCapability();
  const [isGated, setIsGated] = useState((provides == null ? void 0 : provides.isGated(documentId)) ?? false);
  useEffect(() => {
    if (!provides) return;
    setIsGated(provides.isGated(documentId));
    return provides.onGateChange((event) => {
      if (event.documentId === documentId) {
        setIsGated(event.isGated);
      }
    });
  }, [provides, documentId]);
  return isGated;
};
const useViewportScrollActivity = (documentId) => {
  const { provides } = useViewportCapability();
  const [scrollActivity, setScrollActivity] = useState({
    isScrolling: false,
    isSmoothScrolling: false
  });
  useEffect(() => {
    if (!provides) return;
    return provides.onScrollActivity((event) => {
      if (event.documentId === documentId) {
        setScrollActivity(event.activity);
      }
    });
  }, [provides, documentId]);
  return scrollActivity;
};
function useViewportRef(documentId) {
  const { plugin: viewportPlugin } = useViewportPlugin();
  const containerRef = useRef(null);
  useLayoutEffect(() => {
    if (!viewportPlugin) return;
    const container = containerRef.current;
    if (!container) return;
    try {
      viewportPlugin.registerViewport(documentId);
    } catch (error) {
      console.error(`Failed to register viewport for document ${documentId}:`, error);
      return;
    }
    const onScroll = () => {
      viewportPlugin.setViewportScrollMetrics(documentId, {
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft
      });
    };
    container.addEventListener("scroll", onScroll);
    const resizeObserver = new ResizeObserver(() => {
      viewportPlugin.setViewportResizeMetrics(documentId, {
        width: container.offsetWidth,
        height: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        clientLeft: container.clientLeft,
        clientTop: container.clientTop
      });
    });
    resizeObserver.observe(container);
    const unsubscribeScrollRequest = viewportPlugin.onScrollRequest(
      documentId,
      ({ x, y, behavior = "auto" }) => {
        requestAnimationFrame(() => {
          container.scrollTo({ left: x, top: y, behavior });
        });
      }
    );
    return () => {
      viewportPlugin.unregisterViewport(documentId);
      resizeObserver.disconnect();
      container.removeEventListener("scroll", onScroll);
      unsubscribeScrollRequest();
    };
  }, [viewportPlugin, documentId]);
  return containerRef;
}
function Viewport({ children, documentId, ...props }) {
  const [viewportGap, setViewportGap] = useState(0);
  const viewportRef = useViewportRef(documentId);
  const { provides: viewportProvides } = useViewportCapability();
  const isGated = useIsViewportGated(documentId);
  useEffect(() => {
    if (viewportProvides) {
      setViewportGap(viewportProvides.getViewportGap());
    }
  }, [viewportProvides]);
  const { style, ...restProps } = props;
  return /* @__PURE__ */ jsx(ViewportElementContext.Provider, { value: viewportRef, children: /* @__PURE__ */ jsx(
    "div",
    {
      ...restProps,
      ref: viewportRef,
      style: {
        width: "100%",
        height: "100%",
        overflow: "auto",
        ...typeof style === "object" ? style : {},
        padding: `${viewportGap}px`
      },
      children: !isGated && children
    }
  ) });
}
export {
  Viewport,
  ViewportElementContext,
  useIsViewportGated,
  useViewportCapability,
  useViewportElement,
  useViewportPlugin,
  useViewportRef,
  useViewportScrollActivity
};
//# sourceMappingURL=index.js.map
