import { ref, watch, toValue, computed, defineComponent, openBlock, createElementBlock, mergeProps, unref, createElementVNode, normalizeStyle, Fragment, renderList, renderSlot, createCommentVNode } from "vue";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { ScrollPlugin, ScrollStrategy } from "@embedpdf/plugin-scroll";
export * from "@embedpdf/plugin-scroll";
const useScrollPlugin = () => usePlugin(ScrollPlugin.id);
const useScrollCapability = () => useCapability(ScrollPlugin.id);
function useScroll(documentId) {
  const { provides } = useScrollCapability();
  const currentPage = ref(1);
  const totalPages = ref(1);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue || !docId) {
        currentPage.value = 1;
        totalPages.value = 1;
        return;
      }
      const scope = providesValue.forDocument(docId);
      currentPage.value = scope.getCurrentPage();
      totalPages.value = scope.getTotalPages();
      const unsubscribe = providesValue.onPageChange((event) => {
        if (event.documentId === docId) {
          currentPage.value = event.pageNumber;
          totalPages.value = event.totalPages;
        }
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  const state = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value
  }));
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    provides: scopedProvides,
    state
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "scroller",
  props: {
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const { plugin: scrollPlugin } = useScrollPlugin();
    const layoutData = ref({ layout: null, docId: null });
    watch(
      [scrollPlugin, () => props.documentId],
      ([plugin, docId], _, onCleanup) => {
        if (!plugin || !docId) {
          layoutData.value = { layout: null, docId: null };
          return;
        }
        const unsubscribe = plugin.onScrollerData(docId, (newLayout) => {
          layoutData.value = { layout: newLayout, docId };
        });
        onCleanup(() => {
          unsubscribe();
          layoutData.value = { layout: null, docId: null };
          plugin.clearLayoutReady(docId);
        });
      },
      {
        immediate: true
      }
    );
    const scrollerLayout = computed(() => {
      return layoutData.value.docId === props.documentId ? layoutData.value.layout : null;
    });
    watch(
      [scrollPlugin, () => props.documentId, scrollerLayout],
      ([plugin, docId, layout]) => {
        if (!plugin || !docId || !layout) return;
        plugin.setLayoutReady(docId);
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return scrollerLayout.value ? (openBlock(), createElementBlock("div", mergeProps({
        key: 0,
        style: {
          width: `${scrollerLayout.value.totalWidth}px`,
          height: `${scrollerLayout.value.totalHeight}px`,
          position: "relative",
          boxSizing: "border-box",
          margin: "0 auto",
          ...scrollerLayout.value.strategy === unref(ScrollStrategy).Horizontal && {
            display: "flex",
            flexDirection: "row"
          }
        }
      }, _ctx.$attrs), [
        createElementVNode("div", {
          style: normalizeStyle(
            scrollerLayout.value.strategy === unref(ScrollStrategy).Horizontal ? {
              width: `${scrollerLayout.value.startSpacing}px`,
              height: "100%",
              flexShrink: 0
            } : {
              height: `${scrollerLayout.value.startSpacing}px`,
              width: "100%"
            }
          )
        }, null, 4),
        createElementVNode("div", {
          style: normalizeStyle({
            gap: `${scrollerLayout.value.pageGap}px`,
            display: "flex",
            alignItems: "center",
            position: "relative",
            boxSizing: "border-box",
            ...scrollerLayout.value.strategy === unref(ScrollStrategy).Horizontal ? {
              flexDirection: "row",
              minHeight: "100%"
            } : {
              flexDirection: "column",
              minWidth: "fit-content"
            }
          })
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(scrollerLayout.value.items, (item) => {
            return openBlock(), createElementBlock("div", {
              key: item.pageNumbers[0],
              style: normalizeStyle({
                display: "flex",
                justifyContent: "center",
                gap: `${scrollerLayout.value.pageGap}px`
              })
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(item.pageLayouts, (layout) => {
                return openBlock(), createElementBlock("div", {
                  key: layout.pageNumber,
                  style: normalizeStyle({
                    width: `${layout.rotatedWidth}px`,
                    height: `${layout.rotatedHeight}px`,
                    position: "relative",
                    zIndex: layout.elevated ? 1 : void 0
                  })
                }, [
                  renderSlot(_ctx.$slots, "default", { page: layout })
                ], 4);
              }), 128))
            ], 4);
          }), 128))
        ], 4),
        createElementVNode("div", {
          style: normalizeStyle(
            scrollerLayout.value.strategy === unref(ScrollStrategy).Horizontal ? {
              width: `${scrollerLayout.value.endSpacing}px`,
              height: "100%",
              flexShrink: 0
            } : {
              height: `${scrollerLayout.value.endSpacing}px`,
              width: "100%"
            }
          )
        }, null, 4)
      ], 16)) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as Scroller,
  useScroll,
  useScrollCapability,
  useScrollPlugin
};
//# sourceMappingURL=index.js.map
