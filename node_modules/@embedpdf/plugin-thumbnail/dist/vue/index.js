import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { ThumbnailPlugin } from "@embedpdf/plugin-thumbnail";
export * from "@embedpdf/plugin-thumbnail";
import { defineComponent, ref, watch, nextTick, openBlock, createElementBlock, mergeProps, createElementVNode, normalizeStyle, Fragment, renderList, renderSlot, createCommentVNode } from "vue";
import { ignore, PdfErrorCode } from "@embedpdf/models";
const useThumbnailPlugin = () => usePlugin(ThumbnailPlugin.id);
const useThumbnailCapability = () => useCapability(ThumbnailPlugin.id);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "thumbnails-pane",
  props: {
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const { plugin: thumbnailPlugin } = useThumbnailPlugin();
    const viewportRef = ref(null);
    const windowData = ref({ window: null, docId: null });
    const windowState = ref(null);
    watch(
      windowData,
      (data) => {
        windowState.value = data.docId === props.documentId ? data.window : null;
      },
      { deep: true }
    );
    watch(
      [() => thumbnailPlugin.value, () => props.documentId],
      ([plugin, docId], _, onCleanup) => {
        if (!plugin) {
          windowData.value = { window: null, docId: null };
          return;
        }
        const scope = plugin.provides().forDocument(docId);
        const initialWindow = scope.getWindow();
        if (initialWindow) {
          windowData.value = { window: initialWindow, docId };
        }
        const unsubscribe = scope.onWindow((newWindow) => {
          windowData.value = { window: newWindow, docId };
        });
        onCleanup(() => {
          unsubscribe();
          windowData.value = { window: null, docId: null };
        });
      },
      { immediate: true }
    );
    watch(
      [viewportRef, () => thumbnailPlugin.value, () => props.documentId],
      ([vp, plugin, docId], _, onCleanup) => {
        if (!vp || !plugin) return;
        const scope = plugin.provides().forDocument(docId);
        const onScroll = () => scope.updateWindow(vp.scrollTop, vp.clientHeight);
        vp.addEventListener("scroll", onScroll);
        const resizeObserver = new ResizeObserver(() => {
          scope.updateWindow(vp.scrollTop, vp.clientHeight);
        });
        resizeObserver.observe(vp);
        scope.updateWindow(vp.scrollTop, vp.clientHeight);
        onCleanup(() => {
          vp.removeEventListener("scroll", onScroll);
          resizeObserver.disconnect();
        });
      },
      { immediate: true }
    );
    watch(
      [viewportRef, () => thumbnailPlugin.value, () => props.documentId, windowState],
      ([vp, plugin, docId]) => {
        if (!vp || !plugin) return;
        const scope = plugin.provides().forDocument(docId);
        scope.updateWindow(vp.scrollTop, vp.clientHeight);
      }
    );
    watch(
      [viewportRef, () => thumbnailPlugin.value, () => props.documentId, () => !!windowState.value],
      ([vp, plugin, docId, window2], _, onCleanup) => {
        if (!vp || !plugin || !window2) return;
        const scope = plugin.provides().forDocument(docId);
        const unsubscribe = scope.onScrollTo(({ top, behavior }) => {
          nextTick(() => {
            vp.scrollTo({ top, behavior });
          });
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    const paddingY = ref(0);
    watch(
      () => thumbnailPlugin.value,
      (plugin) => {
        paddingY.value = (plugin == null ? void 0 : plugin.cfg.paddingY) ?? 0;
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      var _a, _b;
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "viewportRef",
        ref: viewportRef,
        style: {
          overflowY: "auto",
          position: "relative",
          paddingTop: `${paddingY.value}px`,
          paddingBottom: `${paddingY.value}px`,
          height: "100%"
        }
      }, _ctx.$attrs), [
        createElementVNode("div", {
          style: normalizeStyle({ height: `${((_a = windowState.value) == null ? void 0 : _a.totalHeight) ?? 0}px`, position: "relative" })
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(((_b = windowState.value) == null ? void 0 : _b.items) ?? [], (m) => {
            return renderSlot(_ctx.$slots, "default", {
              key: m.pageIndex,
              meta: m
            });
          }), 128))
        ], 4)
      ], 16);
    };
  }
});
const _hoisted_1 = ["src"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "thumbnail-img",
  props: {
    documentId: {},
    meta: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: thumbs } = useThumbnailCapability();
    const { plugin: thumbnailPlugin } = useThumbnailPlugin();
    const url = ref(null);
    let urlToRevoke = null;
    const refreshTick = ref(0);
    watch(
      [() => thumbnailPlugin.value, () => props.documentId, () => props.meta.pageIndex],
      ([plugin, docId, pageIdx], _, onCleanup) => {
        if (!plugin) return;
        const scope = plugin.provides().forDocument(docId);
        const unsubscribe = scope.onRefreshPages((pages) => {
          if (pages.includes(pageIdx)) {
            refreshTick.value++;
          }
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    function revoke() {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
        urlToRevoke = null;
      }
    }
    let abortTask = null;
    watch(
      [() => thumbs.value, () => props.documentId, () => props.meta.pageIndex, refreshTick],
      ([capability, docId, pageIdx], _, onCleanup) => {
        if (abortTask) {
          abortTask();
          abortTask = null;
        }
        if (!capability) {
          url.value = null;
          return;
        }
        const scope = capability.forDocument(docId);
        const task = scope.renderThumb(pageIdx, window.devicePixelRatio);
        abortTask = () => task.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled render task"
        });
        task.wait((blob) => {
          revoke();
          const objectUrl = URL.createObjectURL(blob);
          urlToRevoke = objectUrl;
          url.value = objectUrl;
          abortTask = null;
        }, ignore);
        onCleanup(() => {
          if (abortTask) {
            abortTask();
            abortTask = null;
          }
          revoke();
        });
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return url.value ? (openBlock(), createElementBlock("img", mergeProps({
        key: 0,
        src: url.value
      }, _ctx.$attrs, { onLoad: revoke }), null, 16, _hoisted_1)) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as ThumbImg,
  _sfc_main$1 as ThumbnailsPane,
  useThumbnailCapability,
  useThumbnailPlugin
};
//# sourceMappingURL=index.js.map
