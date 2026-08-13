import { BasePlugin, createBehaviorEmitter, createEmitter, reorderDocuments, moveDocument, setActiveDocument, startLoadingDocument, retryLoadingDocument, closeDocument, updateDocumentSecurity, setDocumentLoaded, setDocumentError } from "@embedpdf/core";
import { Task, PdfErrorCode } from "@embedpdf/models";
const _DocumentManagerPlugin = class _DocumentManagerPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.id = id;
    this.documentOpened$ = createBehaviorEmitter();
    this.documentClosed$ = createBehaviorEmitter();
    this.activeDocumentChanged$ = createBehaviorEmitter();
    this.documentError$ = createBehaviorEmitter();
    this.documentOrderChanged$ = createBehaviorEmitter();
    this.openFileRequest$ = createEmitter();
    this.loadOptions = /* @__PURE__ */ new Map();
    this.maxDocuments = config == null ? void 0 : config.maxDocuments;
  }
  buildCapability() {
    return {
      // Document lifecycle - orchestration only
      openFileDialog: (options) => this.openFileDialog(options),
      openDocumentUrl: (options) => this.openDocumentUrl(options),
      openDocumentBuffer: (options) => this.openDocumentBuffer(options),
      retryDocument: (documentId, options) => this.retryDocument(documentId, options),
      closeDocument: (documentId) => this.closeDocument(documentId),
      closeAllDocuments: () => this.closeAllDocuments(),
      setActiveDocument: (documentId) => {
        if (!this.isDocumentOpen(documentId)) {
          throw new Error(`Cannot set active document: ${documentId} is not open`);
        }
        this.dispatchCoreAction(setActiveDocument(documentId));
      },
      getActiveDocumentId: () => this.coreState.core.activeDocumentId,
      getActiveDocument: () => {
        var _a;
        const activeId = this.coreState.core.activeDocumentId;
        if (!activeId) return null;
        return ((_a = this.coreState.core.documents[activeId]) == null ? void 0 : _a.document) ?? null;
      },
      getDocumentOrder: () => this.coreState.core.documentOrder,
      moveDocument: (documentId, toIndex) => {
        this.dispatchCoreAction(moveDocument(documentId, toIndex));
      },
      swapDocuments: (id1, id2) => {
        const order = this.coreState.core.documentOrder;
        const index1 = order.indexOf(id1);
        const index2 = order.indexOf(id2);
        if (index1 === -1 || index2 === -1) {
          throw new Error("One or both documents not found in order");
        }
        const newOrder = [...order];
        [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
        this.dispatchCoreAction(reorderDocuments(newOrder));
      },
      getDocument: (documentId) => {
        var _a;
        return ((_a = this.coreState.core.documents[documentId]) == null ? void 0 : _a.document) ?? null;
      },
      getDocumentState: (documentId) => {
        return this.coreState.core.documents[documentId] ?? null;
      },
      getOpenDocuments: () => {
        return this.coreState.core.documentOrder.map((documentId) => this.coreState.core.documents[documentId]).filter((state) => state !== null);
      },
      isDocumentOpen: (documentId) => this.isDocumentOpen(documentId),
      getDocumentCount: () => {
        return Object.keys(this.coreState.core.documents).length;
      },
      getDocumentIndex: (documentId) => {
        return this.coreState.core.documentOrder.indexOf(documentId);
      },
      // Security
      setDocumentEncryption: (documentId, options) => this.setDocumentEncryption(documentId, options),
      unlockOwnerPermissions: (documentId, ownerPassword) => this.unlockOwnerPermissions(documentId, ownerPassword),
      removeEncryption: (documentId) => this.removeEncryption(documentId),
      // Events
      onDocumentOpened: this.documentOpened$.on,
      onDocumentClosed: this.documentClosed$.on,
      onDocumentError: this.documentError$.on,
      onActiveDocumentChanged: this.activeDocumentChanged$.on,
      onDocumentOrderChanged: this.documentOrderChanged$.on
    };
  }
  /**
   * Check if a document is currently open
   */
  isDocumentOpen(documentId) {
    return !!this.coreState.core.documents[documentId];
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoaded(documentId) {
    const docState = this.coreState.core.documents[documentId];
    if (!docState || docState.status !== "loaded") return;
    this.loadOptions.delete(documentId);
    this.documentOpened$.emit(docState);
    this.logger.info(
      "DocumentManagerPlugin",
      "DocumentOpened",
      `Document ${documentId} opened successfully`,
      { name: docState.name }
    );
  }
  onDocumentClosed(documentId) {
    this.loadOptions.delete(documentId);
    this.documentClosed$.emit(documentId);
    this.logger.info("DocumentManagerPlugin", "DocumentClosed", `Document ${documentId} closed`);
  }
  onActiveDocumentChanged(previousId, currentId) {
    this.activeDocumentChanged$.emit({
      previousDocumentId: previousId,
      currentDocumentId: currentId
    });
    this.logger.info(
      "DocumentManagerPlugin",
      "ActiveDocumentChanged",
      `Active document changed from ${previousId} to ${currentId}`
    );
  }
  onCoreStoreUpdated(oldState, newState) {
    if (oldState.core.documentOrder !== newState.core.documentOrder) {
      this.documentOrderChanged$.emit({
        order: newState.core.documentOrder
      });
    }
  }
  onOpenFileRequest(handler) {
    return this.openFileRequest$.on(handler);
  }
  // ─────────────────────────────────────────────────────────
  // Document Loading (orchestration only - no state management)
  // ─────────────────────────────────────────────────────────
  openDocumentUrl(options) {
    const task = new Task();
    const documentId = options.documentId || this.generateDocumentId();
    const limitError = this.checkDocumentLimit();
    if (limitError) {
      task.reject(limitError);
      return task;
    }
    const documentName = options.name ?? this.extractNameFromUrl(options.url);
    this.loadOptions.set(documentId, options);
    this.dispatchCoreAction(
      startLoadingDocument(
        documentId,
        documentName,
        options.scale,
        options.rotation,
        !!options.password,
        options.autoActivate,
        options.permissions
      )
    );
    this.logger.info(
      "DocumentManagerPlugin",
      "OpenDocumentUrl",
      `Starting to load document from URL: ${options.url}`,
      { documentId, passwordProvided: !!options.password }
    );
    const file = {
      id: documentId,
      url: options.url
    };
    const engineTask = this.engine.openDocumentUrl(file, {
      password: options.password,
      mode: options.mode,
      requestOptions: options.requestOptions,
      normalizeRotation: true
    });
    task.resolve({
      documentId,
      task: engineTask
    });
    this.handleLoadTask(documentId, engineTask, "OpenDocumentUrl");
    return task;
  }
  openDocumentBuffer(options) {
    const task = new Task();
    const limitError = this.checkDocumentLimit();
    if (limitError) {
      task.reject(limitError);
      return task;
    }
    const documentId = options.documentId || this.generateDocumentId();
    this.loadOptions.set(documentId, options);
    this.dispatchCoreAction(
      startLoadingDocument(
        documentId,
        options.name,
        options.scale,
        options.rotation,
        !!options.password,
        options.autoActivate,
        options.permissions
      )
    );
    this.logger.info(
      "DocumentManagerPlugin",
      "OpenDocumentBuffer",
      `Starting to load document from buffer: ${options.name}`,
      { documentId, passwordProvided: !!options.password }
    );
    const file = {
      id: documentId,
      content: options.buffer
    };
    const engineTask = this.engine.openDocumentBuffer(file, {
      password: options.password,
      normalizeRotation: true
    });
    task.resolve({
      documentId,
      task: engineTask
    });
    this.handleLoadTask(documentId, engineTask, "OpenDocumentBuffer");
    return task;
  }
  retryDocument(documentId, retryOptions) {
    const task = new Task();
    const validation = this.validateRetry(documentId);
    if (!validation.valid) {
      task.reject(validation.error);
      return task;
    }
    const originalOptions = this.loadOptions.get(documentId);
    const mergedOptions = {
      ...originalOptions,
      ...(retryOptions == null ? void 0 : retryOptions.password) && { password: retryOptions.password }
    };
    this.loadOptions.set(documentId, mergedOptions);
    this.dispatchCoreAction(retryLoadingDocument(documentId, !!(retryOptions == null ? void 0 : retryOptions.password)));
    this.logger.info(
      "DocumentManagerPlugin",
      "RetryDocument",
      `Retrying to load document ${documentId}`,
      { passwordProvided: !!(retryOptions == null ? void 0 : retryOptions.password) }
    );
    const engineTask = "url" in mergedOptions ? this.retryUrlDocument(documentId, mergedOptions) : this.retryBufferDocument(documentId, mergedOptions);
    task.resolve({
      documentId,
      task: engineTask
    });
    this.handleLoadTask(documentId, engineTask, "RetryDocument");
    return task;
  }
  openFileDialog(options) {
    const task = new Task();
    this.openFileRequest$.emit({ task, options });
    return task;
  }
  closeDocument(documentId) {
    const task = new Task();
    const docState = this.coreState.core.documents[documentId];
    if (!docState) {
      this.logger.warn(
        "DocumentManagerPlugin",
        "CloseDocument",
        `Cannot close document ${documentId}: not found in state`
      );
      task.resolve();
      return task;
    }
    if (docState.status === "loaded" && docState.document) {
      this.engine.closeDocument(docState.document).wait(
        () => {
          this.dispatchCoreAction(closeDocument(documentId));
          task.resolve();
        },
        (error) => {
          this.logger.error(
            "DocumentManagerPlugin",
            "CloseDocument",
            `Failed to close document ${documentId}`,
            error
          );
          task.fail(error);
        }
      );
    } else {
      this.logger.info(
        "DocumentManagerPlugin",
        "CloseDocument",
        `Closing document ${documentId} in ${docState.status} state (skipping engine close)`
      );
      this.dispatchCoreAction(closeDocument(documentId));
      task.resolve();
    }
    return task;
  }
  closeAllDocuments() {
    const documentIds = Object.keys(this.coreState.core.documents);
    const tasks = documentIds.map((documentId) => this.closeDocument(documentId));
    this.logger.info(
      "DocumentManagerPlugin",
      "CloseAllDocuments",
      `Closing ${documentIds.length} documents`
    );
    return Task.all(tasks);
  }
  // ─────────────────────────────────────────────────────────
  // Security Methods
  // ─────────────────────────────────────────────────────────
  setDocumentEncryption(documentId, options) {
    const task = new Task();
    const docState = this.coreState.core.documents[documentId];
    if (!(docState == null ? void 0 : docState.document)) {
      task.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${documentId} is not open`
      });
      return task;
    }
    this.logger.info(
      "DocumentManagerPlugin",
      "SetDocumentEncryption",
      `Setting encryption on document ${documentId}`,
      { hasUserPassword: !!options.userPassword, allowedFlags: options.allowedFlags }
    );
    const engineTask = this.engine.setDocumentEncryption(
      docState.document,
      options.userPassword ?? "",
      options.ownerPassword,
      options.allowedFlags
    );
    engineTask.wait(
      (success) => {
        if (success) {
          this.logger.info(
            "DocumentManagerPlugin",
            "SetDocumentEncryption",
            `Encryption set successfully on document ${documentId}`
          );
        }
        task.resolve(success);
      },
      (error) => {
        this.logger.error(
          "DocumentManagerPlugin",
          "SetDocumentEncryption",
          `Failed to set encryption on document ${documentId}`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  unlockOwnerPermissions(documentId, ownerPassword) {
    const task = new Task();
    const docState = this.coreState.core.documents[documentId];
    if (!(docState == null ? void 0 : docState.document)) {
      task.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${documentId} is not open`
      });
      return task;
    }
    const document = docState.document;
    this.logger.info(
      "DocumentManagerPlugin",
      "UnlockOwnerPermissions",
      `Attempting to unlock owner permissions on document ${documentId}`
    );
    const engineTask = this.engine.unlockOwnerPermissions(document, ownerPassword);
    engineTask.wait(
      (success) => {
        if (success) {
          this.logger.info(
            "DocumentManagerPlugin",
            "UnlockOwnerPermissions",
            `Owner permissions unlocked on document ${documentId}`
          );
          const fullPermissions = 4294967295;
          this.dispatchCoreAction(updateDocumentSecurity(documentId, fullPermissions, true));
        }
        task.resolve(success);
      },
      (error) => {
        this.logger.error(
          "DocumentManagerPlugin",
          "UnlockOwnerPermissions",
          `Failed to unlock owner permissions on document ${documentId}`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  removeEncryption(documentId) {
    const task = new Task();
    const docState = this.coreState.core.documents[documentId];
    if (!(docState == null ? void 0 : docState.document)) {
      task.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${documentId} is not open`
      });
      return task;
    }
    this.logger.info(
      "DocumentManagerPlugin",
      "RemoveEncryption",
      `Marking document ${documentId} for encryption removal on save`
    );
    const engineTask = this.engine.removeEncryption(docState.document);
    engineTask.wait(
      (success) => {
        if (success) {
          this.logger.info(
            "DocumentManagerPlugin",
            "RemoveEncryption",
            `Document ${documentId} marked for encryption removal`
          );
        }
        task.resolve(success);
      },
      (error) => {
        this.logger.error(
          "DocumentManagerPlugin",
          "RemoveEncryption",
          `Failed to mark document ${documentId} for encryption removal`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  // ─────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────
  checkDocumentLimit() {
    if (this.maxDocuments && Object.keys(this.coreState.core.documents).length >= this.maxDocuments) {
      return {
        code: PdfErrorCode.Unknown,
        message: `Maximum number of documents (${this.maxDocuments}) reached`
      };
    }
    return null;
  }
  validateRetry(documentId) {
    const docState = this.coreState.core.documents[documentId];
    if (!docState) {
      return {
        valid: false,
        error: {
          code: PdfErrorCode.NotFound,
          message: `Document ${documentId} not found`
        }
      };
    }
    if (docState.status === "loaded") {
      return {
        valid: false,
        error: {
          code: PdfErrorCode.Unknown,
          message: `Document ${documentId} is already loaded successfully`
        }
      };
    }
    if (docState.status !== "error") {
      return {
        valid: false,
        error: {
          code: PdfErrorCode.Unknown,
          message: `Document ${documentId} is not in error state (current state: ${docState.status})`
        }
      };
    }
    if (!this.loadOptions.has(documentId)) {
      return {
        valid: false,
        error: {
          code: PdfErrorCode.Unknown,
          message: `No retry information available for document ${documentId}`
        }
      };
    }
    return { valid: true };
  }
  retryUrlDocument(documentId, options) {
    const file = {
      id: documentId,
      url: options.url
    };
    return this.engine.openDocumentUrl(file, {
      password: options.password,
      mode: options.mode,
      requestOptions: options.requestOptions
    });
  }
  retryBufferDocument(documentId, options) {
    const file = {
      id: documentId,
      content: options.buffer
    };
    return this.engine.openDocumentBuffer(file, {
      password: options.password,
      normalizeRotation: true
    });
  }
  handleLoadTask(documentId, engineTask, context) {
    engineTask.wait(
      (pdfDocument) => {
        this.dispatchCoreAction(setDocumentLoaded(documentId, pdfDocument));
      },
      (error) => {
        this.handleLoadError(documentId, error, context);
      }
    );
  }
  handleLoadError(documentId, error, context) {
    var _a, _b, _c;
    const errorMessage = ((_a = error.reason) == null ? void 0 : _a.message) || "Failed to load document";
    this.logger.error("DocumentManagerPlugin", context, "Failed to load document", error);
    this.dispatchCoreAction(
      setDocumentError(documentId, errorMessage, (_b = error.reason) == null ? void 0 : _b.code, error.reason)
    );
    this.documentError$.emit({
      documentId,
      message: errorMessage,
      code: (_c = error.reason) == null ? void 0 : _c.code,
      reason: error.reason
    });
  }
  generateDocumentId() {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  extractNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastSegment = pathname.split("/").pop();
      if (!lastSegment) {
        return void 0;
      }
      let filename = decodeURIComponent(lastSegment);
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
      }
      return filename;
    } catch {
      return void 0;
    }
  }
  // ─────────────────────────────────────────────────────────
  // Plugin Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(config) {
    var _a;
    this.logger.info("DocumentManagerPlugin", "Initialize", "Document Manager Plugin initialized", {
      maxDocuments: this.maxDocuments,
      initialDocumentsCount: ((_a = config.initialDocuments) == null ? void 0 : _a.length) ?? 0
    });
    if (config.initialDocuments && config.initialDocuments.length > 0) {
      for (const docConfig of config.initialDocuments) {
        try {
          if ("buffer" in docConfig) {
            this.openDocumentBuffer(docConfig);
          } else if ("url" in docConfig) {
            this.openDocumentUrl(docConfig);
          }
        } catch (error) {
          this.logger.error(
            "DocumentManagerPlugin",
            "Initialize",
            "Failed to initiate initial document load",
            error
          );
        }
      }
    }
  }
  async destroy() {
    await this.closeAllDocuments().toPromise();
    this.loadOptions.clear();
    this.documentOpened$.clear();
    this.documentClosed$.clear();
    this.activeDocumentChanged$.clear();
    this.documentOrderChanged$.clear();
    this.documentError$.clear();
    super.destroy();
  }
};
_DocumentManagerPlugin.id = "document-manager";
let DocumentManagerPlugin = _DocumentManagerPlugin;
const DOCUMENT_MANAGER_PLUGIN_ID = "document-manager";
const manifest = {
  id: DOCUMENT_MANAGER_PLUGIN_ID,
  name: "Document Manager Plugin",
  version: "1.0.0",
  provides: ["document-manager"],
  requires: [],
  optional: [],
  defaultConfig: {
    maxDocuments: 10
  }
};
const DocumentManagerPluginPackage = {
  manifest,
  create: (registry, config) => new DocumentManagerPlugin(DOCUMENT_MANAGER_PLUGIN_ID, registry, config),
  reducer: (state) => state,
  initialState: {}
};
export {
  DOCUMENT_MANAGER_PLUGIN_ID,
  DocumentManagerPlugin,
  DocumentManagerPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
