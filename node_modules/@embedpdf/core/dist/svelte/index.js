import * as $ from "svelte/internal/client";
import { PdfPermissionFlag } from "@embedpdf/models";
import "svelte/internal/disclose-version";
import { hasAutoMountElements, PluginRegistry } from "@embedpdf/core";
const pdfContext = $.proxy({
  registry: null,
  coreState: null,
  isInitializing: true,
  pluginsReady: false,
  activeDocumentId: null,
  activeDocument: null,
  documents: {},
  documentStates: []
});
const useRegistry = () => pdfContext;
function usePlugin(pluginId) {
  const { registry } = pdfContext;
  const state = $.proxy({ plugin: null, isLoading: true, ready: new Promise(() => {
  }) });
  if (registry === null) {
    return state;
  }
  const plugin = registry.getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }
  state.plugin = plugin;
  state.isLoading = false;
  state.ready = plugin.ready();
  return state;
}
function useCapability(pluginId) {
  const p = usePlugin(pluginId);
  const state = $.proxy({
    provides: null,
    isLoading: true,
    ready: new Promise(() => {
    })
  });
  $.user_effect(() => {
    if (!p.plugin) {
      state.provides = null;
      state.isLoading = p.isLoading;
      state.ready = p.ready;
      return;
    }
    if (!p.plugin.provides) {
      throw new Error(`Plugin ${pluginId} does not provide a capability`);
    }
    state.provides = p.plugin.provides();
    state.isLoading = p.isLoading;
    state.ready = p.ready;
  });
  return state;
}
function useCoreState() {
  const context = useRegistry();
  return {
    get current() {
      return context.coreState;
    }
  };
}
function useDocumentState(getDocumentId) {
  const coreStateRef = useCoreState();
  const documentId = $.derived(getDocumentId);
  const documentState = $.derived(() => coreStateRef.current && $.get(documentId) ? coreStateRef.current.documents[$.get(documentId)] ?? null : null);
  return {
    get current() {
      return $.get(documentState);
    }
  };
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
function useDocumentPermissions(getDocumentId) {
  const coreStateRef = useCoreState();
  const documentId = $.derived(getDocumentId);
  const coreState = $.derived(() => coreStateRef.current);
  const effectivePermissions = $.derived(() => $.get(coreState) ? getEffectivePermissions($.get(coreState), $.get(documentId)) : PdfPermissionFlag.AllowAll);
  const pdfPermissions = $.derived(() => {
    var _a, _b, _c;
    return ((_c = (_b = (_a = $.get(coreState)) == null ? void 0 : _a.documents[$.get(documentId)]) == null ? void 0 : _b.document) == null ? void 0 : _c.permissions) ?? PdfPermissionFlag.AllowAll;
  });
  const hasPermission = (flag) => $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), flag) : true;
  const hasAllPermissions = (...flags) => flags.every((flag) => $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), flag) : true);
  return {
    get permissions() {
      return $.get(effectivePermissions);
    },
    get pdfPermissions() {
      return $.get(pdfPermissions);
    },
    hasPermission,
    hasAllPermissions,
    get canPrint() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.Print) : true;
    },
    get canModifyContents() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.ModifyContents) : true;
    },
    get canCopyContents() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.CopyContents) : true;
    },
    get canModifyAnnotations() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.ModifyAnnotations) : true;
    },
    get canFillForms() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.FillForms) : true;
    },
    get canExtractForAccessibility() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.ExtractForAccessibility) : true;
    },
    get canAssembleDocument() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.AssembleDocument) : true;
    },
    get canPrintHighQuality() {
      return $.get(coreState) ? getEffectivePermission($.get(coreState), $.get(documentId), PdfPermissionFlag.PrintHighQuality) : true;
    }
  };
}
var root_5 = $.from_html(`<!> <!>`, 1);
function NestedWrapper_1($$anchor, $$props) {
  $.push($$props, true);
  let utilities = $.prop($$props, "utilities", 19, () => []);
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      const Wrapper = $.derived(() => $$props.wrappers[0]);
      var fragment_1 = $.comment();
      var node_1 = $.first_child(fragment_1);
      $.component(node_1, () => $.get(Wrapper), ($$anchor3, Wrapper_1) => {
        Wrapper_1($$anchor3, {
          children: ($$anchor4, $$slotProps) => {
            {
              let $0 = $.derived(() => $$props.wrappers.slice(1));
              NestedWrapper_1($$anchor4, {
                get wrappers() {
                  return $.get($0);
                },
                get utilities() {
                  return utilities();
                },
                children: ($$anchor5, $$slotProps2) => {
                  var fragment_3 = $.comment();
                  var node_2 = $.first_child(fragment_3);
                  $.snippet(node_2, () => $$props.children ?? $.noop);
                  $.append($$anchor5, fragment_3);
                },
                $$slots: { default: true }
              });
            }
          },
          $$slots: { default: true }
        });
      });
      $.append($$anchor2, fragment_1);
    };
    var alternate = ($$anchor2) => {
      const Wrapper = $.derived(() => $$props.wrappers[0]);
      var fragment_4 = $.comment();
      var node_3 = $.first_child(fragment_4);
      $.component(node_3, () => $.get(Wrapper), ($$anchor3, Wrapper_2) => {
        Wrapper_2($$anchor3, {
          children: ($$anchor4, $$slotProps) => {
            var fragment_5 = root_5();
            var node_4 = $.first_child(fragment_5);
            $.snippet(node_4, () => $$props.children ?? $.noop);
            var node_5 = $.sibling(node_4, 2);
            $.each(node_5, 19, utilities, (Utility, i) => `utility-${i}`, ($$anchor5, Utility) => {
              var fragment_6 = $.comment();
              var node_6 = $.first_child(fragment_6);
              $.component(node_6, () => $.get(Utility), ($$anchor6, Utility_1) => {
                Utility_1($$anchor6, {});
              });
              $.append($$anchor5, fragment_6);
            });
            $.append($$anchor4, fragment_5);
          },
          $$slots: { default: true }
        });
      });
      $.append($$anchor2, fragment_4);
    };
    $.if(node, ($$render) => {
      if ($$props.wrappers.length > 1) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root_2 = $.from_html(`<!> <!>`, 1);
function AutoMount($$anchor, $$props) {
  $.push($$props, true);
  let utilities = $.state($.proxy([]));
  let wrappers = $.state($.proxy([]));
  $.user_effect(() => {
    var _a;
    const nextUtilities = [];
    const nextWrappers = [];
    for (const reg of $$props.plugins) {
      const pkg = reg.package;
      if (hasAutoMountElements(pkg)) {
        const elements = ((_a = pkg.autoMountElements) == null ? void 0 : _a.call(pkg)) ?? [];
        for (const element of elements) {
          if (element.type === "utility") {
            nextUtilities.push(element.component);
          } else if (element.type === "wrapper") {
            nextWrappers.push(element.component);
          }
        }
      }
    }
    $.set(utilities, nextUtilities, true);
    $.set(wrappers, nextWrappers, true);
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      NestedWrapper_1($$anchor2, {
        get wrappers() {
          return $.get(wrappers);
        },
        get utilities() {
          return $.get(utilities);
        },
        get children() {
          return $$props.children;
        }
      });
    };
    var alternate = ($$anchor2) => {
      var fragment_2 = root_2();
      var node_1 = $.first_child(fragment_2);
      $.snippet(node_1, () => $$props.children ?? $.noop);
      var node_2 = $.sibling(node_1, 2);
      $.each(node_2, 19, () => $.get(utilities), (Utility, i) => `utility-${i}`, ($$anchor3, Utility) => {
        var fragment_3 = $.comment();
        var node_3 = $.first_child(fragment_3);
        $.component(node_3, () => $.get(Utility), ($$anchor4, Utility_1) => {
          Utility_1($$anchor4, {});
        });
        $.append($$anchor3, fragment_3);
      });
      $.append($$anchor2, fragment_2);
    };
    $.if(node, ($$render) => {
      if ($.get(wrappers).length > 0) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function EmbedPDF($$anchor, $$props) {
  $.push($$props, true);
  let autoMountDomElements = $.prop($$props, "autoMountDomElements", 3, true);
  let latestInit = $$props.onInitialized;
  $.user_effect(() => {
    if ($$props.onInitialized) {
      latestInit = $$props.onInitialized;
    }
  });
  $.user_effect(() => {
    var _a;
    if ($$props.engine || $$props.engine && $$props.plugins) {
      const finalConfig = {
        ...$$props.config,
        logger: ((_a = $$props.config) == null ? void 0 : _a.logger) ?? $$props.logger
      };
      const reg = new PluginRegistry($$props.engine, finalConfig);
      reg.registerPluginBatch($$props.plugins);
      const initialize = async () => {
        await reg.initialize();
        if (reg.isDestroyed()) {
          return;
        }
        const store = reg.getStore();
        pdfContext.coreState = store.getState().core;
        const unsubscribe = store.subscribe((action, newState, oldState) => {
          if (store.isCoreAction(action) && newState.core !== oldState.core) {
            pdfContext.coreState = newState.core;
            const activeDocumentId = newState.core.activeDocumentId ?? null;
            const documents = newState.core.documents ?? {};
            const documentOrder = newState.core.documentOrder ?? [];
            pdfContext.activeDocumentId = activeDocumentId;
            pdfContext.activeDocument = activeDocumentId && documents[activeDocumentId] ? documents[activeDocumentId] : null;
            pdfContext.documents = documents;
            pdfContext.documentStates = documentOrder.map((docId) => documents[docId]).filter((doc) => doc !== null && doc !== void 0);
          }
        });
        await (latestInit == null ? void 0 : latestInit(reg));
        if (reg.isDestroyed()) {
          unsubscribe();
          return;
        }
        reg.pluginsReady().then(() => {
          if (!reg.isDestroyed()) {
            pdfContext.pluginsReady = true;
          }
        });
        pdfContext.registry = reg;
        pdfContext.isInitializing = false;
        return unsubscribe;
      };
      let cleanup;
      initialize().then((unsub) => {
        cleanup = unsub;
      }).catch(console.error);
      return () => {
        cleanup == null ? void 0 : cleanup();
        reg.destroy();
        pdfContext.registry = null;
        pdfContext.coreState = null;
        pdfContext.isInitializing = true;
        pdfContext.pluginsReady = false;
        pdfContext.activeDocumentId = null;
        pdfContext.activeDocument = null;
        pdfContext.documents = {};
        pdfContext.documentStates = [];
      };
    }
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      AutoMount($$anchor2, {
        get plugins() {
          return $$props.plugins;
        },
        children: ($$anchor3, $$slotProps) => {
          var fragment_2 = $.comment();
          var node_1 = $.first_child(fragment_2);
          $.snippet(node_1, () => $$props.children, () => pdfContext);
          $.append($$anchor3, fragment_2);
        },
        $$slots: { default: true }
      });
    };
    var alternate = ($$anchor2) => {
      var fragment_3 = $.comment();
      var node_2 = $.first_child(fragment_3);
      $.snippet(node_2, () => $$props.children, () => pdfContext);
      $.append($$anchor2, fragment_3);
    };
    $.if(node, ($$render) => {
      if (pdfContext.pluginsReady && autoMountDomElements()) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
export {
  EmbedPDF,
  pdfContext,
  useCapability,
  useCoreState,
  useDocumentPermissions,
  useDocumentState,
  usePlugin,
  useRegistry
};
//# sourceMappingURL=index.js.map
