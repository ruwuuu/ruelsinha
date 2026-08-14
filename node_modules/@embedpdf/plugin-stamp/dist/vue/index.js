import { createPluginPackage } from "@embedpdf/core";
import { StampPlugin, StampPluginPackage as StampPluginPackage$1 } from "@embedpdf/plugin-stamp";
export * from "@embedpdf/plugin-stamp";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { ref, watch, toValue, defineComponent, openBlock, createElementBlock, mergeProps, createCommentVNode } from "vue";
import { ignore, PdfErrorCode } from "@embedpdf/models";
const useStampPlugin = () => usePlugin(StampPlugin.id);
const useStampCapability = () => useCapability(StampPlugin.id);
const useStampLibraries = () => {
  const { provides } = useStampCapability();
  const libraries = ref([]);
  watch(
    provides,
    (capability, _, onCleanup) => {
      if (!capability) {
        libraries.value = [];
        return;
      }
      libraries.value = capability.getLibraries();
      const unsubscribe = capability.onLibraryChange((libs) => {
        libraries.value = libs;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return { libraries };
};
const useStampsByCategory = (category) => {
  const { provides } = useStampCapability();
  const stamps = ref([]);
  watch(
    [provides, () => toValue(category)],
    ([capability, cat], _, onCleanup) => {
      if (!capability) {
        stamps.value = [];
        return;
      }
      stamps.value = capability.getStampsByCategory(cat);
      const unsubscribe = capability.onLibraryChange(() => {
        stamps.value = capability.getStampsByCategory(cat);
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return stamps;
};
const useStampsByLibrary = (libraryId, category) => {
  const { provides } = useStampCapability();
  const stamps = ref([]);
  watch(
    [provides, () => toValue(libraryId), () => toValue(category)],
    ([capability, libId, cat], _, onCleanup) => {
      if (!capability) {
        stamps.value = [];
        return;
      }
      const derive = () => {
        var _a, _b;
        const libraries = capability.getLibraries();
        const results = [];
        for (const library of libraries) {
          if (libId && libId !== "all" && library.id !== libId) continue;
          for (const stamp of library.stamps) {
            if (cat) {
              const libraryMatches = ((_a = library.categories) == null ? void 0 : _a.includes(cat)) ?? false;
              const stampMatches = ((_b = stamp.categories) == null ? void 0 : _b.includes(cat)) ?? false;
              if (!libraryMatches && !stampMatches) continue;
            }
            results.push({ library, stamp });
          }
        }
        stamps.value = results;
      };
      derive();
      const unsubscribe = capability.onLibraryChange(derive);
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return stamps;
};
const useActiveStamp = (documentId) => {
  const { provides } = useStampCapability();
  const activeStamp = ref(null);
  watch(
    [provides, () => toValue(documentId)],
    ([capability, docId], _, onCleanup) => {
      if (!capability || !docId) {
        activeStamp.value = null;
        return;
      }
      const scope = capability.forDocument(docId);
      activeStamp.value = scope.getActiveStamp();
      const unsubscribe = scope.onActiveStampChange((stamp) => {
        activeStamp.value = stamp;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return activeStamp;
};
const _hoisted_1 = ["src"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "stamp-img",
  props: {
    libraryId: {},
    pageIndex: {},
    width: {},
    dpr: {}
  },
  setup(__props) {
    const props = __props;
    const { provides } = useStampCapability();
    const url = ref(null);
    let urlToRevoke = null;
    function revoke() {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
        urlToRevoke = null;
      }
    }
    let abortTask = null;
    watch(
      [
        () => provides.value,
        () => props.libraryId,
        () => props.pageIndex,
        () => props.width,
        () => props.dpr
      ],
      ([capability, libraryId, pageIndex, width, dpr], _, onCleanup) => {
        if (abortTask) {
          abortTask();
          abortTask = null;
        }
        if (!capability) {
          url.value = null;
          return;
        }
        const task = capability.renderStamp(
          libraryId,
          pageIndex,
          width,
          dpr ?? window.devicePixelRatio
        );
        abortTask = () => task.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled stamp render task"
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
const StampPluginPackage = createPluginPackage(StampPluginPackage$1).build();
export {
  _sfc_main as StampImg,
  StampPluginPackage,
  useActiveStamp,
  useStampCapability,
  useStampLibraries,
  useStampPlugin,
  useStampsByCategory,
  useStampsByLibrary
};
//# sourceMappingURL=index.js.map
