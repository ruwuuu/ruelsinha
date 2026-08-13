import { createContext, useMemo, Fragment, useState, useRef, useEffect, useContext } from "react";
import { jsxs, jsx } from "react/jsx-runtime";
import { hasAutoMountElements, PluginRegistry } from "@embedpdf/core";
import { PdfPermissionFlag } from "@embedpdf/models";
const PDFContext = createContext({
  registry: null,
  coreState: null,
  isInitializing: true,
  pluginsReady: false,
  activeDocumentId: null,
  activeDocument: null,
  documents: {},
  documentStates: []
});
function AutoMount({ plugins, children }) {
  const { utilities, wrappers } = useMemo(() => {
    const utilities2 = [];
    const wrappers2 = [];
    for (const reg of plugins) {
      const pkg = reg.package;
      if (hasAutoMountElements(pkg)) {
        const elements = pkg.autoMountElements() || [];
        for (const element of elements) {
          if (element.type === "utility") {
            utilities2.push(element.component);
          } else if (element.type === "wrapper") {
            wrappers2.push(element.component);
          }
        }
      }
    }
    return { utilities: utilities2, wrappers: wrappers2 };
  }, [plugins]);
  const contentWithUtilities = /* @__PURE__ */ jsxs(Fragment, { children: [
    children,
    utilities.map((Utility, i) => /* @__PURE__ */ jsx(Utility, {}, `utility-${i}`))
  ] });
  const wrappedContent = wrappers.reduce(
    (content, Wrapper) => /* @__PURE__ */ jsx(Wrapper, { children: content }),
    contentWithUtilities
  );
  return /* @__PURE__ */ jsx(Fragment, { children: wrappedContent });
}
function EmbedPDF({
  engine,
  config,
  logger,
  onInitialized,
  plugins,
  children,
  autoMountDomElements = true
}) {
  const [registry, setRegistry] = useState(null);
  const [coreState, setCoreState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pluginsReady, setPluginsReady] = useState(false);
  const initRef = useRef(onInitialized);
  useEffect(() => {
    initRef.current = onInitialized;
  }, [onInitialized]);
  useEffect(() => {
    const finalConfig = {
      ...config,
      logger: (config == null ? void 0 : config.logger) ?? logger
    };
    const pdfViewer = new PluginRegistry(engine, finalConfig);
    pdfViewer.registerPluginBatch(plugins);
    const initialize = async () => {
      var _a;
      await pdfViewer.initialize();
      if (pdfViewer.isDestroyed()) {
        return;
      }
      const store = pdfViewer.getStore();
      setCoreState(store.getState().core);
      const unsubscribe = store.subscribe((action, newState, oldState) => {
        if (store.isCoreAction(action) && newState.core !== oldState.core) {
          setCoreState(newState.core);
        }
      });
      await ((_a = initRef.current) == null ? void 0 : _a.call(initRef, pdfViewer));
      if (pdfViewer.isDestroyed()) {
        unsubscribe();
        return;
      }
      pdfViewer.pluginsReady().then(() => {
        if (!pdfViewer.isDestroyed()) {
          setPluginsReady(true);
        }
      });
      setRegistry(pdfViewer);
      setIsInitializing(false);
      return unsubscribe;
    };
    let cleanup;
    initialize().then((unsub) => {
      cleanup = unsub;
    }).catch(console.error);
    return () => {
      cleanup == null ? void 0 : cleanup();
      pdfViewer.destroy();
      setRegistry(null);
      setCoreState(null);
      setIsInitializing(true);
      setPluginsReady(false);
    };
  }, [engine, plugins]);
  const contextValue = useMemo(() => {
    const activeDocumentId = (coreState == null ? void 0 : coreState.activeDocumentId) ?? null;
    const documents = (coreState == null ? void 0 : coreState.documents) ?? {};
    const documentOrder = (coreState == null ? void 0 : coreState.documentOrder) ?? [];
    const activeDocument = activeDocumentId && documents[activeDocumentId] ? documents[activeDocumentId] : null;
    const documentStates = documentOrder.map((docId) => documents[docId]).filter((doc) => doc !== null && doc !== void 0);
    return {
      registry,
      coreState,
      isInitializing,
      pluginsReady,
      // Convenience accessors (always safe to use)
      activeDocumentId,
      activeDocument,
      documents,
      documentStates
    };
  }, [registry, coreState, isInitializing, pluginsReady]);
  const content = typeof children === "function" ? children(contextValue) : children;
  return /* @__PURE__ */ jsx(PDFContext.Provider, { value: contextValue, children: pluginsReady && autoMountDomElements ? /* @__PURE__ */ jsx(AutoMount, { plugins, children: content }) : content });
}
function useRegistry() {
  const contextValue = useContext(PDFContext);
  if (contextValue === void 0) {
    throw new Error("useCapability must be used within a PDFContext.Provider");
  }
  const { registry, isInitializing } = contextValue;
  if (isInitializing) {
    return contextValue;
  }
  if (registry === null) {
    throw new Error("PDF registry failed to initialize properly");
  }
  return contextValue;
}
function usePlugin(pluginId) {
  const { registry } = useRegistry();
  if (registry === null) {
    return {
      plugin: null,
      isLoading: true,
      ready: new Promise(() => {
      })
    };
  }
  const plugin = registry.getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }
  return {
    plugin,
    isLoading: false,
    ready: plugin.ready()
  };
}
function useCapability(pluginId) {
  const { plugin, isLoading, ready } = usePlugin(pluginId);
  if (!plugin) {
    return {
      provides: null,
      isLoading,
      ready
    };
  }
  if (!plugin.provides) {
    throw new Error(`Plugin ${pluginId} does not provide a capability`);
  }
  return {
    provides: plugin.provides(),
    isLoading,
    ready
  };
}
function useStoreState() {
  const { registry } = useRegistry();
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!registry) return;
    setState(registry.getStore().getState());
    const unsubscribe = registry.getStore().subscribe((_action, newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, [registry]);
  return state;
}
function useCoreState() {
  const { coreState } = useContext(PDFContext);
  return coreState;
}
function useDocumentState(documentId) {
  const coreState = useCoreState();
  const documentState = useMemo(() => {
    if (!coreState || !documentId) return null;
    return coreState.documents[documentId] ?? null;
  }, [coreState, documentId]);
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
  return useMemo(() => {
    var _a, _b;
    if (!coreState) {
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
    const effectivePermissions = getEffectivePermissions(coreState, documentId);
    const pdfPermissions = ((_b = (_a = coreState.documents[documentId]) == null ? void 0 : _a.document) == null ? void 0 : _b.permissions) ?? PdfPermissionFlag.AllowAll;
    const hasPermission = (flag) => getEffectivePermission(coreState, documentId, flag);
    const hasAllPermissions = (...flags) => flags.every((flag) => getEffectivePermission(coreState, documentId, flag));
    return {
      permissions: effectivePermissions,
      pdfPermissions,
      hasPermission,
      hasAllPermissions,
      // All permission flags as booleans (using effective permissions)
      canPrint: hasPermission(PdfPermissionFlag.Print),
      canModifyContents: hasPermission(PdfPermissionFlag.ModifyContents),
      canCopyContents: hasPermission(PdfPermissionFlag.CopyContents),
      canModifyAnnotations: hasPermission(PdfPermissionFlag.ModifyAnnotations),
      canFillForms: hasPermission(PdfPermissionFlag.FillForms),
      canExtractForAccessibility: hasPermission(PdfPermissionFlag.ExtractForAccessibility),
      canAssembleDocument: hasPermission(PdfPermissionFlag.AssembleDocument),
      canPrintHighQuality: hasPermission(PdfPermissionFlag.PrintHighQuality)
    };
  }, [coreState, documentId]);
}
export {
  EmbedPDF,
  PDFContext,
  useCapability,
  useCoreState,
  useDocumentPermissions,
  useDocumentState,
  usePlugin,
  useRegistry,
  useStoreState
};
//# sourceMappingURL=index.js.map
