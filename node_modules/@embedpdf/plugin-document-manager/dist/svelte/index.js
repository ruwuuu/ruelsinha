import { createPluginPackage } from "@embedpdf/core";
import { DocumentManagerPlugin, DocumentManagerPluginPackage as DocumentManagerPluginPackage$1 } from "@embedpdf/plugin-document-manager";
export * from "@embedpdf/plugin-document-manager";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { usePlugin, useCapability, useCoreState, useDocumentState } from "@embedpdf/core/svelte";
const useDocumentManagerPlugin = () => usePlugin(DocumentManagerPlugin.id);
const useDocumentManagerCapability = () => useCapability(DocumentManagerPlugin.id);
function useActiveDocument() {
  const coreStateRef = useCoreState();
  const activeDocumentId = $.derived(() => {
    var _a;
    return ((_a = coreStateRef.current) == null ? void 0 : _a.activeDocumentId) ?? null;
  });
  const activeDocument = $.derived(() => {
    const core = coreStateRef.current;
    if (!core) return null;
    const docId = core.activeDocumentId;
    return docId ? core.documents[docId] ?? null : null;
  });
  return {
    get activeDocumentId() {
      return $.get(activeDocumentId);
    },
    get activeDocument() {
      return $.get(activeDocument);
    }
  };
}
function useOpenDocuments(getDocumentIds) {
  const coreStateRef = useCoreState();
  const documentIds = $.derived(() => getDocumentIds ? getDocumentIds() : void 0);
  const documents = $.derived(() => {
    const core = coreStateRef.current;
    if (!core) return [];
    if ($.get(documentIds)) {
      return $.get(documentIds).map((docId) => core.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
    }
    return core.documentOrder.map((docId) => core.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
  });
  return {
    get current() {
      return $.get(documents);
    }
  };
}
var root = $.from_html(`<input type="file" accept="application/pdf"/>`);
function FilePicker($$anchor, $$props) {
  $.push($$props, true);
  const documentManagerPlugin = useDocumentManagerPlugin();
  const documentManagerCapability = useDocumentManagerCapability();
  let inputRef = $.state(null);
  let taskRef = $.state(null);
  let optionsRef = $.state(void 0);
  $.user_effect(() => {
    var _a;
    if (!((_a = documentManagerPlugin.plugin) == null ? void 0 : _a.onOpenFileRequest)) return;
    const unsubscribe = documentManagerPlugin.plugin.onOpenFileRequest(({ task, options }) => {
      var _a2;
      $.set(taskRef, task, true);
      $.set(optionsRef, options, true);
      (_a2 = $.get(inputRef)) == null ? void 0 : _a2.click();
    });
    return unsubscribe;
  });
  const onChange = async (event) => {
    var _a, _b, _c, _d, _e;
    const target = event.target;
    const file = (_a = target.files) == null ? void 0 : _a[0];
    if (!file || !documentManagerCapability.provides) return;
    const buffer = await file.arrayBuffer();
    const openTask = documentManagerCapability.provides.openDocumentBuffer({
      name: file.name,
      buffer,
      documentId: (_b = $.get(optionsRef)) == null ? void 0 : _b.documentId,
      scale: (_c = $.get(optionsRef)) == null ? void 0 : _c.scale,
      rotation: (_d = $.get(optionsRef)) == null ? void 0 : _d.rotation,
      autoActivate: (_e = $.get(optionsRef)) == null ? void 0 : _e.autoActivate
    });
    openTask.wait(
      (result) => {
        var _a2;
        (_a2 = $.get(taskRef)) == null ? void 0 : _a2.resolve(result);
      },
      (error) => {
        var _a2;
        (_a2 = $.get(taskRef)) == null ? void 0 : _a2.fail(error);
      }
    );
  };
  var input = root();
  input.__change = onChange;
  $.set_style(input, "", {}, { display: "none" });
  $.bind_this(input, ($$value) => $.set(inputRef, $$value), () => $.get(inputRef));
  $.append($$anchor, input);
  $.pop();
}
$.delegate(["change"]);
function DocumentContext($$anchor, $$props) {
  $.push($$props, true);
  const openDocuments = useOpenDocuments();
  const activeDoc = useActiveDocument();
  const capability = useDocumentManagerCapability();
  const actions = {
    select: (documentId) => {
      var _a;
      (_a = capability.provides) == null ? void 0 : _a.setActiveDocument(documentId);
    },
    close: (documentId) => {
      var _a;
      (_a = capability.provides) == null ? void 0 : _a.closeDocument(documentId);
    },
    move: (documentId, toIndex) => {
      var _a;
      (_a = capability.provides) == null ? void 0 : _a.moveDocument(documentId, toIndex);
    }
  };
  var fragment = $.comment();
  var node = $.first_child(fragment);
  $.snippet(node, () => $$props.children, () => ({
    documentStates: openDocuments.current,
    activeDocumentId: activeDoc.activeDocumentId,
    actions
  }));
  $.append($$anchor, fragment);
  $.pop();
}
function DocumentContent($$anchor, $$props) {
  $.push($$props, true);
  const docState = useDocumentState(() => $$props.documentId);
  const isLoading = $.derived(() => {
    var _a;
    return ((_a = docState.current) == null ? void 0 : _a.status) === "loading";
  });
  const isError = $.derived(() => {
    var _a;
    return ((_a = docState.current) == null ? void 0 : _a.status) === "error";
  });
  const isLoaded = $.derived(() => {
    var _a;
    return ((_a = docState.current) == null ? void 0 : _a.status) === "loaded";
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = $.comment();
      var node_1 = $.first_child(fragment_1);
      $.snippet(node_1, () => $$props.children, () => ({
        documentState: docState.current,
        isLoading: $.get(isLoading),
        isError: $.get(isError),
        isLoaded: $.get(isLoaded)
      }));
      $.append($$anchor2, fragment_1);
    };
    $.if(node, ($$render) => {
      if (docState.current) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
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
