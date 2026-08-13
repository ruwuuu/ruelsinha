import { BasePlugin } from "@embedpdf/core";
const BOOKMARK_PLUGIN_ID = "bookmark";
const manifest = {
  id: BOOKMARK_PLUGIN_ID,
  name: "Bookmark Plugin",
  version: "1.0.0",
  provides: ["bookmark"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const _BookmarkPlugin = class _BookmarkPlugin extends BasePlugin {
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
      getBookmarks: () => this.getBookmarks(),
      // Document-scoped operations
      forDocument: (documentId) => this.createBookmarkScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createBookmarkScope(documentId) {
    return {
      getBookmarks: () => this.getBookmarks(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  getBookmarks(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    return this.engine.getBookmarks(coreDoc.document);
  }
};
_BookmarkPlugin.id = "bookmark";
let BookmarkPlugin = _BookmarkPlugin;
const BookmarkPluginPackage = {
  manifest,
  create: (registry) => new BookmarkPlugin(BOOKMARK_PLUGIN_ID, registry),
  reducer: () => {
  },
  initialState: {}
};
export {
  BOOKMARK_PLUGIN_ID,
  BookmarkPlugin,
  BookmarkPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
