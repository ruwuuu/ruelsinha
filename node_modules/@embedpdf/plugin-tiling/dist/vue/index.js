import { defineComponent, ref, computed, watch, toRaw, onBeforeUnmount, openBlock, createElementBlock, normalizeStyle, createCommentVNode, normalizeProps, guardReactiveProps, Fragment, renderList, createBlock } from "vue";
import { ignore, PdfErrorCode } from "@embedpdf/models";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/vue";
import { TilingPlugin } from "@embedpdf/plugin-tiling";
export * from "@embedpdf/plugin-tiling";
const useTilingPlugin = () => usePlugin(TilingPlugin.id);
const useTilingCapability = () => useCapability(TilingPlugin.id);
const _hoisted_1 = ["src"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "tile-img",
  props: {
    documentId: {},
    pageIndex: {},
    tile: {},
    scale: {},
    dpr: { default: () => typeof window !== "undefined" ? window.devicePixelRatio : 1 }
  },
  setup(__props) {
    const props = __props;
    const { provides: tilingCapability } = useTilingCapability();
    const url = ref();
    const relScale = computed(() => props.scale / props.tile.srcScale);
    let lastRenderedId;
    let currentTask = null;
    watch(
      [() => props.tile.id, () => props.documentId, tilingCapability],
      ([tileId, docId, capability], [prevTileId, prevDocId]) => {
        if (!capability) return;
        const scope = capability.forDocument(docId);
        if (prevDocId !== void 0 && prevDocId !== docId) {
          if (url.value) {
            URL.revokeObjectURL(url.value);
            url.value = void 0;
          }
          if (currentTask) {
            currentTask.abort({ code: PdfErrorCode.Cancelled, message: "switching documents" });
            currentTask = null;
          }
          lastRenderedId = void 0;
        }
        if (lastRenderedId === tileId && prevDocId === docId) return;
        if (currentTask) {
          currentTask.abort({ code: PdfErrorCode.Cancelled, message: "switching tiles" });
          currentTask = null;
        }
        if (url.value) {
          URL.revokeObjectURL(url.value);
          url.value = void 0;
        }
        lastRenderedId = tileId;
        currentTask = scope.renderTile({
          pageIndex: props.pageIndex,
          tile: toRaw(props.tile),
          dpr: props.dpr
        });
        currentTask.wait((blob) => {
          url.value = URL.createObjectURL(blob);
          currentTask = null;
        }, ignore);
      },
      { immediate: true }
    );
    onBeforeUnmount(() => {
      if (currentTask) {
        currentTask.abort({ code: PdfErrorCode.Cancelled, message: "unmounting" });
      }
      if (url.value) {
        URL.revokeObjectURL(url.value);
      }
    });
    return (_ctx, _cache) => {
      return url.value ? (openBlock(), createElementBlock("img", {
        key: 0,
        src: url.value,
        style: normalizeStyle({
          position: "absolute",
          left: `${__props.tile.screenRect.origin.x * relScale.value}px`,
          top: `${__props.tile.screenRect.origin.y * relScale.value}px`,
          width: `${__props.tile.screenRect.size.width * relScale.value}px`,
          height: `${__props.tile.screenRect.size.height * relScale.value}px`,
          display: "block"
        })
      }, null, 12, _hoisted_1)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tiling-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: tilingProvides } = useTilingCapability();
    const documentState = useDocumentState(() => props.documentId);
    const tiles = ref([]);
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    watch(
      [tilingProvides, () => props.documentId, () => props.pageIndex],
      ([provides, docId, pageIdx], _, onCleanup) => {
        if (!provides) {
          tiles.value = [];
          return;
        }
        const unsubscribe = provides.onTileRendering((event) => {
          if (event.documentId === docId) {
            tiles.value = event.tiles[pageIdx] ?? [];
          }
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", normalizeProps(guardReactiveProps(_ctx.$attrs)), [
        (openBlock(true), createElementBlock(Fragment, null, renderList(tiles.value, (tile) => {
          return openBlock(), createBlock(_sfc_main$1, {
            key: tile.id,
            documentId: __props.documentId,
            pageIndex: __props.pageIndex,
            tile,
            scale: actualScale.value
          }, null, 8, ["documentId", "pageIndex", "tile", "scale"]);
        }), 128))
      ], 16);
    };
  }
});
export {
  _sfc_main$1 as TileImg,
  _sfc_main as TilingLayer,
  useTilingCapability,
  useTilingPlugin
};
//# sourceMappingURL=index.js.map
