import { clamp, BasePlugin, createEmitter, createBehaviorEmitter } from "@embedpdf/core";
import { ignore } from "@embedpdf/models";
const CAPTURE_PLUGIN_ID = "capture";
const manifest = {
  id: CAPTURE_PLUGIN_ID,
  name: "Capture Plugin",
  version: "1.0.0",
  provides: ["capture"],
  requires: ["render"],
  optional: ["interaction-manager"],
  defaultConfig: {
    scale: 1,
    imageType: "image/png",
    withAnnotations: false
  }
};
function createMarqueeHandler(opts) {
  const { pageSize, scale, minDragPx = 5, onPreview, onCommit } = opts;
  let start = null;
  let last = null;
  return {
    onPointerDown: (pos, evt) => {
      var _a;
      start = pos;
      last = { origin: { x: pos.x, y: pos.y }, size: { width: 0, height: 0 } };
      onPreview == null ? void 0 : onPreview(last);
      (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
    },
    onPointerMove: (pos) => {
      if (!start) return;
      const x = clamp(pos.x, 0, pageSize.width);
      const y = clamp(pos.y, 0, pageSize.height);
      last = {
        origin: { x: Math.min(start.x, x), y: Math.min(start.y, y) },
        size: { width: Math.abs(x - start.x), height: Math.abs(y - start.y) }
      };
      onPreview == null ? void 0 : onPreview(last);
    },
    onPointerUp: (_pos, evt) => {
      var _a;
      if (last) {
        const dragPx = Math.max(last.size.width, last.size.height) * scale;
        if (dragPx > minDragPx) {
          onCommit == null ? void 0 : onCommit(last);
        }
      }
      start = null;
      last = null;
      onPreview == null ? void 0 : onPreview(null);
      (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
    },
    onPointerCancel: (_pos, evt) => {
      var _a;
      start = null;
      last = null;
      onPreview == null ? void 0 : onPreview(null);
      (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
    }
  };
}
const INIT_CAPTURE_STATE = "CAPTURE/INIT_STATE";
const CLEANUP_CAPTURE_STATE = "CAPTURE/CLEANUP_STATE";
const SET_ACTIVE_DOCUMENT = "CAPTURE/SET_ACTIVE_DOCUMENT";
const SET_MARQUEE_CAPTURE_ACTIVE = "CAPTURE/SET_MARQUEE_CAPTURE_ACTIVE";
function initCaptureState(documentId, state) {
  return { type: INIT_CAPTURE_STATE, payload: { documentId, state } };
}
function cleanupCaptureState(documentId) {
  return { type: CLEANUP_CAPTURE_STATE, payload: documentId };
}
function setActiveDocument(documentId) {
  return { type: SET_ACTIVE_DOCUMENT, payload: documentId };
}
function setMarqueeCaptureActive(documentId, isActive) {
  return { type: SET_MARQUEE_CAPTURE_ACTIVE, payload: { documentId, isActive } };
}
const initialDocumentState = {
  isMarqueeCaptureActive: false
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const captureReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_CAPTURE_STATE: {
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
    case CLEANUP_CAPTURE_STATE: {
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
    case SET_MARQUEE_CAPTURE_ACTIVE: {
      const { documentId, isActive } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            isMarqueeCaptureActive: isActive
          }
        }
      };
    }
    default:
      return state;
  }
};
const _CapturePlugin = class _CapturePlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a;
    super(id, registry);
    this.captureArea$ = createEmitter();
    this.state$ = createBehaviorEmitter();
    this.config = config;
    this.renderCapability = this.registry.getPlugin("render").provides();
    this.interactionManagerCapability = (_a = this.registry.getPlugin("interaction-manager")) == null ? void 0 : _a.provides();
    if (this.interactionManagerCapability) {
      this.interactionManagerCapability.registerMode({
        id: "marqueeCapture",
        scope: "page",
        exclusive: true,
        cursor: "crosshair"
      });
      this.interactionManagerCapability.onModeChange((state) => {
        const isMarqueeActive = state.activeMode === "marqueeCapture";
        const docState = this.getDocumentState(state.documentId);
        if (docState && docState.isMarqueeCaptureActive !== isMarqueeActive) {
          this.dispatch(setMarqueeCaptureActive(state.documentId, isMarqueeActive));
        }
      });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    const docState = {
      ...initialDocumentState
    };
    this.dispatch(initCaptureState(documentId, docState));
    this.logger.debug(
      "CapturePlugin",
      "DocumentOpened",
      `Initialized capture state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupCaptureState(documentId));
    this.logger.debug(
      "CapturePlugin",
      "DocumentClosed",
      `Cleaned up capture state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  async initialize(_) {
  }
  buildCapability() {
    return {
      // Active document operations
      captureArea: (pageIndex, rect) => this.captureArea(pageIndex, rect),
      enableMarqueeCapture: () => this.enableMarqueeCapture(),
      disableMarqueeCapture: () => this.disableMarqueeCapture(),
      toggleMarqueeCapture: () => this.toggleMarqueeCapture(),
      isMarqueeCaptureActive: () => this.isMarqueeCaptureActive(),
      getState: () => this.getDocumentStateOrThrow(),
      // Document-scoped operations
      forDocument: (documentId) => this.createCaptureScope(documentId),
      // Global
      registerMarqueeOnPage: (opts) => this.registerMarqueeOnPage(opts),
      // Events
      onCaptureArea: this.captureArea$.on,
      onStateChange: this.state$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createCaptureScope(documentId) {
    return {
      captureArea: (pageIndex, rect) => this.captureArea(pageIndex, rect, documentId),
      enableMarqueeCapture: () => this.enableMarqueeCapture(documentId),
      disableMarqueeCapture: () => this.disableMarqueeCapture(documentId),
      toggleMarqueeCapture: () => this.toggleMarqueeCapture(documentId),
      isMarqueeCaptureActive: () => this.isMarqueeCaptureActive(documentId),
      getState: () => this.getDocumentStateOrThrow(documentId),
      onCaptureArea: (listener) => this.captureArea$.on((event) => {
        if (event.documentId === documentId) listener(event);
      }),
      onStateChange: (listener) => this.state$.on((event) => {
        if (event.documentId === documentId) listener(event.state);
      })
    };
  }
  // ─────────────────────────────────────────────────────────
  // State Helpers
  // ─────────────────────────────────────────────────────────
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? null;
  }
  getDocumentStateOrThrow(documentId) {
    const state = this.getDocumentState(documentId);
    if (!state) {
      throw new Error(`Capture state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Per-Document Operations
  // ─────────────────────────────────────────────────────────
  registerMarqueeOnPage(opts) {
    if (!this.interactionManagerCapability) {
      this.logger.warn(
        "CapturePlugin",
        "MissingDependency",
        "Interaction manager plugin not loaded, marquee capture disabled"
      );
      return () => {
      };
    }
    const coreDoc = this.coreState.core.documents[opts.documentId];
    if (!coreDoc || !coreDoc.document) {
      this.logger.warn("CapturePlugin", "DocumentNotFound", "Document not found");
      return () => {
      };
    }
    const page = coreDoc.document.pages[opts.pageIndex];
    if (!page) {
      this.logger.warn("CapturePlugin", "PageNotFound", `Page ${opts.pageIndex} not found`);
      return () => {
      };
    }
    const handlers = createMarqueeHandler({
      pageSize: page.size,
      scale: opts.scale,
      onPreview: opts.callback.onPreview,
      onCommit: (rect) => {
        var _a, _b;
        this.captureArea(opts.pageIndex, rect, opts.documentId);
        (_b = (_a = opts.callback).onCommit) == null ? void 0 : _b.call(_a, rect);
      }
    });
    const off = this.interactionManagerCapability.registerHandlers({
      documentId: opts.documentId,
      modeId: "marqueeCapture",
      handlers,
      pageIndex: opts.pageIndex
    });
    return off;
  }
  captureArea(pageIndex, rect, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.disableMarqueeCapture(id);
    const task = this.renderCapability.forDocument(id).renderPageRect({
      pageIndex,
      rect,
      options: {
        imageType: this.config.imageType,
        scaleFactor: this.config.scale,
        withAnnotations: this.config.withAnnotations || false
      }
    });
    task.wait((blob) => {
      this.captureArea$.emit({
        documentId: id,
        pageIndex,
        rect,
        blob,
        imageType: this.config.imageType || "image/png",
        scale: this.config.scale || 1,
        withAnnotations: this.config.withAnnotations || false
      });
    }, ignore);
  }
  enableMarqueeCapture(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activate("marqueeCapture");
  }
  disableMarqueeCapture(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activateDefaultMode();
  }
  toggleMarqueeCapture(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const scope = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id);
    if ((scope == null ? void 0 : scope.getActiveMode()) === "marqueeCapture") {
      scope.activateDefaultMode();
    } else {
      scope == null ? void 0 : scope.activate("marqueeCapture");
    }
  }
  isMarqueeCaptureActive(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    return ((_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).getActiveMode()) === "marqueeCapture";
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if (prevDoc && newDoc && prevDoc.isMarqueeCaptureActive !== newDoc.isMarqueeCaptureActive) {
        this.state$.emit({
          documentId,
          state: newDoc
        });
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async destroy() {
    this.captureArea$.clear();
    this.state$.clear();
    super.destroy();
  }
};
_CapturePlugin.id = "capture";
let CapturePlugin = _CapturePlugin;
const CapturePluginPackage = {
  manifest,
  create: (registry, config) => new CapturePlugin(CAPTURE_PLUGIN_ID, registry, config),
  reducer: captureReducer,
  initialState
};
export {
  CAPTURE_PLUGIN_ID,
  CLEANUP_CAPTURE_STATE,
  CapturePlugin,
  CapturePluginPackage,
  INIT_CAPTURE_STATE,
  SET_ACTIVE_DOCUMENT,
  SET_MARQUEE_CAPTURE_ACTIVE,
  captureReducer,
  cleanupCaptureState,
  initCaptureState,
  initialDocumentState,
  initialState,
  manifest,
  setActiveDocument,
  setMarqueeCaptureActive
};
//# sourceMappingURL=index.js.map
