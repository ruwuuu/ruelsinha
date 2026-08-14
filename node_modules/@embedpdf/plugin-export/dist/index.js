import { BasePlugin, createEmitter } from "@embedpdf/core";
import { PdfTaskHelper, PdfErrorCode, Task } from "@embedpdf/models";
const _ExportPlugin = class _ExportPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.downloadRequest$ = createEmitter();
    this.config = config;
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      saveAsCopy: () => this.saveAsCopy(),
      download: () => this.download(),
      // Document-scoped operations
      forDocument: (documentId) => this.createExportScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createExportScope(documentId) {
    return {
      saveAsCopy: () => this.saveAsCopy(documentId),
      download: () => this.download(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  download(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.downloadRequest$.emit({ documentId: id });
  }
  saveAsCopy(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${id} not found`
      });
    }
    return this.engine.saveAsCopy(coreDoc.document);
  }
  saveAsCopyAndGetBufferAndName(documentId) {
    const task = new Task();
    const coreDoc = this.coreState.core.documents[documentId];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${documentId} not found`
      });
    }
    this.saveAsCopy(documentId).wait(
      (result) => {
        task.resolve({
          buffer: result,
          name: coreDoc.name ?? this.config.defaultFileName
        });
      },
      (error) => task.fail(error)
    );
    return task;
  }
  // ─────────────────────────────────────────────────────────
  // Event Listeners
  // ─────────────────────────────────────────────────────────
  onRequest(listener) {
    return this.downloadRequest$.on(listener);
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_) {
    this.logger.info("ExportPlugin", "Initialize", "Export plugin initialized");
  }
  async destroy() {
    this.downloadRequest$.clear();
    await super.destroy();
  }
};
_ExportPlugin.id = "export";
let ExportPlugin = _ExportPlugin;
const EXPORT_PLUGIN_ID = "export";
const manifest = {
  id: EXPORT_PLUGIN_ID,
  name: "Export Plugin",
  version: "1.0.0",
  provides: ["export"],
  requires: [],
  optional: [],
  defaultConfig: {
    defaultFileName: "document.pdf"
  }
};
const ExportPluginPackage = {
  manifest,
  create: (registry, config) => new ExportPlugin(EXPORT_PLUGIN_ID, registry, config),
  reducer: () => {
  },
  initialState: {}
};
export {
  EXPORT_PLUGIN_ID,
  ExportPlugin,
  ExportPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
