import { createPluginPackage } from "@embedpdf/core";
import { DocumentManagerPlugin, DocumentManagerPluginPackage as DocumentManagerPluginPackage$1 } from "@embedpdf/plugin-document-manager";
export * from "@embedpdf/plugin-document-manager";
import { jsx, Fragment } from "preact/jsx-runtime";
import { useDocumentState, usePlugin, useCapability, useCoreState } from "@embedpdf/core/preact";
import "preact";
import { useMemo, useCallback, useRef, useEffect } from "preact/hooks";
function DocumentContent({ documentId, children }) {
  const documentState = useDocumentState(documentId);
  if (!documentState) return null;
  const isLoading = documentState.status === "loading";
  const isError = documentState.status === "error";
  const isLoaded = documentState.status === "loaded";
  return /* @__PURE__ */ jsx(Fragment, { children: children({ documentState, isLoading, isError, isLoaded }) });
}
const useDocumentManagerPlugin = () => usePlugin(DocumentManagerPlugin.id);
const useDocumentManagerCapability = () => useCapability(DocumentManagerPlugin.id);
const useActiveDocument = () => {
  const coreState = useCoreState();
  return useMemo(() => {
    if (!coreState) {
      return {
        activeDocumentId: null,
        activeDocument: null
      };
    }
    const activeDocumentId = coreState.activeDocumentId;
    const activeDocument = activeDocumentId ? coreState.documents[activeDocumentId] ?? null : null;
    return {
      activeDocumentId,
      activeDocument
    };
  }, [coreState]);
};
const useOpenDocuments = (documentIds) => {
  const coreState = useCoreState();
  return useMemo(() => {
    if (!coreState) return [];
    if (documentIds) {
      return documentIds.map((docId) => coreState.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
    }
    return coreState.documentOrder.map((docId) => coreState.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
  }, [coreState, documentIds]);
};
function DocumentContext({ children }) {
  const documentStates = useOpenDocuments();
  const { activeDocumentId } = useActiveDocument();
  const { provides } = useDocumentManagerCapability();
  const select = useCallback(
    (documentId) => {
      provides == null ? void 0 : provides.setActiveDocument(documentId);
    },
    [provides]
  );
  const close = useCallback(
    (documentId) => {
      provides == null ? void 0 : provides.closeDocument(documentId);
    },
    [provides]
  );
  const move = useCallback(
    (documentId, toIndex) => {
      provides == null ? void 0 : provides.moveDocument(documentId, toIndex);
    },
    [provides]
  );
  const actions = {
    select,
    close,
    move
  };
  return /* @__PURE__ */ jsx(Fragment, { children: children({ documentStates, activeDocumentId, actions }) });
}
function FilePicker() {
  const { plugin } = useDocumentManagerPlugin();
  const { provides } = useDocumentManagerCapability();
  const inputRef = useRef(null);
  const taskRef = useRef(null);
  const optionsRef = useRef(void 0);
  useEffect(() => {
    if (!(plugin == null ? void 0 : plugin.onOpenFileRequest)) return;
    const unsub = plugin.onOpenFileRequest(({ task, options }) => {
      var _a;
      taskRef.current = task;
      optionsRef.current = options;
      (_a = inputRef.current) == null ? void 0 : _a.click();
    });
    return unsub;
  }, [plugin]);
  const onChange = async (e) => {
    var _a, _b, _c, _d, _e;
    const file = (_a = e.currentTarget.files) == null ? void 0 : _a[0];
    if (!file || !provides) return;
    const buffer = await file.arrayBuffer();
    const openTask = provides.openDocumentBuffer({
      name: file.name,
      buffer,
      documentId: (_b = optionsRef.current) == null ? void 0 : _b.documentId,
      scale: (_c = optionsRef.current) == null ? void 0 : _c.scale,
      rotation: (_d = optionsRef.current) == null ? void 0 : _d.rotation,
      autoActivate: (_e = optionsRef.current) == null ? void 0 : _e.autoActivate
    });
    openTask.wait(
      (result) => {
        var _a2;
        (_a2 = taskRef.current) == null ? void 0 : _a2.resolve(result);
      },
      (error) => {
        var _a2;
        (_a2 = taskRef.current) == null ? void 0 : _a2.fail(error);
      }
    );
  };
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "file",
      accept: "application/pdf",
      style: { display: "none" },
      onChange
    }
  );
}
const DocumentManagerPluginPackage = createPluginPackage(DocumentManagerPluginPackage$1).addUtility(FilePicker).build();
export {
  DocumentContent,
  DocumentContext,
  DocumentManagerPluginPackage,
  FilePicker,
  useActiveDocument,
  useDocumentManagerCapability,
  useDocumentManagerPlugin,
  useOpenDocuments
};
//# sourceMappingURL=index.js.map
