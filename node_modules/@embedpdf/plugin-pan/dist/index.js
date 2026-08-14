import { BasePlugin, createBehaviorEmitter } from "@embedpdf/core";
import { InteractionManagerPlugin } from "@embedpdf/plugin-interaction-manager";
import { ViewportPlugin } from "@embedpdf/plugin-viewport";
const INIT_PAN_STATE = "PAN/INIT_STATE";
const CLEANUP_PAN_STATE = "PAN/CLEANUP_STATE";
const SET_ACTIVE_PAN_DOCUMENT = "PAN/SET_ACTIVE_DOCUMENT";
const SET_PAN_MODE = "PAN/SET_PAN_MODE";
function initPanState(documentId, state) {
  return { type: INIT_PAN_STATE, payload: { documentId, state } };
}
function cleanupPanState(documentId) {
  return { type: CLEANUP_PAN_STATE, payload: documentId };
}
function setActivePanDocument(documentId) {
  return { type: SET_ACTIVE_PAN_DOCUMENT, payload: documentId };
}
function setPanMode(documentId, isPanMode) {
  return { type: SET_PAN_MODE, payload: { documentId, isPanMode } };
}
const _PanPlugin = class _PanPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b, _c;
    super(id, registry);
    this.panMode$ = createBehaviorEmitter();
    this.documentHandlers = /* @__PURE__ */ new Map();
    this.config = config;
    this.interactionManager = (_a = registry.getPlugin(InteractionManagerPlugin.id)) == null ? void 0 : _a.provides();
    this.viewport = (_b = registry.getPlugin(ViewportPlugin.id)) == null ? void 0 : _b.provides();
    if (this.interactionManager) {
      this.interactionManager.registerMode({
        id: "panMode",
        scope: "global",
        exclusive: false,
        cursor: "grab",
        wantsRawTouch: false
      });
      (_c = this.interactionManager) == null ? void 0 : _c.onModeChange((state) => {
        const isPanMode = state.activeMode === "panMode";
        const docState = this.getDocumentState(state.documentId);
        if (docState && docState.isPanMode !== isPanMode) {
          this.dispatch(setPanMode(state.documentId, isPanMode));
        }
      });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    const docState = {
      isPanMode: false
    };
    this.dispatch(initPanState(documentId, docState));
    this.registerPanHandlersForDocument(documentId);
    if (this.config.defaultMode === "always") {
      this.makePanDefault(true);
    }
    this.logger.debug(
      "PanPlugin",
      "DocumentOpened",
      `Initialized pan state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    const cleanup = this.documentHandlers.get(documentId);
    if (cleanup) {
      cleanup();
      this.documentHandlers.delete(documentId);
    }
    this.dispatch(cleanupPanState(documentId));
    this.logger.debug(
      "PanPlugin",
      "DocumentClosed",
      `Cleaned up pan state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      enablePan: () => this.enablePan(),
      disablePan: () => this.disablePan(),
      togglePan: () => this.togglePan(),
      makePanDefault: (autoActivate) => this.makePanDefault(autoActivate),
      isPanMode: () => this.isPanMode(),
      // Document-scoped operations
      forDocument: (documentId) => this.createPanScope(documentId),
      // Events
      onPanModeChange: this.panMode$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createPanScope(documentId) {
    return {
      enablePan: () => this.enablePan(documentId),
      disablePan: () => this.disablePan(documentId),
      togglePan: () => this.togglePan(documentId),
      isPanMode: () => this.isPanMode(documentId),
      onPanModeChange: (listener) => this.panMode$.on((event) => {
        if (event.documentId === documentId) listener(event.isPanMode);
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
      throw new Error(`Pan state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  enablePan(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.interactionManager.forDocument(id).activate("panMode");
  }
  disablePan(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.interactionManager.forDocument(id).activateDefaultMode();
  }
  togglePan(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const scope = this.interactionManager.forDocument(id);
    if (scope.getActiveMode() === "panMode") {
      scope.activateDefaultMode();
    } else {
      scope.activate("panMode");
    }
  }
  makePanDefault(autoActivate = true) {
    if (!this.interactionManager) return;
    this.interactionManager.setDefaultMode("panMode");
    if (autoActivate) {
      this.interactionManager.activateDefaultMode();
    }
  }
  isPanMode(documentId) {
    return this.getDocumentStateOrThrow(documentId).isPanMode;
  }
  // ─────────────────────────────────────────────────────────
  // Pan Handlers Registration
  // ─────────────────────────────────────────────────────────
  registerPanHandlersForDocument(documentId) {
    if (!this.interactionManager || !this.viewport) return;
    let dragState = null;
    const interactionScope = this.interactionManager.forDocument(documentId);
    const viewportScope = this.viewport.forDocument(documentId);
    const handlers = {
      onMouseDown: (_, pe) => {
        const metrics = viewportScope.getMetrics();
        dragState = {
          startX: pe.clientX,
          startY: pe.clientY,
          startLeft: metrics.scrollLeft,
          startTop: metrics.scrollTop
        };
        interactionScope.setCursor("panMode", "grabbing", 10);
      },
      onMouseMove: (_, pe) => {
        if (!dragState) return;
        const dx = pe.clientX - dragState.startX;
        const dy = pe.clientY - dragState.startY;
        viewportScope.scrollTo({
          x: dragState.startLeft - dx,
          y: dragState.startTop - dy
        });
      },
      onMouseUp: () => {
        if (!dragState) return;
        dragState = null;
        interactionScope.removeCursor("panMode");
      },
      onMouseLeave: () => {
        if (!dragState) return;
        dragState = null;
        interactionScope.removeCursor("panMode");
      },
      onMouseCancel: () => {
        if (!dragState) return;
        dragState = null;
        interactionScope.removeCursor("panMode");
      }
    };
    const unregister = this.interactionManager.registerHandlers({
      documentId,
      modeId: "panMode",
      handlers
    });
    this.documentHandlers.set(documentId, unregister);
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if ((prevDoc == null ? void 0 : prevDoc.isPanMode) !== newDoc.isPanMode) {
        this.panMode$.emit({
          documentId,
          isPanMode: newDoc.isPanMode
        });
        this.logger.debug(
          "PanPlugin",
          "PanModeChanged",
          `Pan mode changed for document ${documentId}: ${(prevDoc == null ? void 0 : prevDoc.isPanMode) ?? false} -> ${newDoc.isPanMode}`
        );
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_) {
    this.logger.info("PanPlugin", "Initialize", "Pan plugin initialized");
  }
  async destroy() {
    this.documentHandlers.forEach((cleanup) => cleanup());
    this.documentHandlers.clear();
    this.panMode$.clear();
    await super.destroy();
  }
};
_PanPlugin.id = "pan";
let PanPlugin = _PanPlugin;
const PAN_PLUGIN_ID = "pan";
const manifest = {
  id: PAN_PLUGIN_ID,
  name: "Pan Plugin",
  version: "1.0.0",
  provides: ["pan"],
  requires: ["interaction-manager", "viewport"],
  optional: [],
  defaultConfig: {
    defaultMode: "mobile"
  }
};
const initialDocumentState = {
  isPanMode: false
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const panReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_PAN_STATE: {
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
    case CLEANUP_PAN_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_PAN_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_PAN_MODE: {
      const { documentId, isPanMode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            isPanMode
          }
        }
      };
    }
    default:
      return state;
  }
};
const PanPluginPackage = {
  manifest,
  create: (registry, config) => new PanPlugin(PAN_PLUGIN_ID, registry, config),
  reducer: panReducer,
  initialState
};
export {
  CLEANUP_PAN_STATE,
  INIT_PAN_STATE,
  PAN_PLUGIN_ID,
  PanPlugin,
  PanPluginPackage,
  SET_ACTIVE_PAN_DOCUMENT,
  SET_PAN_MODE,
  cleanupPanState,
  initPanState,
  initialDocumentState,
  initialState,
  manifest,
  panReducer,
  setActivePanDocument,
  setPanMode
};
//# sourceMappingURL=index.js.map
