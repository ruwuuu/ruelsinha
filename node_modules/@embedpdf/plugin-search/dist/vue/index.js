import { ref, watch, toValue, computed, defineComponent, openBlock, createElementBlock, mergeProps, Fragment, renderList, normalizeStyle, createCommentVNode } from "vue";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/vue";
import { SearchPlugin, initialSearchDocumentState } from "@embedpdf/plugin-search";
export * from "@embedpdf/plugin-search";
const useSearchPlugin = () => usePlugin(SearchPlugin.id);
const useSearchCapability = () => useCapability(SearchPlugin.id);
const useSearch = (documentId) => {
  const { provides } = useSearchCapability();
  const searchState = ref(initialSearchDocumentState);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        searchState.value = initialSearchDocumentState;
        return;
      }
      const scope = providesValue.forDocument(docId);
      searchState.value = scope.getState();
      const unsubscribe = scope.onStateChange((state) => {
        searchState.value = state;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    state: searchState,
    provides: scopedProvides
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "search-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    highlightColor: { default: "#FFFF00" },
    activeHighlightColor: { default: "#FFBF00" }
  },
  setup(__props) {
    const props = __props;
    const { provides: searchProvides } = useSearchCapability();
    const documentState = useDocumentState(() => props.documentId);
    const searchResultState = ref(null);
    const scope = computed(() => {
      var _a;
      return ((_a = searchProvides.value) == null ? void 0 : _a.forDocument(props.documentId)) ?? null;
    });
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    watch(
      scope,
      (scopeValue, _, onCleanup) => {
        if (!scopeValue) {
          searchResultState.value = null;
          return;
        }
        const currentState = scopeValue.getState();
        searchResultState.value = {
          results: currentState.results,
          activeResultIndex: currentState.activeResultIndex,
          showAllResults: currentState.showAllResults,
          active: currentState.active
        };
        const unsubscribe = scopeValue.onSearchResultStateChange((state) => {
          searchResultState.value = state;
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    const pageResults = computed(() => {
      if (!searchResultState.value) return [];
      return searchResultState.value.results.map((result, originalIndex) => ({ result, originalIndex })).filter(({ result }) => result.pageIndex === props.pageIndex);
    });
    const resultsToShow = computed(() => {
      if (!searchResultState.value) return [];
      return pageResults.value.filter(
        ({ originalIndex }) => searchResultState.value.showAllResults || originalIndex === searchResultState.value.activeResultIndex
      );
    });
    return (_ctx, _cache) => {
      return searchResultState.value && searchResultState.value.active ? (openBlock(), createElementBlock("div", mergeProps({
        key: 0,
        style: {
          pointerEvents: "none"
        }
      }, _ctx.$attrs), [
        (openBlock(true), createElementBlock(Fragment, null, renderList(resultsToShow.value, ({ result, originalIndex }, idx) => {
          return openBlock(), createElementBlock(Fragment, {
            key: `result-${idx}`
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(result.rects, (rect, rectIdx) => {
              return openBlock(), createElementBlock("div", {
                key: `rect-${idx}-${rectIdx}`,
                style: normalizeStyle({
                  position: "absolute",
                  top: `${rect.origin.y * actualScale.value}px`,
                  left: `${rect.origin.x * actualScale.value}px`,
                  width: `${rect.size.width * actualScale.value}px`,
                  height: `${rect.size.height * actualScale.value}px`,
                  backgroundColor: originalIndex === searchResultState.value.activeResultIndex ? __props.activeHighlightColor : __props.highlightColor,
                  mixBlendMode: "multiply",
                  transform: "scale(1.02)",
                  transformOrigin: "center",
                  transition: "opacity .3s ease-in-out",
                  opacity: 1
                })
              }, null, 4);
            }), 128))
          ], 64);
        }), 128))
      ], 16)) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as SearchLayer,
  useSearch,
  useSearchCapability,
  useSearchPlugin
};
//# sourceMappingURL=index.js.map
