import { createPluginPackage } from "@embedpdf/core";
import { DocumentManagerPlugin, DocumentManagerPluginPackage as DocumentManagerPluginPackage$1 } from "@embedpdf/plugin-document-manager";
export * from "@embedpdf/plugin-document-manager";
import { defineComponent, toValue, computed, unref, renderSlot, createCommentVNode, ref, watch, openBlock, createElementBlock } from "vue";
import { useDocumentState, usePlugin, useCapability, useCoreState } from "@embedpdf/core/vue";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "document-content",
  props: {
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const documentState = useDocumentState(() => toValue(props.documentId));
    const isLoading = computed(() => {
      var _a;
      return ((_a = documentState.value) == null ? void 0 : _a.status) === "loading";
    });
    const isError = computed(() => {
      var _a;
      return ((_a = documentState.value) == null ? void 0 : _a.status) === "error";
    });
    const isLoaded = computed(() => {
      var _a;
      return ((_a = documentState.value) == null ? void 0 : _a.status) === "loaded";
    });
    return (_ctx, _cache) => {
      return unref(documentState) ? renderSlot(_ctx.$slots, "default", {
        key: 0,
        documentState: unref(documentState),
        isLoading: isLoading.value,
        isError: isError.value,
        isLoaded: isLoaded.value
      }) : createCommentVNode("", true);
    };
  }
});
const useDocumentManagerPlugin = () => usePlugin(DocumentManagerPlugin.id);
const useDocumentManagerCapability = () => useCapability(DocumentManagerPlugin.id);
function useActiveDocument() {
  const coreState = useCoreState();
  const activeDocumentId = computed(() => {
    var _a;
    return ((_a = coreState.value) == null ? void 0 : _a.activeDocumentId) ?? null;
  });
  const activeDocument = computed(() => {
    const core = coreState.value;
    if (!core) return null;
    const docId = core.activeDocumentId;
    return docId ? core.documents[docId] ?? null : null;
  });
  return {
    activeDocumentId,
    activeDocument
  };
}
function useOpenDocuments(getDocumentIds) {
  const coreState = useCoreState();
  const documents = computed(() => {
    const core = coreState.value;
    if (!core) return [];
    const documentIds = getDocumentIds ? toValue(getDocumentIds) : void 0;
    if (documentIds) {
      return documentIds.map((docId) => core.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
    }
    return core.documentOrder.map((docId) => core.documents[docId]).filter((doc) => doc !== null && doc !== void 0);
  });
  return documents;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "document-context",
  setup(__props) {
    const documentStates = useOpenDocuments();
    const { activeDocumentId } = useActiveDocument();
    const { provides } = useDocumentManagerCapability();
    const actions = {
      select: (documentId) => {
        var _a;
        (_a = provides.value) == null ? void 0 : _a.setActiveDocument(documentId);
      },
      close: (documentId) => {
        var _a;
        (_a = provides.value) == null ? void 0 : _a.closeDocument(documentId);
      },
      move: (documentId, toIndex) => {
        var _a;
        (_a = provides.value) == null ? void 0 : _a.moveDocument(documentId, toIndex);
      }
    };
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default", {
        documentStates: unref(documentStates),
        activeDocumentId: unref(activeDocumentId),
        actions
      });
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "file-picker",
  setup(__props) {
    const { plugin } = useDocumentManagerPlugin();
    const { provides } = useDocumentManagerCapability();
    const inputRef = ref(null);
    const taskRef = ref(null);
    const optionsRef = ref(void 0);
    watch(
      plugin,
      (pluginValue, _, onCleanup) => {
        if (!(pluginValue == null ? void 0 : pluginValue.onOpenFileRequest)) return;
        const unsubscribe = pluginValue.onOpenFileRequest(({ task, options }) => {
          var _a;
          taskRef.value = task;
          optionsRef.value = options;
          (_a = inputRef.value) == null ? void 0 : _a.click();
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    const onChange = async (event) => {
      var _a, _b, _c, _d, _e;
      const target = event.target;
      const file = (_a = target.files) == null ? void 0 : _a[0];
      const cap = provides.value;
      if (!file || !cap) return;
      const buffer = await file.arrayBuffer();
      const openTask = cap.openDocumentBuffer({
        name: file.name,
        buffer,
        documentId: (_b = optionsRef.value) == null ? void 0 : _b.documentId,
        scale: (_c = optionsRef.value) == null ? void 0 : _c.scale,
        rotation: (_d = optionsRef.value) == null ? void 0 : _d.rotation,
        autoActivate: (_e = optionsRef.value) == null ? void 0 : _e.autoActivate
      });
      openTask.wait(
        (result) => {
          var _a2;
          (_a2 = taskRef.value) == null ? void 0 : _a2.resolve(result);
        },
        (error) => {
          var _a2;
          (_a2 = taskRef.value) == null ? void 0 : _a2.fail(error);
        }
      );
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("input", {
        ref_key: "inputRef",
        ref: inputRef,
        type: "file",
        accept: "application/pdf",
        style: { "display": "none" },
        onChange
      }, null, 544);
    };
  }
});
const DocumentManagerPluginPackage = createPluginPackage(DocumentManagerPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main$2 as DocumentContent,
  _sfc_main$1 as DocumentContext,
  DocumentManagerPluginPackage,
  _sfc_main as FilePicker,
  useActiveDocument,
  useDocumentManagerCapability,
  useDocumentManagerPlugin,
  useOpenDocuments
};
//# sourceMappingURL=index.js.map
