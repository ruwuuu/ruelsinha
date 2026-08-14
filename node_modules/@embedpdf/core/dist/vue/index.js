import { inject, computed, toValue, shallowRef, ref, onMounted, watch, onBeforeUnmount, defineComponent, resolveComponent, openBlock, createBlock, resolveDynamicComponent, withCtx, renderSlot, createElementBlock, Fragment, renderList, provide } from "vue";
import { PdfPermissionFlag } from "@embedpdf/models";
import { hasAutoMountElements, PluginRegistry } from "@embedpdf/core";
const pdfKey = Symbol("pdfKey");
function useRegistry() {
  const ctx = inject(pdfKey);
  if (!ctx) throw new Error("useRegistry must be used inside <EmbedPDF>");
  return ctx;
}
function useCoreState() {
  const { coreState } = useRegistry();
  return coreState;
}
function useDocumentState(documentId) {
  const coreState = useCoreState();
  const documentState = computed(() => {
    const core = coreState.value;
    const docId = toValue(documentId);
    if (!core || !docId) return null;
    return core.documents[docId] ?? null;
  });
  return documentState;
}
({
  print: PdfPermissionFlag.Print,
  modifyContents: PdfPermissionFlag.ModifyContents,
  copyContents: PdfPermissionFlag.CopyContents,
  modifyAnnotations: PdfPermissionFlag.ModifyAnnotations,
  fillForms: PdfPermissionFlag.FillForms,
  extractForAccessibility: PdfPermissionFlag.ExtractForAccessibility,
  assembleDocument: PdfPermissionFlag.AssembleDocument,
  printHighQuality: PdfPermissionFlag.PrintHighQuality
});
const ALL_PERMISSION_FLAGS = [
  PdfPermissionFlag.Print,
  PdfPermissionFlag.ModifyContents,
  PdfPermissionFlag.CopyContents,
  PdfPermissionFlag.ModifyAnnotations,
  PdfPermissionFlag.FillForms,
  PdfPermissionFlag.ExtractForAccessibility,
  PdfPermissionFlag.AssembleDocument,
  PdfPermissionFlag.PrintHighQuality
];
const PERMISSION_FLAG_TO_NAME = {
  [PdfPermissionFlag.Print]: "print",
  [PdfPermissionFlag.ModifyContents]: "modifyContents",
  [PdfPermissionFlag.CopyContents]: "copyContents",
  [PdfPermissionFlag.ModifyAnnotations]: "modifyAnnotations",
  [PdfPermissionFlag.FillForms]: "fillForms",
  [PdfPermissionFlag.ExtractForAccessibility]: "extractForAccessibility",
  [PdfPermissionFlag.AssembleDocument]: "assembleDocument",
  [PdfPermissionFlag.PrintHighQuality]: "printHighQuality"
};
function getPermissionOverride(overrides, flag) {
  if (!overrides) return void 0;
  if (flag in overrides) {
    return overrides[flag];
  }
  const name = PERMISSION_FLAG_TO_NAME[flag];
  if (name && name in overrides) {
    return overrides[name];
  }
  return void 0;
}
function getEffectivePermission(state, documentId, flag) {
  var _a;
  const docState = state.documents[documentId];
  const docConfig = docState == null ? void 0 : docState.permissions;
  const globalConfig = state.globalPermissions;
  const pdfPermissions = ((_a = docState == null ? void 0 : docState.document) == null ? void 0 : _a.permissions) ?? PdfPermissionFlag.AllowAll;
  const docOverride = getPermissionOverride(docConfig == null ? void 0 : docConfig.overrides, flag);
  if (docOverride !== void 0) {
    return docOverride;
  }
  const globalOverride = getPermissionOverride(globalConfig == null ? void 0 : globalConfig.overrides, flag);
  if (globalOverride !== void 0) {
    return globalOverride;
  }
  const enforce = (docConfig == null ? void 0 : docConfig.enforceDocumentPermissions) ?? (globalConfig == null ? void 0 : globalConfig.enforceDocumentPermissions) ?? true;
  if (!enforce) return true;
  return (pdfPermissions & flag) !== 0;
}
function getEffectivePermissions(state, documentId) {
  return ALL_PERMISSION_FLAGS.reduce((acc, flag) => {
    return getEffectivePermission(state, documentId, flag) ? acc | flag : acc;
  }, 0);
}
function useDocumentPermissions(documentId) {
  const coreState = useCoreState();
  return computed(() => {
    var _a, _b;
    const docId = toValue(documentId);
    const state = coreState.value;
    if (!state) {
      return {
        permissions: PdfPermissionFlag.AllowAll,
        pdfPermissions: PdfPermissionFlag.AllowAll,
        hasPermission: () => true,
        hasAllPermissions: () => true,
        canPrint: true,
        canModifyContents: true,
        canCopyContents: true,
        canModifyAnnotations: true,
        canFillForms: true,
        canExtractForAccessibility: true,
        canAssembleDocument: true,
        canPrintHighQuality: true
      };
    }
    const effectivePermissions = getEffectivePermissions(state, docId);
    const pdfPermissions = ((_b = (_a = state.documents[docId]) == null ? void 0 : _a.document) == null ? void 0 : _b.permissions) ?? PdfPermissionFlag.AllowAll;
    const hasPermission = (flag) => getEffectivePermission(state, docId, flag);
    const hasAllPermissions = (...flags) => flags.every((flag) => getEffectivePermission(state, docId, flag));
    return {
      permissions: effectivePermissions,
      pdfPermissions,
      hasPermission,
      hasAllPermissions,
      canPrint: hasPermission(PdfPermissionFlag.Print),
      canModifyContents: hasPermission(PdfPermissionFlag.ModifyContents),
      canCopyContents: hasPermission(PdfPermissionFlag.CopyContents),
      canModifyAnnotations: hasPermission(PdfPermissionFlag.ModifyAnnotations),
      canFillForms: hasPermission(PdfPermissionFlag.FillForms),
      canExtractForAccessibility: hasPermission(PdfPermissionFlag.ExtractForAccessibility),
      canAssembleDocument: hasPermission(PdfPermissionFlag.AssembleDocument),
      canPrintHighQuality: hasPermission(PdfPermissionFlag.PrintHighQuality)
    };
  });
}
function usePlugin(pluginId) {
  const { registry } = useRegistry();
  const plugin = shallowRef(null);
  const isLoading = ref(true);
  const ready = ref(new Promise(() => {
  }));
  const load = () => {
    var _a;
    if (!registry.value) return;
    const p = registry.value.getPlugin(pluginId);
    if (!p) throw new Error(`Plugin ${pluginId} not found`);
    plugin.value = p;
    isLoading.value = false;
    ready.value = ((_a = p.ready) == null ? void 0 : _a.call(p)) ?? Promise.resolve();
  };
  onMounted(load);
  watch(registry, load);
  return { plugin, isLoading, ready };
}
function useCapability(pluginId) {
  const { plugin, isLoading, ready } = usePlugin(pluginId);
  const provides = computed(() => {
    if (!plugin.value) return null;
    if (!plugin.value.provides) {
      throw new Error(`Plugin ${pluginId} does not implement provides()`);
    }
    return plugin.value.provides();
  });
  return { provides, isLoading, ready };
}
function useStoreState() {
  const { registry } = useRegistry();
  const state = ref();
  function attach() {
    if (!registry.value) return () => {
    };
    state.value = registry.value.getStore().getState();
    return registry.value.getStore().subscribe((_action, newState) => state.value = newState);
  }
  let unsubscribe = attach();
  watch(registry, () => {
    unsubscribe == null ? void 0 : unsubscribe();
    unsubscribe = attach();
  });
  onBeforeUnmount(() => unsubscribe == null ? void 0 : unsubscribe());
  return state;
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "nested-wrapper",
  props: {
    wrappers: {},
    utilities: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_NestedWrapper = resolveComponent("NestedWrapper", true);
      return openBlock(), createBlock(resolveDynamicComponent(__props.wrappers[0]), null, {
        default: withCtx(() => [
          __props.wrappers.length > 1 ? (openBlock(), createBlock(_component_NestedWrapper, {
            key: 0,
            wrappers: __props.wrappers.slice(1),
            utilities: __props.utilities
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "default")
            ]),
            _: 3
          }, 8, ["wrappers", "utilities"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            renderSlot(_ctx.$slots, "default"),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.utilities, (utility, index) => {
              return openBlock(), createBlock(resolveDynamicComponent(utility), {
                key: `utility-${index}`
              });
            }), 128))
          ], 64))
        ]),
        _: 3
      });
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "auto-mount",
  props: {
    plugins: {}
  },
  setup(__props) {
    const props = __props;
    const elements = computed(() => {
      const utilities = [];
      const wrappers = [];
      for (const reg of props.plugins) {
        const pkg = reg.package;
        if (hasAutoMountElements(pkg)) {
          const elements2 = pkg.autoMountElements() || [];
          for (const element of elements2) {
            if (element.type === "utility") {
              utilities.push(element.component);
            } else if (element.type === "wrapper") {
              wrappers.push(element.component);
            }
          }
        }
      }
      return { utilities, wrappers };
    });
    return (_ctx, _cache) => {
      return elements.value.wrappers.length > 0 ? (openBlock(), createBlock(_sfc_main$2, {
        key: 0,
        wrappers: elements.value.wrappers,
        utilities: elements.value.utilities
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
      }, 8, ["wrappers", "utilities"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        renderSlot(_ctx.$slots, "default"),
        (openBlock(true), createElementBlock(Fragment, null, renderList(elements.value.utilities, (utility, index) => {
          return openBlock(), createBlock(resolveDynamicComponent(utility), {
            key: `utility-${index}`
          });
        }), 128))
      ], 64));
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "embed-pdf",
  props: {
    engine: {},
    config: {},
    logger: {},
    plugins: {},
    onInitialized: {},
    autoMountDomElements: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const registry = shallowRef(null);
    const coreState = ref(null);
    const isInit = ref(true);
    const pluginsOk = ref(false);
    const activeDocumentId = computed(() => {
      var _a;
      return ((_a = coreState.value) == null ? void 0 : _a.activeDocumentId) ?? null;
    });
    const documents = computed(() => {
      var _a;
      return ((_a = coreState.value) == null ? void 0 : _a.documents) ?? {};
    });
    const documentOrder = computed(() => {
      var _a;
      return ((_a = coreState.value) == null ? void 0 : _a.documentOrder) ?? [];
    });
    const activeDocument = computed(() => {
      const docId = activeDocumentId.value;
      const docs = documents.value;
      return docId && docs[docId] ? docs[docId] : null;
    });
    const documentStates = computed(() => {
      const docs = documents.value;
      const order = documentOrder.value;
      return order.map((docId) => docs[docId]).filter((doc) => doc !== null && doc !== void 0);
    });
    provide(pdfKey, {
      registry,
      coreState,
      isInitializing: isInit,
      pluginsReady: pluginsOk,
      activeDocumentId,
      activeDocument,
      documents,
      documentStates
    });
    onMounted(async () => {
      var _a, _b;
      const finalConfig = {
        ...props.config,
        logger: ((_a = props.config) == null ? void 0 : _a.logger) ?? props.logger
      };
      const reg = new PluginRegistry(props.engine, finalConfig);
      reg.registerPluginBatch(props.plugins);
      await reg.initialize();
      if (reg.isDestroyed()) {
        return;
      }
      const store = reg.getStore();
      coreState.value = store.getState().core;
      const unsubscribe = store.subscribe((action, newState, oldState) => {
        if (store.isCoreAction(action) && newState.core !== oldState.core) {
          coreState.value = newState.core;
        }
      });
      await ((_b = props.onInitialized) == null ? void 0 : _b.call(props, reg));
      if (reg.isDestroyed()) {
        unsubscribe();
        return;
      }
      registry.value = reg;
      isInit.value = false;
      reg.pluginsReady().then(() => {
        if (!reg.isDestroyed()) {
          pluginsOk.value = true;
        }
      });
      onBeforeUnmount(() => {
        var _a2;
        unsubscribe();
        (_a2 = registry.value) == null ? void 0 : _a2.destroy();
      });
    });
    return (_ctx, _cache) => {
      return pluginsOk.value && __props.autoMountDomElements ? (openBlock(), createBlock(_sfc_main$1, {
        key: 0,
        plugins: __props.plugins
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default", {
            registry: registry.value,
            coreState: coreState.value,
            isInitializing: isInit.value,
            pluginsReady: pluginsOk.value,
            activeDocumentId: activeDocumentId.value,
            activeDocument: activeDocument.value,
            documents: documents.value,
            documentStates: documentStates.value
          })
        ]),
        _: 3
      }, 8, ["plugins"])) : renderSlot(_ctx.$slots, "default", {
        key: 1,
        registry: registry.value,
        coreState: coreState.value,
        isInitializing: isInit.value,
        pluginsReady: pluginsOk.value,
        activeDocumentId: activeDocumentId.value,
        activeDocument: activeDocument.value,
        documents: documents.value,
        documentStates: documentStates.value
      });
    };
  }
});
export {
  _sfc_main as EmbedPDF,
  useCapability,
  useCoreState,
  useDocumentPermissions,
  useDocumentState,
  usePlugin,
  useRegistry,
  useStoreState
};
//# sourceMappingURL=index.js.map
