import "preact";
import { useState, useEffect, useLayoutEffect } from "preact/hooks";
import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { ScrollPlugin, ScrollStrategy } from "@embedpdf/plugin-scroll";
export * from "@embedpdf/plugin-scroll";
import { jsxs, jsx } from "preact/jsx-runtime";
const useScrollPlugin = () => usePlugin(ScrollPlugin.id);
const useScrollCapability = () => useCapability(ScrollPlugin.id);
const useScroll = (documentId) => {
  const { provides } = useScrollCapability();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    if (!provides || !documentId) return;
    const scope = provides.forDocument(documentId);
    setCurrentPage(scope.getCurrentPage());
    setTotalPages(scope.getTotalPages());
    return provides.onPageChange((event) => {
      if (event.documentId === documentId) {
        setCurrentPage(event.pageNumber);
        setTotalPages(event.totalPages);
      }
    });
  }, [provides, documentId]);
  return {
    // New format (preferred)
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null,
    state: {
      currentPage,
      totalPages
    }
  };
};
function Scroller({ documentId, renderPage, ...props }) {
  const { plugin: scrollPlugin } = useScrollPlugin();
  const [layoutData, setLayoutData] = useState({ layout: null, docId: null });
  useEffect(() => {
    if (!scrollPlugin || !documentId) return;
    const unsubscribe = scrollPlugin.onScrollerData(documentId, (newLayout) => {
      setLayoutData({ layout: newLayout, docId: documentId });
    });
    return () => {
      unsubscribe();
      setLayoutData({ layout: null, docId: null });
      scrollPlugin.clearLayoutReady(documentId);
    };
  }, [scrollPlugin, documentId]);
  const scrollerLayout = layoutData.docId === documentId ? layoutData.layout : null;
  useLayoutEffect(() => {
    if (!scrollPlugin || !documentId || !scrollerLayout) return;
    scrollPlugin.setLayoutReady(documentId);
  }, [scrollPlugin, documentId, scrollerLayout]);
  if (!scrollerLayout) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...props,
      style: {
        width: `${scrollerLayout.totalWidth}px`,
        height: `${scrollerLayout.totalHeight}px`,
        position: "relative",
        boxSizing: "border-box",
        margin: "0 auto",
        ...scrollerLayout.strategy === ScrollStrategy.Horizontal && {
          display: "flex",
          flexDirection: "row"
        }
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              ...scrollerLayout.strategy === ScrollStrategy.Horizontal ? {
                width: scrollerLayout.startSpacing,
                height: "100%",
                flexShrink: 0
              } : {
                height: scrollerLayout.startSpacing,
                width: "100%"
              }
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              gap: scrollerLayout.pageGap,
              display: "flex",
              alignItems: "center",
              position: "relative",
              boxSizing: "border-box",
              ...scrollerLayout.strategy === ScrollStrategy.Horizontal ? {
                flexDirection: "row",
                minHeight: "100%"
              } : {
                flexDirection: "column",
                minWidth: "fit-content"
              }
            },
            children: scrollerLayout.items.map((item) => /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                  gap: scrollerLayout.pageGap
                },
                children: item.pageLayouts.map((layout) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      width: `${layout.rotatedWidth}px`,
                      height: `${layout.rotatedHeight}px`,
                      position: "relative",
                      zIndex: layout.elevated ? 1 : void 0
                    },
                    children: renderPage({
                      ...layout
                    })
                  },
                  layout.pageNumber
                ))
              },
              item.pageNumbers[0]
            ))
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              ...scrollerLayout.strategy === ScrollStrategy.Horizontal ? {
                width: scrollerLayout.endSpacing,
                height: "100%",
                flexShrink: 0
              } : {
                height: scrollerLayout.endSpacing,
                width: "100%"
              }
            }
          }
        )
      ]
    }
  );
}
export {
  Scroller,
  useScroll,
  useScrollCapability,
  useScrollPlugin
};
//# sourceMappingURL=index.js.map
