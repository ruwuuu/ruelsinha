import { BasePlugin } from "@embedpdf/core";
const _RenderPlugin = class _RenderPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.config = config;
  }
  // No onDocumentLoadingStarted or onDocumentClosed needed!
  buildCapability() {
    return {
      // Active document operations
      renderPage: (options) => this.renderPage(options),
      renderPageRect: (options) => this.renderPageRect(options),
      renderPageRaw: (options) => this.renderPageRaw(options),
      renderPageRectRaw: (options) => this.renderPageRectRaw(options),
      // Document-scoped operations
      forDocument: (documentId) => this.createRenderScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createRenderScope(documentId) {
    return {
      renderPage: (options) => this.renderPage(options, documentId),
      renderPageRect: (options) => this.renderPageRect(options, documentId),
      renderPageRaw: (options) => this.renderPageRaw(options, documentId),
      renderPageRectRaw: (options) => this.renderPageRectRaw(options, documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  renderPage({ pageIndex, options }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    const page = coreDoc.document.pages.find((p) => p.index === pageIndex);
    if (!page) {
      throw new Error(`Page ${pageIndex} not found in document ${id}`);
    }
    const mergedOptions = {
      ...options ?? {},
      withForms: (options == null ? void 0 : options.withForms) ?? this.config.withForms ?? false,
      withAnnotations: (options == null ? void 0 : options.withAnnotations) ?? this.config.withAnnotations ?? false,
      imageType: (options == null ? void 0 : options.imageType) ?? this.config.defaultImageType ?? "image/png",
      imageQuality: (options == null ? void 0 : options.imageQuality) ?? this.config.defaultImageQuality ?? 0.92
    };
    return this.engine.renderPage(coreDoc.document, page, mergedOptions);
  }
  renderPageRect({ pageIndex, rect, options }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    const page = coreDoc.document.pages.find((p) => p.index === pageIndex);
    if (!page) {
      throw new Error(`Page ${pageIndex} not found in document ${id}`);
    }
    const mergedOptions = {
      ...options ?? {},
      withForms: (options == null ? void 0 : options.withForms) ?? this.config.withForms ?? false,
      withAnnotations: (options == null ? void 0 : options.withAnnotations) ?? this.config.withAnnotations ?? false,
      imageType: (options == null ? void 0 : options.imageType) ?? this.config.defaultImageType ?? "image/png",
      imageQuality: (options == null ? void 0 : options.imageQuality) ?? this.config.defaultImageQuality ?? 0.92
    };
    return this.engine.renderPageRect(coreDoc.document, page, rect, mergedOptions);
  }
  // ─────────────────────────────────────────────────────────
  // Raw Rendering (returns ImageDataLike, skips encoding)
  // ─────────────────────────────────────────────────────────
  renderPageRaw({ pageIndex, options }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    const page = coreDoc.document.pages.find((p) => p.index === pageIndex);
    if (!page) {
      throw new Error(`Page ${pageIndex} not found in document ${id}`);
    }
    const mergedOptions = {
      ...options ?? {},
      withForms: (options == null ? void 0 : options.withForms) ?? this.config.withForms ?? false,
      withAnnotations: (options == null ? void 0 : options.withAnnotations) ?? this.config.withAnnotations ?? false
    };
    return this.engine.renderPageRaw(coreDoc.document, page, mergedOptions);
  }
  renderPageRectRaw({ pageIndex, rect, options }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    const page = coreDoc.document.pages.find((p) => p.index === pageIndex);
    if (!page) {
      throw new Error(`Page ${pageIndex} not found in document ${id}`);
    }
    const mergedOptions = {
      ...options ?? {},
      withForms: (options == null ? void 0 : options.withForms) ?? this.config.withForms ?? false,
      withAnnotations: (options == null ? void 0 : options.withAnnotations) ?? this.config.withAnnotations ?? false
    };
    return this.engine.renderPageRectRaw(coreDoc.document, page, rect, mergedOptions);
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_config) {
    this.logger.info("RenderPlugin", "Initialize", "Render plugin initialized");
  }
  async destroy() {
    super.destroy();
  }
};
_RenderPlugin.id = "render";
let RenderPlugin = _RenderPlugin;
const RENDER_PLUGIN_ID = "render";
const manifest = {
  id: RENDER_PLUGIN_ID,
  name: "Render Plugin",
  version: "1.0.0",
  provides: ["render"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const RenderPluginPackage = {
  manifest,
  create: (registry, config) => new RenderPlugin(RENDER_PLUGIN_ID, registry, config),
  reducer: () => {
  },
  initialState: {}
};
export {
  RenderPlugin,
  RenderPluginPackage
};
//# sourceMappingURL=index.js.map
