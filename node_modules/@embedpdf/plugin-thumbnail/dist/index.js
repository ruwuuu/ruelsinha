import { BasePlugin, createScopedEmitter, REFRESH_PAGES } from "@embedpdf/core";
import { ignore } from "@embedpdf/models";
const THUMBNAIL_PLUGIN_ID = "thumbnail";
const manifest = {
  id: THUMBNAIL_PLUGIN_ID,
  name: "Thumbnail Plugin",
  version: "1.0.0",
  provides: ["thumbnail"],
  requires: ["render"],
  optional: ["scroll"],
  defaultConfig: {
    width: 150,
    gap: 10,
    buffer: 3,
    labelHeight: 16,
    autoScroll: true,
    scrollBehavior: "smooth",
    imagePadding: 0,
    paddingY: 0
  }
};
const INIT_THUMBNAIL_STATE = "THUMBNAIL/INIT_STATE";
const CLEANUP_THUMBNAIL_STATE = "THUMBNAIL/CLEANUP_STATE";
const SET_ACTIVE_DOCUMENT = "THUMBNAIL/SET_ACTIVE_DOCUMENT";
const SET_WINDOW_STATE = "THUMBNAIL/SET_WINDOW_STATE";
const UPDATE_VIEWPORT_METRICS = "THUMBNAIL/UPDATE_VIEWPORT_METRICS";
function initThumbnailState(documentId, state) {
  return { type: INIT_THUMBNAIL_STATE, payload: { documentId, state } };
}
function cleanupThumbnailState(documentId) {
  return { type: CLEANUP_THUMBNAIL_STATE, payload: documentId };
}
function setActiveDocument(documentId) {
  return { type: SET_ACTIVE_DOCUMENT, payload: documentId };
}
function setWindowState(documentId, window) {
  return { type: SET_WINDOW_STATE, payload: { documentId, window } };
}
function updateViewportMetrics(documentId, scrollY, viewportH) {
  return { type: UPDATE_VIEWPORT_METRICS, payload: { documentId, scrollY, viewportH } };
}
const initialDocumentState = {
  thumbs: [],
  window: null,
  viewportH: 0,
  scrollY: 0
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const thumbnailReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_THUMBNAIL_STATE: {
      const { documentId, state: docState } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        },
        // Set as active if no active document
        activeDocumentId: state.activeDocumentId ?? documentId
      };
    }
    case CLEANUP_THUMBNAIL_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_WINDOW_STATE: {
      const { documentId, window } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            window
          }
        }
      };
    }
    case UPDATE_VIEWPORT_METRICS: {
      const { documentId, scrollY, viewportH } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            scrollY,
            viewportH
          }
        }
      };
    }
    default:
      return state;
  }
};
const _ThumbnailPlugin = class _ThumbnailPlugin extends BasePlugin {
  constructor(id, registry, cfg) {
    var _a;
    super(id, registry);
    this.cfg = cfg;
    this.scrollCapability = null;
    this.taskCaches = /* @__PURE__ */ new Map();
    this.canAutoScroll = /* @__PURE__ */ new Map();
    this.window$ = createScopedEmitter(
      (documentId, window) => ({ documentId, window })
    );
    this.scrollTo$ = createScopedEmitter(
      (documentId, options) => ({ documentId, options })
    );
    this.refreshPages$ = createScopedEmitter(
      (documentId, pages) => ({ documentId, pages }),
      { cache: false }
    );
    this.renderCapability = this.registry.getPlugin("render").provides();
    this.scrollCapability = ((_a = this.registry.getPlugin("scroll")) == null ? void 0 : _a.provides()) ?? null;
    this.coreStore.onAction(REFRESH_PAGES, (action) => {
      const documentId = action.payload.documentId ?? this.getActiveDocumentId();
      const pages = action.payload.pageIndexes;
      this.refreshPages$.emit(documentId, pages);
      const taskCache = this.taskCaches.get(documentId);
      if (taskCache) {
        for (const pageIndex of pages) {
          taskCache.delete(pageIndex);
        }
      }
    });
    if (this.scrollCapability && this.cfg.autoScroll !== false) {
      this.scrollCapability.onPageChangeState(({ documentId, state }) => {
        this.canAutoScroll.set(documentId, !state.isChanging);
        if (!state.isChanging) {
          this.scrollToThumb(state.targetPage - 1, documentId);
        }
      });
      this.scrollCapability.onPageChange(({ documentId, pageNumber }) => {
        if (this.canAutoScroll.get(documentId) !== false) {
          this.scrollToThumb(pageNumber - 1, documentId);
        }
      });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.dispatch(
      initThumbnailState(documentId, {
        ...initialDocumentState
      })
    );
    this.taskCaches.set(documentId, /* @__PURE__ */ new Map());
    this.canAutoScroll.set(documentId, true);
    this.logger.debug(
      "ThumbnailPlugin",
      "DocumentOpened",
      `Initialized thumbnail state for document: ${documentId}`
    );
  }
  onDocumentLoaded(documentId) {
    this.calculateWindowState(documentId);
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupThumbnailState(documentId));
    const taskCache = this.taskCaches.get(documentId);
    if (taskCache) {
      taskCache.forEach((task) => {
        task.abort({
          code: "cancelled",
          message: "Document closed"
        });
      });
      taskCache.clear();
      this.taskCaches.delete(documentId);
    }
    this.canAutoScroll.delete(documentId);
    this.window$.clearScope(documentId);
    this.scrollTo$.clearScope(documentId);
    this.refreshPages$.clearScope(documentId);
    this.logger.debug(
      "ThumbnailPlugin",
      "DocumentClosed",
      `Cleaned up thumbnail state for document: ${documentId}`
    );
  }
  onRotationChanged(documentId) {
    this.calculateWindowState(documentId);
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      scrollToThumb: (pageIdx) => this.scrollToThumb(pageIdx),
      renderThumb: (idx, dpr) => this.renderThumb(idx, dpr),
      updateWindow: (scrollY, viewportH) => this.updateWindow(scrollY, viewportH),
      getWindow: () => this.getWindow(),
      // Document-scoped operations
      forDocument: (documentId) => this.createThumbnailScope(documentId),
      // Events
      onWindow: this.window$.onGlobal,
      onScrollTo: this.scrollTo$.onGlobal,
      onRefreshPages: this.refreshPages$.onGlobal
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createThumbnailScope(documentId) {
    return {
      scrollToThumb: (pageIdx) => this.scrollToThumb(pageIdx, documentId),
      renderThumb: (idx, dpr) => this.renderThumb(idx, dpr, documentId),
      updateWindow: (scrollY, viewportH) => this.updateWindow(scrollY, viewportH, documentId),
      getWindow: () => this.getWindow(documentId),
      onWindow: this.window$.forScope(documentId),
      onScrollTo: this.scrollTo$.forScope(documentId),
      onRefreshPages: this.refreshPages$.forScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // State Helpers
  // ─────────────────────────────────────────────────────────
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? null;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  calculateWindowState(documentId) {
    const coreDoc = this.coreState.core.documents[documentId];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) return;
    const OUTER_W = this.cfg.width ?? 120;
    const L = this.cfg.labelHeight ?? 16;
    const GAP = this.cfg.gap ?? 8;
    const P = this.cfg.imagePadding ?? 0;
    const PADDING_Y = this.cfg.paddingY ?? 0;
    const INNER_W = Math.max(1, OUTER_W - 2 * P);
    let offset = PADDING_Y;
    const thumbs = coreDoc.document.pages.map((p) => {
      const isRotated90or270 = p.rotation % 2 === 1;
      const effectiveWidth = isRotated90or270 ? p.size.height : p.size.width;
      const effectiveHeight = isRotated90or270 ? p.size.width : p.size.height;
      const ratio = effectiveHeight / effectiveWidth;
      const imgH = Math.round(INNER_W * ratio);
      const wrapH = P + imgH + P + L;
      const meta = {
        pageIndex: p.index,
        width: INNER_W,
        // bitmap width (for <img> size)
        height: imgH,
        // bitmap height (for <img> size)
        wrapperHeight: wrapH,
        // full row height used by virtualizer
        top: offset,
        // top of the row
        labelHeight: L,
        padding: P
      };
      offset += wrapH + GAP;
      return meta;
    });
    const window = {
      start: -1,
      end: -1,
      items: [],
      totalHeight: offset - GAP + PADDING_Y
      // Add bottom padding to total height
    };
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    this.dispatch(
      initThumbnailState(documentId, {
        ...docState,
        thumbs,
        window
      })
    );
    if (docState.viewportH > 0) {
      this.updateWindow(docState.scrollY, docState.viewportH, documentId);
    } else {
      this.window$.emit(documentId, window);
    }
  }
  updateWindow(scrollY, viewportH, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(id);
    if (!docState || !docState.window || docState.thumbs.length === 0) return;
    const BUF = this.cfg.buffer ?? 3;
    this.dispatch(updateViewportMetrics(id, scrollY, viewportH));
    let low = 0, high = docState.thumbs.length - 1, first = 0;
    while (low <= high) {
      const mid = low + high >> 1;
      const m = docState.thumbs[mid];
      if (m.top + m.wrapperHeight < scrollY) low = mid + 1;
      else {
        first = mid;
        high = mid - 1;
      }
    }
    let last = first;
    const limit = scrollY + viewportH;
    while (last + 1 < docState.thumbs.length && docState.thumbs[last].top < limit) last++;
    last = Math.min(docState.thumbs.length - 1, last + BUF);
    const start = Math.max(0, first - BUF);
    if (start === docState.window.start && last === docState.window.end) return;
    const newWindow = {
      start,
      end: last,
      items: docState.thumbs.slice(start, last + 1),
      totalHeight: docState.window.totalHeight
    };
    this.dispatch(setWindowState(id, newWindow));
    this.window$.emit(id, newWindow);
  }
  getWindow(documentId) {
    const docState = this.getDocumentState(documentId);
    return (docState == null ? void 0 : docState.window) ?? null;
  }
  scrollToThumb(pageIdx, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(id);
    if (!docState || !docState.window) return;
    const item = docState.thumbs[pageIdx];
    if (!item) return;
    const behavior = this.cfg.scrollBehavior ?? "smooth";
    const PADDING_Y = this.cfg.paddingY ?? 0;
    if (docState.viewportH <= 0) {
      const top2 = Math.max(PADDING_Y, item.top - item.wrapperHeight);
      this.scrollTo$.emit(id, { top: top2, behavior });
      return;
    }
    const margin = 8;
    const top = item.top;
    const bottom = item.top + item.wrapperHeight;
    const needsUp = top < docState.scrollY + margin + PADDING_Y;
    const needsDown = bottom > docState.scrollY + docState.viewportH - margin;
    if (needsUp) {
      this.scrollTo$.emit(id, {
        top: Math.max(0, top - PADDING_Y),
        behavior
      });
    } else if (needsDown) {
      this.scrollTo$.emit(id, {
        top: Math.max(0, bottom - docState.viewportH + PADDING_Y),
        behavior
      });
    }
  }
  renderThumb(idx, dpr, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const taskCache = this.taskCaches.get(id);
    if (!taskCache) {
      throw new Error(`Task cache not found for document: ${id}`);
    }
    if (taskCache.has(idx)) return taskCache.get(idx);
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document not found: ${id}`);
    }
    const page = coreDoc.document.pages[idx];
    if (!page) {
      throw new Error(`Page ${idx} not found in document: ${id}`);
    }
    const OUTER_W = this.cfg.width ?? 120;
    const P = this.cfg.imagePadding ?? 0;
    const INNER_W = Math.max(1, OUTER_W - 2 * P);
    const scale = INNER_W / page.size.width;
    const task = this.renderCapability.forDocument(id).renderPageRect({
      pageIndex: idx,
      rect: { origin: { x: 0, y: 0 }, size: page.size },
      options: {
        scaleFactor: scale,
        dpr,
        rotation: page.rotation
      }
    });
    taskCache.set(idx, task);
    task.wait(ignore, () => taskCache.delete(idx));
    return task;
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize() {
    this.logger.info("ThumbnailPlugin", "Initialize", "Thumbnail plugin initialized");
  }
  async destroy() {
    this.window$.clear();
    this.refreshPages$.clear();
    this.scrollTo$.clear();
    this.taskCaches.forEach((cache) => {
      cache.forEach((task) => {
        task.abort({
          code: "cancelled",
          message: "Plugin destroyed"
        });
      });
      cache.clear();
    });
    this.taskCaches.clear();
    this.canAutoScroll.clear();
    super.destroy();
  }
};
_ThumbnailPlugin.id = "thumbnail";
let ThumbnailPlugin = _ThumbnailPlugin;
const ThumbnailPluginPackage = {
  manifest,
  create: (registry, config) => new ThumbnailPlugin(THUMBNAIL_PLUGIN_ID, registry, config),
  reducer: thumbnailReducer,
  initialState
};
export {
  CLEANUP_THUMBNAIL_STATE,
  INIT_THUMBNAIL_STATE,
  SET_ACTIVE_DOCUMENT,
  SET_WINDOW_STATE,
  THUMBNAIL_PLUGIN_ID,
  ThumbnailPlugin,
  ThumbnailPluginPackage,
  UPDATE_VIEWPORT_METRICS,
  cleanupThumbnailState,
  initThumbnailState,
  initialDocumentState,
  initialState,
  manifest,
  setActiveDocument,
  setWindowState,
  thumbnailReducer,
  updateViewportMetrics
};
//# sourceMappingURL=index.js.map
