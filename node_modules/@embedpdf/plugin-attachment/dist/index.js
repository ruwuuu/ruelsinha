import { BasePlugin } from "@embedpdf/core";
import { PdfTaskHelper, PdfErrorCode } from "@embedpdf/models";
const _AttachmentPlugin = class _AttachmentPlugin extends BasePlugin {
  constructor(id, registry) {
    super(id, registry);
  }
  async initialize(_) {
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      getAttachments: () => this.getAttachments(),
      downloadAttachment: (attachment) => this.downloadAttachment(attachment),
      // Document-scoped operations
      forDocument: (documentId) => this.createAttachmentScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createAttachmentScope(documentId) {
    return {
      getAttachments: () => this.getAttachments(documentId),
      downloadAttachment: (attachment) => this.downloadAttachment(attachment, documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  downloadAttachment(attachment, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: `Document ${id} not found`
      });
    }
    return this.engine.readAttachmentContent(coreDoc.document, attachment);
  }
  getAttachments(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: `Document ${id} not found`
      });
    }
    return this.engine.getAttachments(coreDoc.document);
  }
};
_AttachmentPlugin.id = "attachment";
let AttachmentPlugin = _AttachmentPlugin;
const ATTACHMENT_PLUGIN_ID = "attachment";
const manifest = {
  id: ATTACHMENT_PLUGIN_ID,
  name: "Attachment Plugin",
  version: "1.0.0",
  provides: ["attachment"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const AttachmentPluginPackage = {
  manifest,
  create: (registry) => new AttachmentPlugin(ATTACHMENT_PLUGIN_ID, registry),
  reducer: () => {
  },
  initialState: {}
};
export {
  ATTACHMENT_PLUGIN_ID,
  AttachmentPlugin,
  AttachmentPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
