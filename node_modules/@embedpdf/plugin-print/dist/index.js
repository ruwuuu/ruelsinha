import { BasePlugin, createEmitter } from "@embedpdf/core";
import { PdfPermissionFlag, PdfTaskHelper, PdfErrorCode, Task } from "@embedpdf/models";
const PRINT_PLUGIN_ID = "print";
const manifest = {
  id: PRINT_PLUGIN_ID,
  name: "Print Plugin",
  version: "1.0.0",
  provides: ["print"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const _PrintPlugin = class _PrintPlugin extends BasePlugin {
  constructor(id, registry, _config) {
    super(id, registry);
    this.printReady$ = createEmitter();
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      print: (options) => this.print(options),
      // Document-scoped operations
      forDocument: (documentId) => this.createPrintScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createPrintScope(documentId) {
    return {
      print: (options) => this.print(options, documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  print(options, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(id, PdfPermissionFlag.Print)) {
      this.logger.debug(
        "PrintPlugin",
        "Print",
        `Cannot print: document ${id} lacks Print permission`
      );
      return PdfTaskHelper.reject({
        code: PdfErrorCode.Security,
        message: "Document lacks Print permission"
      });
    }
    const printOptions = options ?? {};
    const task = new Task();
    task.progress({ stage: "preparing", message: "Preparing document..." });
    const prepare = this.preparePrintDocument(printOptions, id);
    prepare.wait(
      (buffer) => {
        task.progress({ stage: "document-ready", message: "Document prepared successfully" });
        this.printReady$.emit({
          documentId: id,
          options: printOptions,
          buffer,
          task
        });
      },
      (error) => task.fail(error)
    );
    return task;
  }
  preparePrintDocument(options, documentId) {
    const coreDoc = this.coreState.core.documents[documentId];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: `Document ${documentId} not found`
      });
    }
    return this.engine.preparePrintDocument(coreDoc.document, options);
  }
  // ─────────────────────────────────────────────────────────
  // Event Listeners
  // ─────────────────────────────────────────────────────────
  onPrintRequest(listener) {
    return this.printReady$.on(listener);
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_) {
    this.logger.info("PrintPlugin", "Initialize", "Print plugin initialized");
  }
  async destroy() {
    this.printReady$.clear();
    await super.destroy();
  }
};
_PrintPlugin.id = "print";
let PrintPlugin = _PrintPlugin;
const PrintPluginPackage = {
  manifest,
  create: (registry, config) => new PrintPlugin(PRINT_PLUGIN_ID, registry, config),
  reducer: () => {
  },
  initialState: {}
};
export {
  PRINT_PLUGIN_ID,
  PrintPlugin,
  PrintPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
