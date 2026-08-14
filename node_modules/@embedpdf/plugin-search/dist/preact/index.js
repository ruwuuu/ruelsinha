import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/preact";
import { initialSearchDocumentState, SearchPlugin } from "@embedpdf/plugin-search";
export * from "@embedpdf/plugin-search";
import "preact";
import { useState, useMemo, useEffect } from "preact/hooks";
import { jsx } from "preact/jsx-runtime";
const useSearchPlugin = () => usePlugin(SearchPlugin.id);
const useSearchCapability = () => useCapability(SearchPlugin.id);
const useSearch = (documentId) => {
  const { provides } = useSearchCapability();
  const [searchState, setSearchState] = useState(initialSearchDocumentState);
  const scope = useMemo(() => provides == null ? void 0 : provides.forDocument(documentId), [provides, documentId]);
  useEffect(() => {
    if (!scope) {
      setSearchState(initialSearchDocumentState);
      return;
    }
    setSearchState(scope.getState());
    return scope.onStateChange((state) => setSearchState(state));
  }, [scope]);
  return {
    state: searchState,
    provides: scope ?? null
  };
};
function SearchLayer({
  documentId,
  pageIndex,
  scale: scaleOverride,
  style,
  highlightColor = "#FFFF00",
  activeHighlightColor = "#FFBF00",
  ...props
}) {
  const { provides: searchProvides } = useSearchCapability();
  const [searchResultState, setSearchResultState] = useState(null);
  const documentState = useDocumentState(documentId);
  const scope = useMemo(
    () => searchProvides == null ? void 0 : searchProvides.forDocument(documentId),
    [searchProvides, documentId]
  );
  const actualScale = useMemo(() => {
    if (scaleOverride !== void 0) return scaleOverride;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scaleOverride, documentState == null ? void 0 : documentState.scale]);
  useEffect(() => {
    if (!scope) {
      setSearchResultState(null);
      return;
    }
    const currentState = scope.getState();
    setSearchResultState({
      results: currentState.results,
      activeResultIndex: currentState.activeResultIndex,
      showAllResults: currentState.showAllResults,
      active: currentState.active
    });
    return scope.onSearchResultStateChange((state) => {
      setSearchResultState(state);
    });
  }, [scope]);
  if (!searchResultState || !searchResultState.active) {
    return null;
  }
  const pageResults = searchResultState.results.map((result, originalIndex) => ({ result, originalIndex })).filter(({ result }) => result.pageIndex === pageIndex);
  const resultsToShow = pageResults.filter(
    ({ originalIndex }) => searchResultState.showAllResults || originalIndex === searchResultState.activeResultIndex
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        ...style,
        pointerEvents: "none"
      },
      ...props,
      children: resultsToShow.map(
        ({ result, originalIndex }) => result.rects.map((rect, rectIndex) => /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: rect.origin.y * actualScale,
              left: rect.origin.x * actualScale,
              width: rect.size.width * actualScale,
              height: rect.size.height * actualScale,
              backgroundColor: originalIndex === searchResultState.activeResultIndex ? activeHighlightColor : highlightColor,
              mixBlendMode: "multiply",
              transform: "scale(1.02)",
              transformOrigin: "center",
              transition: "opacity .3s ease-in-out",
              opacity: 1
            }
          },
          `${originalIndex}-${rectIndex}`
        ))
      )
    }
  );
}
export {
  SearchLayer,
  useSearch,
  useSearchCapability,
  useSearchPlugin
};
//# sourceMappingURL=index.js.map
