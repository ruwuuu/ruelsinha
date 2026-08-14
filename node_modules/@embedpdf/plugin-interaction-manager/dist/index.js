import { BasePlugin, createEmitter, createBehaviorEmitter } from "@embedpdf/core";
const INIT_INTERACTION_STATE = "INTERACTION/INIT_STATE";
const CLEANUP_INTERACTION_STATE = "INTERACTION/CLEANUP_STATE";
const ACTIVATE_MODE = "INTERACTION/ACTIVATE_MODE";
const PAUSE_INTERACTION = "INTERACTION/PAUSE";
const RESUME_INTERACTION = "INTERACTION/RESUME";
const SET_CURSOR = "INTERACTION/SET_CURSOR";
const SET_ACTIVE_DOCUMENT = "INTERACTION/SET_ACTIVE_DOCUMENT";
const SET_DEFAULT_MODE = "INTERACTION/SET_DEFAULT_MODE";
const SET_EXCLUSION_RULES = "INTERACTION/SET_EXCLUSION_RULES";
const ADD_EXCLUSION_CLASS = "INTERACTION/ADD_EXCLUSION_CLASS";
const REMOVE_EXCLUSION_CLASS = "INTERACTION/REMOVE_EXCLUSION_CLASS";
const ADD_EXCLUSION_ATTRIBUTE = "INTERACTION/ADD_EXCLUSION_ATTRIBUTE";
const REMOVE_EXCLUSION_ATTRIBUTE = "INTERACTION/REMOVE_EXCLUSION_ATTRIBUTE";
function initInteractionState(documentId, state) {
  return { type: INIT_INTERACTION_STATE, payload: { documentId, state } };
}
function cleanupInteractionState(documentId) {
  return { type: CLEANUP_INTERACTION_STATE, payload: documentId };
}
function activateMode(documentId, mode) {
  return { type: ACTIVATE_MODE, payload: { documentId, mode } };
}
function pauseInteraction(documentId) {
  return { type: PAUSE_INTERACTION, payload: documentId };
}
function resumeInteraction(documentId) {
  return { type: RESUME_INTERACTION, payload: documentId };
}
function setCursor(documentId, cursor) {
  return { type: SET_CURSOR, payload: { documentId, cursor } };
}
function setDefaultMode(mode) {
  return { type: SET_DEFAULT_MODE, payload: { mode } };
}
function setExclusionRules(rules) {
  return { type: SET_EXCLUSION_RULES, payload: { rules } };
}
function addExclusionClass(className) {
  return { type: ADD_EXCLUSION_CLASS, payload: { className } };
}
function removeExclusionClass(className) {
  return { type: REMOVE_EXCLUSION_CLASS, payload: { className } };
}
function addExclusionAttribute(attribute) {
  return { type: ADD_EXCLUSION_ATTRIBUTE, payload: { attribute } };
}
function removeExclusionAttribute(attribute) {
  return { type: REMOVE_EXCLUSION_ATTRIBUTE, payload: { attribute } };
}
function mergeHandlers(list) {
  const keys = [
    "onPointerDown",
    "onPointerUp",
    "onPointerMove",
    "onPointerEnter",
    "onPointerLeave",
    "onPointerCancel",
    "onMouseDown",
    "onMouseUp",
    "onMouseMove",
    "onMouseEnter",
    "onMouseLeave",
    "onMouseCancel",
    "onClick",
    "onDoubleClick"
  ];
  const out = {};
  for (const k of keys) {
    out[k] = (pos, evt, modeId) => {
      var _a;
      for (const h of list) {
        if (evt.isImmediatePropagationStopped()) break;
        (_a = h[k]) == null ? void 0 : _a.call(h, pos, evt, modeId);
      }
    };
  }
  return out;
}
const INITIAL_MODE$1 = "pointerMode";
const _InteractionManagerPlugin = class _InteractionManagerPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.modes = /* @__PURE__ */ new Map();
    this.cursorClaims = /* @__PURE__ */ new Map();
    this.buckets = /* @__PURE__ */ new Map();
    this.alwaysGlobal = /* @__PURE__ */ new Map();
    this.alwaysPage = /* @__PURE__ */ new Map();
    this.pageActivities = /* @__PURE__ */ new Map();
    this.onModeChange$ = createEmitter();
    this.onHandlerChange$ = createEmitter();
    this.onCursorChange$ = createEmitter();
    this.onStateChange$ = createBehaviorEmitter();
    this.onPageActivityChange$ = createEmitter();
    this.registerMode({
      id: INITIAL_MODE$1,
      scope: "page",
      exclusive: false,
      cursor: "auto"
    });
    this.dispatch(setDefaultMode(INITIAL_MODE$1));
    if (config.exclusionRules) {
      this.dispatch(setExclusionRules(config.exclusionRules));
    }
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    const docState = {
      activeMode: this.state.defaultMode,
      cursor: "auto",
      paused: false
    };
    this.dispatch(initInteractionState(documentId, docState));
    this.cursorClaims.set(documentId, /* @__PURE__ */ new Map());
    this.buckets.set(documentId, /* @__PURE__ */ new Map());
    this.alwaysGlobal.set(documentId, /* @__PURE__ */ new Set());
    this.alwaysPage.set(documentId, /* @__PURE__ */ new Map());
    this.pageActivities.set(documentId, /* @__PURE__ */ new Map());
    const docBuckets = this.buckets.get(documentId);
    for (const modeId of this.modes.keys()) {
      docBuckets.set(modeId, { global: /* @__PURE__ */ new Set(), page: /* @__PURE__ */ new Map() });
    }
    this.logger.debug(
      "InteractionManagerPlugin",
      "DocumentOpened",
      `Initialized interaction state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    const topics = this.pageActivities.get(documentId);
    if (topics) {
      const activePages = new Set(topics.values());
      topics.clear();
      for (const pageIndex of activePages) {
        this.onPageActivityChange$.emit({ documentId, pageIndex, hasActivity: false });
      }
    }
    this.cursorClaims.delete(documentId);
    this.buckets.delete(documentId);
    this.alwaysGlobal.delete(documentId);
    this.alwaysPage.delete(documentId);
    this.pageActivities.delete(documentId);
    this.dispatch(cleanupInteractionState(documentId));
    this.logger.debug(
      "InteractionManagerPlugin",
      "DocumentClosed",
      `Cleaned up interaction state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      getActiveMode: () => this.getActiveMode(),
      getActiveInteractionMode: () => this.getActiveInteractionMode(),
      activate: (modeId) => this.activate(modeId),
      activateDefaultMode: () => this.activateDefaultMode(),
      setCursor: (token, cursor, priority) => this.setCursor(token, cursor, priority),
      getCurrentCursor: () => this.getCurrentCursor(),
      removeCursor: (token) => this.removeCursor(token),
      getHandlersForScope: (scope) => this.getHandlersForScope(scope),
      activeModeIsExclusive: () => this.activeModeIsExclusive(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      // Treat a destroyed registry as "paused" so late DOM events are ignored during teardown.
      isPaused: () => this.registry.isDestroyed() || this.isPaused(),
      getState: () => this.getDocumentStateOrThrow(),
      // Document-scoped operations
      forDocument: (documentId) => this.createInteractionScope(documentId),
      // Global management
      registerMode: (mode) => this.registerMode(mode),
      registerHandlers: (options) => this.registerHandlers(options),
      registerAlways: (options) => this.registerAlways(options),
      setDefaultMode: (id) => this.setDefaultMode(id),
      getDefaultMode: () => this.state.defaultMode,
      getExclusionRules: () => this.state.exclusionRules,
      setExclusionRules: (rules) => this.dispatch(setExclusionRules(rules)),
      addExclusionClass: (className) => this.dispatch(addExclusionClass(className)),
      removeExclusionClass: (className) => this.dispatch(removeExclusionClass(className)),
      addExclusionAttribute: (attribute) => this.dispatch(addExclusionAttribute(attribute)),
      removeExclusionAttribute: (attribute) => this.dispatch(removeExclusionAttribute(attribute)),
      // Page activity
      claimPageActivity: (documentId, topic, pageIndex) => this.claimPageActivity(documentId, topic, pageIndex),
      releasePageActivity: (documentId, topic) => this.releasePageActivity(documentId, topic),
      hasPageActivity: (documentId, pageIndex) => this.hasPageActivity(documentId, pageIndex),
      // Events
      onModeChange: this.onModeChange$.on,
      onCursorChange: this.onCursorChange$.on,
      onHandlerChange: this.onHandlerChange$.on,
      onStateChange: this.onStateChange$.on,
      onPageActivityChange: this.onPageActivityChange$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createInteractionScope(documentId) {
    return {
      getActiveMode: () => this.getActiveMode(documentId),
      getActiveInteractionMode: () => this.getActiveInteractionMode(documentId),
      activate: (modeId) => this.activate(modeId, documentId),
      activateDefaultMode: () => this.activateDefaultMode(documentId),
      setCursor: (token, cursor, priority) => this.setCursor(token, cursor, priority, documentId),
      getCurrentCursor: () => this.getCurrentCursor(documentId),
      removeCursor: (token) => this.removeCursor(token, documentId),
      getHandlersForScope: (scope) => this.getHandlersForScope(scope),
      activeModeIsExclusive: () => this.activeModeIsExclusive(documentId),
      pause: () => this.pause(documentId),
      resume: () => this.resume(documentId),
      isPaused: () => this.isPaused(documentId),
      getState: () => this.getDocumentStateOrThrow(documentId),
      claimPageActivity: (topic, pageIndex) => this.claimPageActivity(documentId, topic, pageIndex),
      releasePageActivity: (topic) => this.releasePageActivity(documentId, topic),
      hasPageActivity: (pageIndex) => this.hasPageActivity(documentId, pageIndex),
      onModeChange: (listener) => this.onModeChange$.on((event) => {
        if (event.documentId === documentId) listener(event.activeMode);
      }),
      onCursorChange: (listener) => this.onCursorChange$.on((event) => {
        if (event.documentId === documentId) listener(event.cursor);
      }),
      onStateChange: (listener) => this.onStateChange$.on((event) => {
        if (event.documentId === documentId) listener(event.state);
      }),
      onPageActivityChange: (listener) => this.onPageActivityChange$.on((event) => {
        if (event.documentId === documentId)
          listener({ pageIndex: event.pageIndex, hasActivity: event.hasActivity });
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
      throw new Error(`Interaction state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  activate(modeId, documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    if (!this.modes.has(modeId)) {
      throw new Error(`[interaction] unknown mode '${modeId}'`);
    }
    if (modeId === docState.activeMode) return;
    const previousMode = docState.activeMode;
    (_a = this.cursorClaims.get(id)) == null ? void 0 : _a.clear();
    this.notifyHandlersInactive(id, previousMode);
    this.dispatch(activateMode(id, modeId));
    this.emitCursor(id);
    this.notifyHandlersActive(id, modeId);
    this.onModeChange$.emit({
      documentId: id,
      activeMode: modeId,
      previousMode
    });
  }
  activateDefaultMode(documentId) {
    const id = documentId ?? this.getActiveDocumentIdOrNull();
    if (!id) return;
    this.activate(this.state.defaultMode, id);
  }
  setDefaultMode(modeId) {
    if (!this.modes.has(modeId)) {
      throw new Error(`[interaction] cannot set unknown mode '${modeId}' as default`);
    }
    this.dispatch(setDefaultMode(modeId));
  }
  getActiveMode(documentId) {
    return this.getDocumentStateOrThrow(documentId).activeMode;
  }
  getActiveInteractionMode(documentId) {
    const docState = this.getDocumentState(documentId);
    if (!docState) return null;
    return this.modes.get(docState.activeMode) ?? null;
  }
  activeModeIsExclusive(documentId) {
    const mode = this.getActiveInteractionMode(documentId);
    return !!(mode == null ? void 0 : mode.exclusive);
  }
  pause(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(pauseInteraction(id));
  }
  resume(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(resumeInteraction(id));
  }
  isPaused(documentId) {
    return this.getDocumentStateOrThrow(documentId).paused;
  }
  // ─────────────────────────────────────────────────────────
  // Mode Management
  // ─────────────────────────────────────────────────────────
  registerMode(mode) {
    this.modes.set(mode.id, mode);
    for (const documentId of this.buckets.keys()) {
      const docBuckets = this.buckets.get(documentId);
      if (!docBuckets.has(mode.id)) {
        docBuckets.set(mode.id, { global: /* @__PURE__ */ new Set(), page: /* @__PURE__ */ new Map() });
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Handler Management
  // ─────────────────────────────────────────────────────────
  registerHandlers({
    documentId,
    modeId,
    handlers,
    pageIndex
  }) {
    const modeIds = Array.isArray(modeId) ? modeId : [modeId];
    const cleanupFunctions = [];
    const docBuckets = this.buckets.get(documentId);
    if (!docBuckets) {
      throw new Error(`No buckets found for document: ${documentId}`);
    }
    for (const id of modeIds) {
      const bucket = docBuckets.get(id);
      if (!bucket) throw new Error(`unknown mode '${id}'`);
      if (pageIndex == null) {
        bucket.global.add(handlers);
      } else {
        const set = bucket.page.get(pageIndex) ?? /* @__PURE__ */ new Set();
        set.add(handlers);
        bucket.page.set(pageIndex, set);
      }
      cleanupFunctions.push(() => {
        if (pageIndex == null) {
          bucket.global.delete(handlers);
        } else {
          const set = bucket.page.get(pageIndex);
          if (set) {
            set.delete(handlers);
            if (set.size === 0) {
              bucket.page.delete(pageIndex);
            }
          }
        }
      });
    }
    this.onHandlerChange$.emit({ ...this.state });
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      this.onHandlerChange$.emit({ ...this.state });
    };
  }
  registerAlways({ scope, handlers }) {
    if (scope.type === "global") {
      const set2 = this.alwaysGlobal.get(scope.documentId) ?? /* @__PURE__ */ new Set();
      set2.add(handlers);
      this.alwaysGlobal.set(scope.documentId, set2);
      this.onHandlerChange$.emit({ ...this.state });
      return () => {
        set2.delete(handlers);
        this.onHandlerChange$.emit({ ...this.state });
      };
    }
    const docPageMap = this.alwaysPage.get(scope.documentId) ?? /* @__PURE__ */ new Map();
    const set = docPageMap.get(scope.pageIndex) ?? /* @__PURE__ */ new Set();
    set.add(handlers);
    docPageMap.set(scope.pageIndex, set);
    this.alwaysPage.set(scope.documentId, docPageMap);
    this.onHandlerChange$.emit({ ...this.state });
    return () => {
      set.delete(handlers);
      this.onHandlerChange$.emit({ ...this.state });
    };
  }
  getHandlersForScope(scope) {
    var _a;
    const docState = this.getDocumentState(scope.documentId);
    if (!docState) return null;
    const mode = this.modes.get(docState.activeMode);
    if (!mode) return null;
    const docBuckets = this.buckets.get(scope.documentId);
    if (!docBuckets) return null;
    const bucket = docBuckets.get(mode.id);
    if (!bucket) return null;
    const mergeSets = (a, b) => a.size || b.size ? mergeHandlers([...a, ...b]) : null;
    if (scope.type === "global") {
      const alwaysSet = this.alwaysGlobal.get(scope.documentId) ?? /* @__PURE__ */ new Set();
      const modeSpecific = mode.scope === "global" ? bucket.global : /* @__PURE__ */ new Set();
      return mergeSets(alwaysSet, modeSpecific);
    }
    const alwaysPageSet = ((_a = this.alwaysPage.get(scope.documentId)) == null ? void 0 : _a.get(scope.pageIndex)) ?? /* @__PURE__ */ new Set();
    const modePageSet = mode.scope === "page" ? bucket.page.get(scope.pageIndex) ?? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
    return mergeSets(alwaysPageSet, modePageSet);
  }
  // ─────────────────────────────────────────────────────────
  // Cursor Management
  // ─────────────────────────────────────────────────────────
  setCursor(token, cursor, priority = 0, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const claims = this.cursorClaims.get(id);
    if (!claims) return;
    claims.set(token, { cursor, priority });
    this.emitCursor(id);
  }
  removeCursor(token, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const claims = this.cursorClaims.get(id);
    if (!claims) return;
    claims.delete(token);
    this.emitCursor(id);
  }
  getCurrentCursor(documentId) {
    return this.getDocumentStateOrThrow(documentId).cursor;
  }
  emitCursor(documentId) {
    var _a;
    const claims = this.cursorClaims.get(documentId);
    if (!claims) return;
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    const top = [...claims.values()].sort((a, b) => b.priority - a.priority)[0] ?? {
      cursor: ((_a = this.modes.get(docState.activeMode)) == null ? void 0 : _a.cursor) ?? "auto"
    };
    if (top.cursor !== docState.cursor) {
      this.dispatch(setCursor(documentId, top.cursor));
      this.onCursorChange$.emit({
        documentId,
        cursor: top.cursor
      });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Page Activity Management
  // ─────────────────────────────────────────────────────────
  claimPageActivity(documentId, topic, pageIndex) {
    let topics = this.pageActivities.get(documentId);
    if (!topics) {
      topics = /* @__PURE__ */ new Map();
      this.pageActivities.set(documentId, topics);
    }
    const oldPage = topics.get(topic);
    if (oldPage === pageIndex) return;
    topics.set(topic, pageIndex);
    if (oldPage !== void 0 && !this.pageHasAnyTopic(documentId, oldPage)) {
      this.onPageActivityChange$.emit({ documentId, pageIndex: oldPage, hasActivity: false });
    }
    if (this.countTopicsOnPage(documentId, pageIndex) === 1) {
      this.onPageActivityChange$.emit({ documentId, pageIndex, hasActivity: true });
    }
  }
  releasePageActivity(documentId, topic) {
    const topics = this.pageActivities.get(documentId);
    if (!topics) return;
    const page = topics.get(topic);
    if (page === void 0) return;
    topics.delete(topic);
    if (!this.pageHasAnyTopic(documentId, page)) {
      this.onPageActivityChange$.emit({ documentId, pageIndex: page, hasActivity: false });
    }
  }
  hasPageActivity(documentId, pageIndex) {
    return this.pageHasAnyTopic(documentId, pageIndex);
  }
  /** Helper: does any topic point to this page? */
  pageHasAnyTopic(documentId, pageIndex) {
    const topics = this.pageActivities.get(documentId);
    if (!topics) return false;
    for (const p of topics.values()) {
      if (p === pageIndex) return true;
    }
    return false;
  }
  /** Helper: count topics on a page */
  countTopicsOnPage(documentId, pageIndex) {
    const topics = this.pageActivities.get(documentId);
    if (!topics) return 0;
    let count = 0;
    for (const p of topics.values()) {
      if (p === pageIndex) count++;
    }
    return count;
  }
  // ─────────────────────────────────────────────────────────
  // Handler Lifecycle Notifications
  // ─────────────────────────────────────────────────────────
  notifyHandlersActive(documentId, modeId) {
    var _a, _b;
    (_a = this.alwaysGlobal.get(documentId)) == null ? void 0 : _a.forEach((handler) => {
      var _a2;
      (_a2 = handler.onHandlerActiveStart) == null ? void 0 : _a2.call(handler, modeId);
    });
    (_b = this.alwaysPage.get(documentId)) == null ? void 0 : _b.forEach((handlerSet) => {
      handlerSet.forEach((handler) => {
        var _a2;
        (_a2 = handler.onHandlerActiveStart) == null ? void 0 : _a2.call(handler, modeId);
      });
    });
    const mode = this.modes.get(modeId);
    if (!mode) return;
    const docBuckets = this.buckets.get(documentId);
    if (!docBuckets) return;
    const bucket = docBuckets.get(modeId);
    if (!bucket) return;
    if (mode.scope === "global") {
      bucket.global.forEach((handler) => {
        var _a2;
        (_a2 = handler.onHandlerActiveStart) == null ? void 0 : _a2.call(handler, modeId);
      });
    }
    if (mode.scope === "page") {
      bucket.page.forEach((handlerSet) => {
        handlerSet.forEach((handler) => {
          var _a2;
          (_a2 = handler.onHandlerActiveStart) == null ? void 0 : _a2.call(handler, modeId);
        });
      });
    }
  }
  notifyHandlersInactive(documentId, modeId) {
    var _a, _b;
    (_a = this.alwaysGlobal.get(documentId)) == null ? void 0 : _a.forEach((handler) => {
      var _a2;
      (_a2 = handler.onHandlerActiveEnd) == null ? void 0 : _a2.call(handler, modeId);
    });
    (_b = this.alwaysPage.get(documentId)) == null ? void 0 : _b.forEach((handlerSet) => {
      handlerSet.forEach((handler) => {
        var _a2;
        (_a2 = handler.onHandlerActiveEnd) == null ? void 0 : _a2.call(handler, modeId);
      });
    });
    const mode = this.modes.get(modeId);
    if (!mode) return;
    const docBuckets = this.buckets.get(documentId);
    if (!docBuckets) return;
    const bucket = docBuckets.get(modeId);
    if (!bucket) return;
    if (mode.scope === "global") {
      bucket.global.forEach((handler) => {
        var _a2;
        (_a2 = handler.onHandlerActiveEnd) == null ? void 0 : _a2.call(handler, modeId);
      });
    }
    if (mode.scope === "page") {
      bucket.page.forEach((handlerSet) => {
        handlerSet.forEach((handler) => {
          var _a2;
          (_a2 = handler.onHandlerActiveEnd) == null ? void 0 : _a2.call(handler, modeId);
        });
      });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if (prevDoc !== newDoc) {
        this.onStateChange$.emit({
          documentId,
          state: newDoc
        });
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_) {
    this.logger.info(
      "InteractionManagerPlugin",
      "Initialize",
      "Interaction Manager Plugin initialized"
    );
  }
  async destroy() {
    this.pageActivities.clear();
    this.onModeChange$.clear();
    this.onCursorChange$.clear();
    this.onHandlerChange$.clear();
    this.onStateChange$.clear();
    this.onPageActivityChange$.clear();
    await super.destroy();
  }
};
_InteractionManagerPlugin.id = "interaction-manager";
let InteractionManagerPlugin = _InteractionManagerPlugin;
const INTERACTION_MANAGER_PLUGIN_ID = "interaction-manager";
const manifest = {
  id: INTERACTION_MANAGER_PLUGIN_ID,
  name: "Interaction Manager Plugin",
  version: "1.0.0",
  provides: ["interaction-manager"],
  requires: [],
  optional: [],
  defaultConfig: {
    exclusionRules: {
      classes: [],
      dataAttributes: ["data-no-interaction"]
    }
  }
};
const INITIAL_MODE = "pointerMode";
const initialDocumentState = {
  activeMode: INITIAL_MODE,
  cursor: "auto",
  paused: false
};
const initialState = {
  defaultMode: INITIAL_MODE,
  exclusionRules: {
    classes: [],
    dataAttributes: ["data-no-interaction"]
  },
  documents: {},
  activeDocumentId: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    // ─────────────────────────────────────────────────────────
    // Document Lifecycle
    // ─────────────────────────────────────────────────────────
    case INIT_INTERACTION_STATE: {
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
    case CLEANUP_INTERACTION_STATE: {
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
    // ─────────────────────────────────────────────────────────
    // Per-Document Actions
    // ─────────────────────────────────────────────────────────
    case ACTIVATE_MODE: {
      const { documentId, mode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeMode: mode
          }
        }
      };
    }
    case SET_CURSOR: {
      const { documentId, cursor } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            cursor
          }
        }
      };
    }
    case PAUSE_INTERACTION: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            paused: true
          }
        }
      };
    }
    case RESUME_INTERACTION: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            paused: false
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Global Actions
    // ─────────────────────────────────────────────────────────
    case SET_DEFAULT_MODE:
      return {
        ...state,
        defaultMode: action.payload.mode
      };
    case SET_EXCLUSION_RULES:
      return {
        ...state,
        exclusionRules: action.payload.rules
      };
    case ADD_EXCLUSION_CLASS:
      return {
        ...state,
        exclusionRules: {
          ...state.exclusionRules,
          classes: [...state.exclusionRules.classes || [], action.payload.className].filter(
            (v, i, a) => a.indexOf(v) === i
          )
        }
      };
    case REMOVE_EXCLUSION_CLASS:
      return {
        ...state,
        exclusionRules: {
          ...state.exclusionRules,
          classes: (state.exclusionRules.classes || []).filter(
            (c) => c !== action.payload.className
          )
        }
      };
    case ADD_EXCLUSION_ATTRIBUTE:
      return {
        ...state,
        exclusionRules: {
          ...state.exclusionRules,
          dataAttributes: [
            ...state.exclusionRules.dataAttributes || [],
            action.payload.attribute
          ].filter((v, i, a) => a.indexOf(v) === i)
        }
      };
    case REMOVE_EXCLUSION_ATTRIBUTE:
      return {
        ...state,
        exclusionRules: {
          ...state.exclusionRules,
          dataAttributes: (state.exclusionRules.dataAttributes || []).filter(
            (a) => a !== action.payload.attribute
          )
        }
      };
    default:
      return state;
  }
};
const InteractionManagerPluginPackage = {
  manifest,
  create: (registry, config) => new InteractionManagerPlugin(INTERACTION_MANAGER_PLUGIN_ID, registry, config),
  reducer,
  initialState
};
export {
  INTERACTION_MANAGER_PLUGIN_ID,
  InteractionManagerPlugin,
  InteractionManagerPluginPackage,
  initialDocumentState,
  initialState,
  manifest,
  reducer
};
//# sourceMappingURL=index.js.map
