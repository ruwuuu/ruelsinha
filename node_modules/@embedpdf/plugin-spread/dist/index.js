import { BasePlugin, createBehaviorEmitter } from "@embedpdf/core";
var SpreadMode = /* @__PURE__ */ ((SpreadMode2) => {
  SpreadMode2["None"] = "none";
  SpreadMode2["Odd"] = "odd";
  SpreadMode2["Even"] = "even";
  return SpreadMode2;
})(SpreadMode || {});
const INIT_SPREAD_STATE = "SPREAD/INIT_STATE";
const CLEANUP_SPREAD_STATE = "SPREAD/CLEANUP_STATE";
const SET_ACTIVE_SPREAD_DOCUMENT = "SPREAD/SET_ACTIVE_DOCUMENT";
const SET_SPREAD_MODE = "SPREAD/SET_SPREAD_MODE";
const SET_PAGE_GROUPING = "SPREAD/SET_PAGE_GROUPING";
function initSpreadState(documentId, state) {
  return { type: INIT_SPREAD_STATE, payload: { documentId, state } };
}
function cleanupSpreadState(documentId) {
  return { type: CLEANUP_SPREAD_STATE, payload: documentId };
}
function setActiveSpreadDocument(documentId) {
  return { type: SET_ACTIVE_SPREAD_DOCUMENT, payload: documentId };
}
function setSpreadMode(documentId, spreadMode) {
  return { type: SET_SPREAD_MODE, payload: { documentId, spreadMode } };
}
function setPageGrouping(documentId, grouping) {
  return { type: SET_PAGE_GROUPING, payload: { documentId, grouping } };
}
const _SpreadPlugin = class _SpreadPlugin extends BasePlugin {
  constructor(id, registry, cfg) {
    var _a;
    super(id, registry);
    this.spreadEmitter$ = createBehaviorEmitter();
    this.defaultSpreadMode = cfg.defaultSpreadMode ?? SpreadMode.None;
    this.viewport = ((_a = registry.getPlugin("viewport")) == null ? void 0 : _a.provides()) ?? null;
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    var _a;
    const docState = {
      spreadMode: this.defaultSpreadMode
    };
    this.dispatch(initSpreadState(documentId, docState));
    (_a = this.viewport) == null ? void 0 : _a.gate("spread", documentId);
    this.logger.debug(
      "SpreadPlugin",
      "DocumentOpened",
      `Initialized spread state for document: ${documentId}`
    );
  }
  onDocumentLoaded(documentId) {
    var _a;
    const coreDoc = this.coreState.core.documents[documentId];
    if (coreDoc == null ? void 0 : coreDoc.document) {
      const grouping = this.calculatePageGrouping(documentId, coreDoc.document.pages.length);
      this.dispatch(setPageGrouping(documentId, grouping));
    }
    (_a = this.viewport) == null ? void 0 : _a.releaseGate("spread", documentId);
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupSpreadState(documentId));
    this.logger.debug(
      "SpreadPlugin",
      "DocumentClosed",
      `Cleaned up spread state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      setSpreadMode: (mode) => this.setSpreadModeForDocument(mode),
      getSpreadMode: () => this.getSpreadModeForDocument(),
      getSpreadPages: () => this.getSpreadPages(),
      // Document-scoped operations
      forDocument: (documentId) => this.createSpreadScope(documentId),
      // Events
      onSpreadChange: this.spreadEmitter$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createSpreadScope(documentId) {
    return {
      setSpreadMode: (mode) => this.setSpreadModeForDocument(mode, documentId),
      getSpreadMode: () => this.getSpreadModeForDocument(documentId),
      getSpreadPages: () => this.getSpreadPages(documentId),
      onSpreadChange: (listener) => this.spreadEmitter$.on((event) => {
        if (event.documentId === documentId) listener(event.spreadMode);
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
      throw new Error(`Spread state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  setSpreadModeForDocument(mode, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const currentState = this.getDocumentStateOrThrow(id);
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    if (currentState.spreadMode !== mode) {
      this.dispatch(setSpreadMode(id, mode));
      const grouping = this.calculatePageGrouping(id, coreDoc.document.pages.length);
      this.dispatch(setPageGrouping(id, grouping));
      this.spreadEmitter$.emit({
        documentId: id,
        spreadMode: mode
      });
    }
  }
  getSpreadModeForDocument(documentId) {
    return this.getDocumentStateOrThrow(documentId).spreadMode;
  }
  /**
   * Calculate page grouping indices based on spread mode
   * Returns indices, not actual page objects
   */
  calculatePageGrouping(documentId, pageCount) {
    const docState = this.getDocumentStateOrThrow(documentId);
    const spreadMode = docState.spreadMode;
    switch (spreadMode) {
      case SpreadMode.None:
        return Array.from({ length: pageCount }, (_, i) => [i]);
      case SpreadMode.Odd:
        return Array.from({ length: Math.ceil(pageCount / 2) }, (_, i) => {
          const indices = [i * 2];
          if (i * 2 + 1 < pageCount) indices.push(i * 2 + 1);
          return indices;
        });
      case SpreadMode.Even:
        return [
          [0],
          ...Array.from({ length: Math.ceil((pageCount - 1) / 2) }, (_, i) => {
            const indices = [1 + i * 2];
            if (1 + i * 2 + 1 < pageCount) indices.push(1 + i * 2 + 1);
            return indices;
          })
        ];
      default:
        return Array.from({ length: pageCount }, (_, i) => [i]);
    }
  }
  /**
   * Get the actual page objects grouped according to spread mode
   * This is computed on-demand, not stored
   */
  getSpreadPages(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    const spreadState = this.getDocumentStateOrThrow(id);
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    const grouping = spreadState.pageGrouping ?? [];
    const pages = coreDoc.document.pages;
    return grouping.map((indices) => indices.map((idx) => pages[idx]).filter(Boolean));
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if ((prevDoc == null ? void 0 : prevDoc.spreadMode) !== newDoc.spreadMode) {
        this.logger.debug(
          "SpreadPlugin",
          "SpreadModeChanged",
          `Spread mode changed for document ${documentId}: ${(prevDoc == null ? void 0 : prevDoc.spreadMode) ?? SpreadMode.None} -> ${newDoc.spreadMode}`
        );
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_config) {
    this.logger.info("SpreadPlugin", "Initialize", "Spread plugin initialized");
  }
  async destroy() {
    this.spreadEmitter$.clear();
    super.destroy();
  }
};
_SpreadPlugin.id = "spread";
let SpreadPlugin = _SpreadPlugin;
const SPREAD_PLUGIN_ID = "spread";
const manifest = {
  id: SPREAD_PLUGIN_ID,
  name: "Spread Plugin",
  version: "1.0.0",
  provides: ["spread"],
  requires: [],
  optional: ["viewport"],
  defaultConfig: {}
};
const initialDocumentState = {
  spreadMode: SpreadMode.None
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const spreadReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_SPREAD_STATE: {
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
    case CLEANUP_SPREAD_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_SPREAD_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_SPREAD_MODE: {
      const { documentId, spreadMode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            spreadMode
          }
        }
      };
    }
    case SET_PAGE_GROUPING: {
      const { documentId, grouping } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pageGrouping: grouping
          }
        }
      };
    }
    default:
      return state;
  }
};
const SpreadPluginPackage = {
  manifest,
  create: (registry, config) => new SpreadPlugin(SPREAD_PLUGIN_ID, registry, config),
  reducer: spreadReducer,
  initialState
};
export {
  CLEANUP_SPREAD_STATE,
  INIT_SPREAD_STATE,
  SET_ACTIVE_SPREAD_DOCUMENT,
  SET_PAGE_GROUPING,
  SET_SPREAD_MODE,
  SPREAD_PLUGIN_ID,
  SpreadMode,
  SpreadPlugin,
  SpreadPluginPackage,
  cleanupSpreadState,
  initSpreadState,
  initialDocumentState,
  initialState,
  manifest,
  setActiveSpreadDocument,
  setPageGrouping,
  setSpreadMode,
  spreadReducer
};
//# sourceMappingURL=index.js.map
