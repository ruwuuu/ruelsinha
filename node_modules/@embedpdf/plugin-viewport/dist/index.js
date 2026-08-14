import { BasePlugin, createBehaviorEmitter, createEmitter } from "@embedpdf/core";
const VIEWPORT_PLUGIN_ID = "viewport";
const manifest = {
  id: VIEWPORT_PLUGIN_ID,
  name: "Viewport Plugin",
  version: "1.0.0",
  provides: ["viewport"],
  requires: [],
  optional: [],
  defaultConfig: {
    viewportGap: 10,
    scrollEndDelay: 300
  }
};
const INIT_VIEWPORT_STATE = "INIT_VIEWPORT_STATE";
const CLEANUP_VIEWPORT_STATE = "CLEANUP_VIEWPORT_STATE";
const REGISTER_VIEWPORT = "REGISTER_VIEWPORT";
const UNREGISTER_VIEWPORT = "UNREGISTER_VIEWPORT";
const SET_VIEWPORT_METRICS = "SET_VIEWPORT_METRICS";
const SET_VIEWPORT_SCROLL_METRICS = "SET_VIEWPORT_SCROLL_METRICS";
const SET_VIEWPORT_GAP = "SET_VIEWPORT_GAP";
const SET_SCROLL_ACTIVITY = "SET_SCROLL_ACTIVITY";
const SET_SMOOTH_SCROLL_ACTIVITY = "SET_SMOOTH_SCROLL_ACTIVITY";
const SET_ACTIVE_VIEWPORT_DOCUMENT = "SET_ACTIVE_VIEWPORT_DOCUMENT";
const ADD_VIEWPORT_GATE = "ADD_VIEWPORT_GATE";
const REMOVE_VIEWPORT_GATE = "REMOVE_VIEWPORT_GATE";
function initViewportState(documentId) {
  return { type: INIT_VIEWPORT_STATE, payload: { documentId } };
}
function cleanupViewportState(documentId) {
  return { type: CLEANUP_VIEWPORT_STATE, payload: { documentId } };
}
function registerViewport(documentId) {
  return { type: REGISTER_VIEWPORT, payload: { documentId } };
}
function unregisterViewport(documentId) {
  return { type: UNREGISTER_VIEWPORT, payload: { documentId } };
}
function setViewportGap(viewportGap) {
  return { type: SET_VIEWPORT_GAP, payload: viewportGap };
}
function setViewportMetrics(documentId, metrics) {
  return { type: SET_VIEWPORT_METRICS, payload: { documentId, metrics } };
}
function setViewportScrollMetrics(documentId, scrollMetrics) {
  return { type: SET_VIEWPORT_SCROLL_METRICS, payload: { documentId, scrollMetrics } };
}
function setScrollActivity(documentId, isScrolling) {
  return { type: SET_SCROLL_ACTIVITY, payload: { documentId, isScrolling } };
}
function setSmoothScrollActivity(documentId, isSmoothScrolling) {
  return { type: SET_SMOOTH_SCROLL_ACTIVITY, payload: { documentId, isSmoothScrolling } };
}
function addViewportGate(documentId, key) {
  return { type: ADD_VIEWPORT_GATE, payload: { documentId, key } };
}
function removeViewportGate(documentId, key) {
  return { type: REMOVE_VIEWPORT_GATE, payload: { documentId, key } };
}
const initialViewportDocumentState = {
  viewportMetrics: {
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientLeft: 0,
    clientTop: 0,
    relativePosition: { x: 0, y: 0 }
  },
  isScrolling: false,
  isSmoothScrolling: false,
  gates: /* @__PURE__ */ new Set()
};
const initialState = {
  viewportGap: 0,
  documents: {},
  activeViewports: /* @__PURE__ */ new Set(),
  activeDocumentId: null
};
const viewportReducer = (state = initialState, action) => {
  switch (action.type) {
    // ─────────────────────────────────────────────────────────
    // State Persistence (Document Lifecycle)
    // ─────────────────────────────────────────────────────────
    case INIT_VIEWPORT_STATE: {
      const { documentId } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...initialViewportDocumentState, gates: /* @__PURE__ */ new Set() }
        }
      };
    }
    case CLEANUP_VIEWPORT_STATE: {
      const { documentId } = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      const newActiveViewports = new Set(state.activeViewports);
      newActiveViewports.delete(documentId);
      return {
        ...state,
        documents: remainingDocs,
        activeViewports: newActiveViewports,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    // ─────────────────────────────────────────────────────────
    // Viewport Registration (DOM Lifecycle)
    // ─────────────────────────────────────────────────────────
    case REGISTER_VIEWPORT: {
      const { documentId } = action.payload;
      const newActiveViewports = new Set(state.activeViewports);
      newActiveViewports.add(documentId);
      return {
        ...state,
        activeViewports: newActiveViewports,
        // Set as active if no active document
        activeDocumentId: state.activeDocumentId ?? documentId
      };
    }
    case UNREGISTER_VIEWPORT: {
      const { documentId } = action.payload;
      const newActiveViewports = new Set(state.activeViewports);
      newActiveViewports.delete(documentId);
      return {
        ...state,
        activeViewports: newActiveViewports
      };
    }
    case SET_ACTIVE_VIEWPORT_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    // ─────────────────────────────────────────────────────────
    // Viewport Operations
    // ─────────────────────────────────────────────────────────
    case SET_VIEWPORT_GAP: {
      return {
        ...state,
        viewportGap: action.payload
      };
    }
    case SET_VIEWPORT_METRICS: {
      const { documentId, metrics } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            viewportMetrics: {
              width: metrics.width,
              height: metrics.height,
              scrollTop: metrics.scrollTop,
              scrollLeft: metrics.scrollLeft,
              clientWidth: metrics.clientWidth,
              clientHeight: metrics.clientHeight,
              scrollWidth: metrics.scrollWidth,
              scrollHeight: metrics.scrollHeight,
              clientLeft: metrics.clientLeft,
              clientTop: metrics.clientTop,
              relativePosition: {
                x: metrics.scrollWidth <= metrics.clientWidth ? 0 : metrics.scrollLeft / (metrics.scrollWidth - metrics.clientWidth),
                y: metrics.scrollHeight <= metrics.clientHeight ? 0 : metrics.scrollTop / (metrics.scrollHeight - metrics.clientHeight)
              }
            }
          }
        }
      };
    }
    case SET_VIEWPORT_SCROLL_METRICS: {
      const { documentId, scrollMetrics } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            viewportMetrics: {
              ...viewport.viewportMetrics,
              scrollTop: scrollMetrics.scrollTop,
              scrollLeft: scrollMetrics.scrollLeft
            },
            isScrolling: true
          }
        }
      };
    }
    case SET_SCROLL_ACTIVITY: {
      const { documentId, isScrolling } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            isScrolling
          }
        }
      };
    }
    case SET_SMOOTH_SCROLL_ACTIVITY: {
      const { documentId, isSmoothScrolling } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            isSmoothScrolling
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Named Gate Operations
    // ─────────────────────────────────────────────────────────
    case ADD_VIEWPORT_GATE: {
      const { documentId, key } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      const newGates = new Set(viewport.gates);
      newGates.add(key);
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            gates: newGates
          }
        }
      };
    }
    case REMOVE_VIEWPORT_GATE: {
      const { documentId, key } = action.payload;
      const viewport = state.documents[documentId];
      if (!viewport) return state;
      const newGates = new Set(viewport.gates);
      newGates.delete(key);
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...viewport,
            gates: newGates
          }
        }
      };
    }
    default:
      return state;
  }
};
const _ViewportPlugin = class _ViewportPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.id = id;
    this.viewportResize$ = createBehaviorEmitter();
    this.viewportMetrics$ = createBehaviorEmitter();
    this.scrollMetrics$ = createBehaviorEmitter();
    this.scrollActivity$ = createBehaviorEmitter();
    this.gateState$ = createBehaviorEmitter();
    this.scrollRequests$ = /* @__PURE__ */ new Map();
    if (config.viewportGap) {
      this.dispatch(setViewportGap(config.viewportGap));
    }
    this.scrollEndDelay = config.scrollEndDelay || 100;
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initViewportState(documentId));
    this.scrollRequests$.set(documentId, createEmitter());
    this.logger.debug(
      "ViewportPlugin",
      "DocumentOpened",
      `Initialized viewport state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    var _a;
    this.dispatch(cleanupViewportState(documentId));
    (_a = this.scrollRequests$.get(documentId)) == null ? void 0 : _a.clear();
    this.scrollRequests$.delete(documentId);
    this.logger.debug(
      "ViewportPlugin",
      "DocumentClosed",
      `Cleaned up viewport state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Global
      getViewportGap: () => this.state.viewportGap,
      // Active document operations
      getMetrics: () => this.getMetrics(),
      scrollTo: (pos) => this.scrollTo(pos),
      isScrolling: () => this.isScrolling(),
      isSmoothScrolling: () => this.isSmoothScrolling(),
      isGated: (documentId) => this.isGated(documentId),
      hasGate: (key, documentId) => this.hasGate(key, documentId),
      getGates: (documentId) => this.getGates(documentId),
      // Document-scoped operations
      forDocument: (documentId) => this.createViewportScope(documentId),
      gate: (key, documentId) => this.gate(key, documentId),
      releaseGate: (key, documentId) => this.releaseGate(key, documentId),
      // Check if viewport is currently mounted
      isViewportMounted: (documentId) => this.state.activeViewports.has(documentId),
      // Events
      onViewportChange: this.viewportMetrics$.on,
      onViewportResize: this.viewportResize$.on,
      onScrollChange: this.scrollMetrics$.on,
      onScrollActivity: this.scrollActivity$.on,
      onGateChange: this.gateState$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createViewportScope(documentId) {
    return {
      getMetrics: () => this.getMetrics(documentId),
      scrollTo: (pos) => this.scrollTo(pos, documentId),
      isScrolling: () => this.isScrolling(documentId),
      isSmoothScrolling: () => this.isSmoothScrolling(documentId),
      isGated: () => this.isGated(documentId),
      hasGate: (key) => this.hasGate(key, documentId),
      getGates: () => this.getGates(documentId),
      gate: (key) => this.gate(key, documentId),
      releaseGate: (key) => this.releaseGate(key, documentId),
      onViewportChange: (listener) => this.viewportMetrics$.on((event) => {
        if (event.documentId === documentId) listener(event.metrics);
      }),
      onScrollChange: (listener) => this.scrollMetrics$.on((event) => {
        if (event.documentId === documentId) listener(event.scrollMetrics);
      }),
      onScrollActivity: (listener) => this.scrollActivity$.on((event) => {
        if (event.documentId === documentId) listener(event.activity);
      }),
      onGateChange: (listener) => this.gateState$.on((event) => {
        if ((event == null ? void 0 : event.documentId) === documentId) listener(event);
      })
    };
  }
  // ─────────────────────────────────────────────────────────
  // Viewport Registration (Public API for components)
  // ─────────────────────────────────────────────────────────
  registerViewport(documentId) {
    if (!this.state.documents[documentId]) {
      throw new Error(
        `Cannot register viewport for ${documentId}: document state not found. Document must be opened before registering viewport.`
      );
    }
    if (!this.state.activeViewports.has(documentId)) {
      this.dispatch(registerViewport(documentId));
      this.logger.debug(
        "ViewportPlugin",
        "RegisterViewport",
        `Registered viewport (DOM mounted) for document: ${documentId}`
      );
    }
  }
  unregisterViewport(documentId) {
    if (this.registry.isDestroyed()) return;
    if (this.state.activeViewports.has(documentId)) {
      this.dispatch(unregisterViewport(documentId));
      this.logger.debug(
        "ViewportPlugin",
        "UnregisterViewport",
        `Unregistered viewport (DOM unmounted) for document: ${documentId}. State preserved.`
      );
    }
  }
  // ─────────────────────────────────────────────────────────
  // Per-Document Operations
  // ─────────────────────────────────────────────────────────
  setViewportResizeMetrics(documentId, metrics) {
    if (this.registry.isDestroyed()) return;
    this.dispatch(setViewportMetrics(documentId, metrics));
    const viewport = this.state.documents[documentId];
    if (viewport) {
      this.viewportResize$.emit({
        documentId,
        metrics: viewport.viewportMetrics
      });
    }
  }
  setViewportScrollMetrics(documentId, scrollMetrics) {
    if (this.registry.isDestroyed()) return;
    const viewport = this.state.documents[documentId];
    if (!viewport) return;
    if (scrollMetrics.scrollTop !== viewport.viewportMetrics.scrollTop || scrollMetrics.scrollLeft !== viewport.viewportMetrics.scrollLeft) {
      this.dispatch(setViewportScrollMetrics(documentId, scrollMetrics));
      this.bumpScrollActivity(documentId);
      this.scrollMetrics$.emit({
        documentId,
        scrollMetrics
      });
    }
  }
  onScrollRequest(documentId, listener) {
    const emitter = this.scrollRequests$.get(documentId);
    if (!emitter) {
      throw new Error(
        `Cannot subscribe to scroll requests for ${documentId}: document state not initialized`
      );
    }
    return emitter.on(listener);
  }
  // ─────────────────────────────────────────────────────────
  // Public Gating API
  // ─────────────────────────────────────────────────────────
  gate(key, documentId) {
    const viewport = this.state.documents[documentId];
    if (!viewport) {
      this.logger.warn(
        "ViewportPlugin",
        "GateViewport",
        `Cannot gate viewport for ${documentId}: document not found`
      );
      return;
    }
    if (!viewport.gates.has(key)) {
      this.dispatch(addViewportGate(documentId, key));
      this.logger.debug(
        "ViewportPlugin",
        "GateAdded",
        `Added gate '${key}' for document: ${documentId}. Total gates: ${viewport.gates.size + 1}`
      );
    }
  }
  releaseGate(key, documentId) {
    const viewport = this.state.documents[documentId];
    if (!viewport) {
      this.logger.warn(
        "ViewportPlugin",
        "ReleaseGate",
        `Cannot release gate for ${documentId}: document not found`
      );
      return;
    }
    if (viewport.gates.has(key)) {
      this.dispatch(removeViewportGate(documentId, key));
      this.logger.debug(
        "ViewportPlugin",
        "GateReleased",
        `Released gate '${key}' for document: ${documentId}. Remaining gates: ${viewport.gates.size - 1}`
      );
    }
  }
  // ─────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────
  getViewportState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const viewport = this.state.documents[id];
    if (!viewport) {
      throw new Error(`Viewport state not found for document: ${id}`);
    }
    return viewport;
  }
  getMetrics(documentId) {
    return this.getViewportState(documentId).viewportMetrics;
  }
  isScrolling(documentId) {
    return this.getViewportState(documentId).isScrolling;
  }
  isSmoothScrolling(documentId) {
    return this.getViewportState(documentId).isSmoothScrolling;
  }
  isGated(documentId) {
    const viewport = this.getViewportState(documentId);
    return viewport.gates.size > 0;
  }
  hasGate(key, documentId) {
    const viewport = this.getViewportState(documentId);
    return viewport.gates.has(key);
  }
  getGates(documentId) {
    const viewport = this.getViewportState(documentId);
    return Array.from(viewport.gates);
  }
  scrollTo(pos, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const viewport = this.getViewportState(id);
    const { x, y, alignX, alignY, behavior = "auto" } = pos;
    if (behavior === "smooth") {
      this.dispatch(setSmoothScrollActivity(id, true));
    }
    const metrics = viewport.viewportMetrics;
    let finalX = x;
    let finalY = y;
    if (alignX !== void 0) {
      finalX = x - metrics.clientWidth * (alignX / 100);
    }
    if (alignY !== void 0) {
      finalY = y - metrics.clientHeight * (alignY / 100);
    }
    const emitter = this.scrollRequests$.get(id);
    if (emitter) {
      emitter.emit({ x: finalX, y: finalY, behavior });
    }
  }
  bumpScrollActivity(documentId) {
    this.debouncedDispatch(setScrollActivity(documentId, false), this.scrollEndDelay);
    this.debouncedDispatch(setSmoothScrollActivity(documentId, false), this.scrollEndDelay);
  }
  // ─────────────────────────────────────────────────────────
  // State Change Handling
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevViewport = prevState.documents[documentId];
      const newViewport = newState.documents[documentId];
      if (prevViewport !== newViewport) {
        this.viewportMetrics$.emit({
          documentId,
          metrics: newViewport.viewportMetrics
        });
        if (prevViewport && (prevViewport.isScrolling !== newViewport.isScrolling || prevViewport.isSmoothScrolling !== newViewport.isSmoothScrolling)) {
          this.scrollActivity$.emit({
            documentId,
            activity: {
              isScrolling: newViewport.isScrolling,
              isSmoothScrolling: newViewport.isSmoothScrolling
            }
          });
        }
        if (prevViewport && prevViewport.gates !== newViewport.gates) {
          const prevGates = Array.from(prevViewport.gates);
          const newGates = Array.from(newViewport.gates);
          const addedGate = newGates.find((g) => !prevGates.includes(g));
          const removedGate = prevGates.find((g) => !newGates.includes(g));
          this.gateState$.emit({
            documentId,
            isGated: newViewport.gates.size > 0,
            gates: newGates,
            addedGate,
            removedGate
          });
          this.logger.debug(
            "ViewportPlugin",
            "GateStateChanged",
            `Gate state changed for document ${documentId}. Gates: [${newGates.join(", ")}], Gated: ${newViewport.gates.size > 0}`
          );
        }
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_config) {
    this.logger.info("ViewportPlugin", "Initialize", "Viewport plugin initialized");
  }
  async destroy() {
    this.viewportMetrics$.clear();
    this.viewportResize$.clear();
    this.scrollMetrics$.clear();
    this.scrollActivity$.clear();
    this.gateState$.clear();
    this.scrollRequests$.forEach((emitter) => emitter.clear());
    this.scrollRequests$.clear();
    super.destroy();
  }
};
_ViewportPlugin.id = "viewport";
let ViewportPlugin = _ViewportPlugin;
const ViewportPluginPackage = {
  manifest,
  create: (registry, config) => new ViewportPlugin(VIEWPORT_PLUGIN_ID, registry, config),
  reducer: viewportReducer,
  initialState
};
export {
  VIEWPORT_PLUGIN_ID,
  ViewportPlugin,
  ViewportPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
