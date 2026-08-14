import { BasePlugin, createBehaviorEmitter, refreshPages } from "@embedpdf/core";
import { PdfAnnotationSubtype, PdfPermissionFlag, uuidV4, PdfTaskHelper, PdfErrorCode, Task } from "@embedpdf/models";
import { defineAnnotationTool } from "@embedpdf/plugin-annotation";
var RedactionMode = /* @__PURE__ */ ((RedactionMode2) => {
  RedactionMode2["Redact"] = "redact";
  RedactionMode2["MarqueeRedact"] = "marqueeRedact";
  RedactionMode2["RedactSelection"] = "redactSelection";
  return RedactionMode2;
})(RedactionMode || {});
const INIT_REDACTION_STATE = "REDACTION/INIT_STATE";
const CLEANUP_REDACTION_STATE = "REDACTION/CLEANUP_STATE";
const SET_ACTIVE_DOCUMENT = "REDACTION/SET_ACTIVE_DOCUMENT";
const START_REDACTION = "START_REDACTION";
const END_REDACTION = "END_REDACTION";
const SET_ACTIVE_TYPE = "SET_ACTIVE_TYPE";
const ADD_PENDING = "ADD_PENDING";
const REMOVE_PENDING = "REMOVE_PENDING";
const UPDATE_PENDING = "UPDATE_PENDING";
const CLEAR_PENDING = "CLEAR_PENDING";
const SELECT_PENDING = "SELECT_PENDING";
const DESELECT_PENDING = "DESELECT_PENDING";
function initRedactionState(documentId, state) {
  return { type: INIT_REDACTION_STATE, payload: { documentId, state } };
}
function cleanupRedactionState(documentId) {
  return { type: CLEANUP_REDACTION_STATE, payload: documentId };
}
const addPending = (documentId, items) => ({
  type: ADD_PENDING,
  payload: { documentId, items }
});
const removePending = (documentId, page, id) => ({
  type: REMOVE_PENDING,
  payload: { documentId, page, id }
});
const clearPending = (documentId) => ({
  type: CLEAR_PENDING,
  payload: documentId
});
const updatePending = (documentId, page, id, patch) => ({
  type: UPDATE_PENDING,
  payload: { documentId, page, id, patch }
});
const startRedaction = (documentId, mode) => ({
  type: START_REDACTION,
  payload: { documentId, mode }
});
const endRedaction = (documentId) => ({
  type: END_REDACTION,
  payload: documentId
});
const selectPending = (documentId, page, id) => ({
  type: SELECT_PENDING,
  payload: { documentId, page, id }
});
const deselectPending = (documentId) => ({
  type: DESELECT_PENDING,
  payload: documentId
});
const calculatePendingCount = (pending) => {
  return Object.values(pending).reduce((total, items) => total + items.length, 0);
};
const initialDocumentState = {
  isRedacting: false,
  activeType: null,
  pending: {},
  pendingCount: 0,
  selected: null
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const redactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_REDACTION_STATE: {
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
    case CLEANUP_REDACTION_STATE: {
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
    case ADD_PENDING: {
      const { documentId, items } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const next = { ...docState.pending };
      for (const item of items) {
        const existing = next[item.page] ?? [];
        if (existing.some((it) => it.id === item.id)) continue;
        next[item.page] = existing.concat(item);
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pending: next,
            pendingCount: calculatePendingCount(next)
          }
        }
      };
    }
    case REMOVE_PENDING: {
      const { documentId, page, id } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const list = docState.pending[page] ?? [];
      const filtered = list.filter((it) => it.id !== id);
      const next = { ...docState.pending, [page]: filtered };
      const stillSelected = docState.selected && !(docState.selected.page === page && docState.selected.id === id);
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pending: next,
            pendingCount: calculatePendingCount(next),
            selected: stillSelected ? docState.selected : null
          }
        }
      };
    }
    case UPDATE_PENDING: {
      const { documentId, page, id, patch } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const list = docState.pending[page] ?? [];
      const updated = list.map((item) => item.id === id ? { ...item, ...patch } : item);
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pending: { ...docState.pending, [page]: updated }
          }
        }
      };
    }
    case CLEAR_PENDING: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pending: {},
            pendingCount: 0,
            selected: null
          }
        }
      };
    }
    case SELECT_PENDING: {
      const { documentId, page, id } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selected: { page, id }
          }
        }
      };
    }
    case DESELECT_PENDING: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selected: null
          }
        }
      };
    }
    case START_REDACTION: {
      const { documentId, mode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            isRedacting: true,
            activeType: mode
          }
        }
      };
    }
    case END_REDACTION: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            isRedacting: false,
            activeType: null
          }
        }
      };
    }
    case SET_ACTIVE_TYPE: {
      const { documentId, mode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeType: mode
          }
        }
      };
    }
    default:
      return state;
  }
};
const redactTool = defineAnnotationTool({
  id: "redact",
  name: "Redact",
  categories: ["annotation", "redaction"],
  matchScore: (a) => a.type === PdfAnnotationSubtype.REDACT ? 10 : 0,
  interaction: {
    mode: RedactionMode.Redact,
    exclusive: false,
    cursor: "crosshair",
    textSelection: true,
    // Dynamic based on whether it's a text or area redaction
    isDraggable: (anno) => {
      var _a;
      if (anno.type !== PdfAnnotationSubtype.REDACT) return true;
      return !((_a = anno.segmentRects) == null ? void 0 : _a.length);
    },
    isResizable: (anno) => {
      var _a;
      if (anno.type !== PdfAnnotationSubtype.REDACT) return true;
      return !((_a = anno.segmentRects) == null ? void 0 : _a.length);
    },
    isRotatable: false,
    lockAspectRatio: false,
    isGroupDraggable: false,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.REDACT,
    color: "#000000",
    overlayColor: "#FFFFFF",
    strokeColor: "#E44234",
    opacity: 1
  },
  behavior: {
    useAppearanceStream: false
  }
});
const redactTools = [redactTool];
const _RedactionPlugin = class _RedactionPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b, _c, _d;
    super(id, registry);
    this.redactionSelection$ = /* @__PURE__ */ new Map();
    this.redactionMarquee$ = /* @__PURE__ */ new Map();
    this.pending$ = createBehaviorEmitter();
    this.selected$ = createBehaviorEmitter();
    this.state$ = createBehaviorEmitter();
    this.events$ = createBehaviorEmitter();
    this.documentUnsubscribers = /* @__PURE__ */ new Map();
    this.config = config;
    this.selectionCapability = (_a = this.registry.getPlugin("selection")) == null ? void 0 : _a.provides();
    this.interactionManagerCapability = (_b = this.registry.getPlugin("interaction-manager")) == null ? void 0 : _b.provides();
    this.annotationCapability = (_c = this.registry.getPlugin("annotation")) == null ? void 0 : _c.provides();
    this.historyCapability = (_d = this.registry.getPlugin("history")) == null ? void 0 : _d.provides();
    if (this.config.useAnnotationMode) {
      if (this.annotationCapability) {
        this.useAnnotationMode = true;
      } else {
        this.logger.warn(
          "RedactionPlugin",
          "ConfigError",
          "useAnnotationMode is enabled but annotation plugin is not available. Falling back to legacy mode."
        );
        this.useAnnotationMode = false;
      }
    } else {
      this.useAnnotationMode = false;
    }
    if (this.useAnnotationMode && this.annotationCapability) {
      for (const tool of redactTools) {
        this.annotationCapability.addTool(tool);
      }
    }
    this.setupRedactionModes();
    if (!this.useAnnotationMode && this.annotationCapability) {
      this.logger.info(
        "RedactionPlugin",
        "LegacyMode",
        "Using legacy redaction mode. Set useAnnotationMode: true in config to use annotation-based redactions."
      );
    }
    this.setupModeChangeListener();
  }
  /**
   * Setup redaction modes - registers all interaction modes for redaction.
   * Works for both annotation mode and legacy mode.
   */
  setupRedactionModes() {
    if (!this.interactionManagerCapability) return;
    this.interactionManagerCapability.registerMode({
      id: RedactionMode.Redact,
      scope: "page",
      exclusive: false,
      cursor: "crosshair"
    });
    this.interactionManagerCapability.registerMode({
      id: RedactionMode.MarqueeRedact,
      scope: "page",
      exclusive: false,
      cursor: "crosshair"
    });
    this.interactionManagerCapability.registerMode({
      id: RedactionMode.RedactSelection,
      scope: "page",
      exclusive: false
    });
  }
  /**
   * Setup mode change listener - handles all redaction modes
   */
  setupModeChangeListener() {
    var _a;
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.onModeChange((modeState) => {
      const documentId = modeState.documentId;
      const isRedactionMode = modeState.activeMode === RedactionMode.Redact || modeState.activeMode === RedactionMode.MarqueeRedact || modeState.activeMode === RedactionMode.RedactSelection;
      if (isRedactionMode) {
        this.dispatch(startRedaction(documentId, modeState.activeMode));
      } else {
        const docState = this.getDocumentState(documentId);
        if (docState == null ? void 0 : docState.isRedacting) {
          this.dispatch(endRedaction(documentId));
        }
      }
    });
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.dispatch(
      initRedactionState(documentId, {
        ...initialDocumentState
      })
    );
    this.redactionSelection$.set(documentId, createBehaviorEmitter());
    this.redactionMarquee$.set(
      documentId,
      createBehaviorEmitter()
    );
    const unsubscribers = [];
    if (this.selectionCapability) {
      const selectionScope = this.selectionCapability.forDocument(documentId);
      const unsubSelection = selectionScope.onSelectionChange(() => {
        const docState = this.getDocumentState(documentId);
        if (!(docState == null ? void 0 : docState.isRedacting)) return;
        const formattedSelection = selectionScope.getFormattedSelection();
        const emitter = this.redactionSelection$.get(documentId);
        emitter == null ? void 0 : emitter.emit(formattedSelection);
      });
      const unsubEndSelection = selectionScope.onEndSelection(() => {
        const docState = this.getDocumentState(documentId);
        if (!(docState == null ? void 0 : docState.isRedacting)) return;
        if (!this.checkPermission(documentId, PdfPermissionFlag.ModifyContents)) return;
        const formattedSelection = selectionScope.getFormattedSelection();
        if (!formattedSelection.length) return;
        const textTask = selectionScope.getSelectedText();
        const emitter = this.redactionSelection$.get(documentId);
        emitter == null ? void 0 : emitter.emit([]);
        selectionScope.clear();
        textTask.wait(
          (textArr) => {
            const text = textArr.join(" ");
            this.createRedactionsFromSelection(documentId, formattedSelection, text);
          },
          () => {
            this.createRedactionsFromSelection(documentId, formattedSelection);
          }
        );
      });
      const unsubMarqueeChange = selectionScope.onMarqueeChange((event) => {
        var _a;
        const docState = this.getDocumentState(documentId);
        if (!(docState == null ? void 0 : docState.isRedacting)) return;
        (_a = this.redactionMarquee$.get(documentId)) == null ? void 0 : _a.emit({ pageIndex: event.pageIndex, rect: event.rect, modeId: event.modeId });
      });
      const unsubMarqueeEnd = selectionScope.onMarqueeEnd((event) => {
        const docState = this.getDocumentState(documentId);
        if (!(docState == null ? void 0 : docState.isRedacting)) return;
        if (!this.checkPermission(documentId, PdfPermissionFlag.ModifyContents)) return;
        if (this.useAnnotationMode) {
          this.createRedactAnnotationFromArea(documentId, event.pageIndex, event.rect);
        } else {
          const redactionColor = this.config.drawBlackBoxes ? "#000000" : "transparent";
          const item = {
            id: uuidV4(),
            kind: "area",
            page: event.pageIndex,
            rect: event.rect,
            source: "legacy",
            markColor: "#FF0000",
            redactionColor
          };
          this.dispatch(addPending(documentId, [item]));
          this.selectPending(event.pageIndex, item.id, documentId);
        }
      });
      const unsubEmptySpaceClick = selectionScope.onEmptySpaceClick(() => {
        this.deselectPending(documentId);
      });
      unsubscribers.push(
        unsubSelection,
        unsubEndSelection,
        unsubMarqueeChange,
        unsubMarqueeEnd,
        unsubEmptySpaceClick
      );
    }
    if (this.useAnnotationMode && this.annotationCapability) {
      const annoScope = this.annotationCapability.forDocument(documentId);
      const unsubEvents = annoScope.onAnnotationEvent((event) => {
        var _a;
        if (event.type === "loaded") {
          this.syncFromAnnotationLoad(documentId);
          return;
        }
        if (((_a = event.annotation) == null ? void 0 : _a.type) !== PdfAnnotationSubtype.REDACT) return;
        const redactAnno = event.annotation;
        if (event.type === "create") {
          this.syncFromAnnotationCreate(documentId, redactAnno);
          this.events$.emit({
            type: "add",
            documentId,
            items: [this.annotationToRedactionItem(redactAnno)]
          });
        } else if (event.type === "update") {
          this.logger.debug("RedactionPlugin", "AnnotationUpdated", {
            documentId,
            redactAnno,
            patch: event.patch
          });
          this.syncFromAnnotationUpdate(
            documentId,
            redactAnno,
            event.patch
          );
        } else if (event.type === "delete") {
          this.syncFromAnnotationDelete(documentId, redactAnno);
          this.events$.emit({
            type: "remove",
            documentId,
            page: redactAnno.pageIndex,
            id: redactAnno.id
          });
        }
      });
      const unsubState = annoScope.onStateChange(() => {
        this.syncSelectionFromAnnotation(documentId);
      });
      unsubscribers.push(unsubEvents, unsubState);
    }
    this.documentUnsubscribers.set(documentId, unsubscribers);
    this.logger.debug(
      "RedactionPlugin",
      "DocumentOpened",
      `Initialized redaction state for document: ${documentId}`
    );
  }
  onDocumentLoaded(documentId) {
    var _a, _b, _c;
    (_a = this.selectionCapability) == null ? void 0 : _a.enableForMode(
      RedactionMode.Redact,
      {
        enableSelection: true,
        showSelectionRects: false,
        enableMarquee: true,
        showMarqueeRects: false
      },
      documentId
    );
    (_b = this.selectionCapability) == null ? void 0 : _b.enableForMode(
      RedactionMode.MarqueeRedact,
      {
        enableSelection: false,
        enableMarquee: true,
        showMarqueeRects: false
      },
      documentId
    );
    (_c = this.selectionCapability) == null ? void 0 : _c.enableForMode(
      RedactionMode.RedactSelection,
      {
        enableSelection: true,
        showSelectionRects: false
      },
      documentId
    );
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupRedactionState(documentId));
    const emitter = this.redactionSelection$.get(documentId);
    emitter == null ? void 0 : emitter.clear();
    this.redactionSelection$.delete(documentId);
    const marqueeEmitter = this.redactionMarquee$.get(documentId);
    marqueeEmitter == null ? void 0 : marqueeEmitter.clear();
    this.redactionMarquee$.delete(documentId);
    const unsubscribers = this.documentUnsubscribers.get(documentId);
    if (unsubscribers) {
      unsubscribers.forEach((unsub) => unsub());
      this.documentUnsubscribers.delete(documentId);
    }
    this.logger.debug(
      "RedactionPlugin",
      "DocumentClosed",
      `Cleaned up redaction state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  async initialize(_config) {
    this.logger.info("RedactionPlugin", "Initialize", "Redaction plugin initialized");
  }
  buildCapability() {
    return {
      // Active document operations
      queueCurrentSelectionAsPending: () => this.queueCurrentSelectionAsPending(),
      // Unified redact mode
      enableRedact: () => this.enableRedact(),
      toggleRedact: () => this.toggleRedact(),
      isRedactActive: () => this.isRedactActive(),
      endRedact: () => this.endRedact(),
      // Legacy marquee mode
      enableMarqueeRedact: () => this.enableMarqueeRedact(),
      toggleMarqueeRedact: () => this.toggleMarqueeRedact(),
      isMarqueeRedactActive: () => this.isMarqueeRedactActive(),
      // Legacy selection mode
      enableRedactSelection: () => this.enableRedactSelection(),
      toggleRedactSelection: () => this.toggleRedactSelection(),
      isRedactSelectionActive: () => this.isRedactSelectionActive(),
      addPending: (items) => this.addPendingItems(items),
      removePending: (page, id) => this.removePendingItem(page, id),
      clearPending: () => this.clearPendingItems(),
      commitAllPending: () => this.commitAllPending(),
      commitPending: (page, id) => this.commitPendingOne(page, id),
      selectPending: (page, id) => this.selectPending(page, id),
      getSelectedPending: () => this.getSelectedPending(),
      deselectPending: () => this.deselectPending(),
      getState: () => this.getDocumentStateOrThrow(),
      // Document-scoped operations
      forDocument: (documentId) => this.createRedactionScope(documentId),
      // Events
      onPendingChange: this.pending$.on,
      onSelectedChange: this.selected$.on,
      onRedactionEvent: this.events$.on,
      onStateChange: this.state$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createRedactionScope(documentId) {
    return {
      queueCurrentSelectionAsPending: () => this.queueCurrentSelectionAsPending(documentId),
      // Unified redact mode
      enableRedact: () => this.enableRedact(documentId),
      toggleRedact: () => this.toggleRedact(documentId),
      isRedactActive: () => this.isRedactActive(documentId),
      endRedact: () => this.endRedact(documentId),
      // Legacy marquee mode
      enableMarqueeRedact: () => this.enableMarqueeRedact(documentId),
      toggleMarqueeRedact: () => this.toggleMarqueeRedact(documentId),
      isMarqueeRedactActive: () => this.isMarqueeRedactActive(documentId),
      // Legacy selection mode
      enableRedactSelection: () => this.enableRedactSelection(documentId),
      toggleRedactSelection: () => this.toggleRedactSelection(documentId),
      isRedactSelectionActive: () => this.isRedactSelectionActive(documentId),
      addPending: (items) => this.addPendingItems(items, documentId),
      removePending: (page, id) => this.removePendingItem(page, id, documentId),
      clearPending: () => this.clearPendingItems(documentId),
      commitAllPending: () => this.commitAllPending(documentId),
      commitPending: (page, id) => this.commitPendingOne(page, id, documentId),
      selectPending: (page, id) => this.selectPending(page, id, documentId),
      getSelectedPending: () => this.getSelectedPending(documentId),
      deselectPending: () => this.deselectPending(documentId),
      getState: () => this.getDocumentStateOrThrow(documentId),
      onPendingChange: (listener) => this.pending$.on((event) => {
        if (event.documentId === documentId) listener(event.pending);
      }),
      onSelectedChange: (listener) => this.selected$.on((event) => {
        if (event.documentId === documentId) listener(event.selected);
      }),
      onRedactionEvent: (listener) => this.events$.on((event) => {
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
  /**
   * Get pending redactions derived from annotation plugin (annotation mode only)
   */
  getPendingFromAnnotations(documentId) {
    if (!this.annotationCapability) return {};
    try {
      const annoState = this.annotationCapability.forDocument(documentId).getState();
      const result = {};
      for (const ta of Object.values(annoState.byUid)) {
        if (ta.object.type === PdfAnnotationSubtype.REDACT) {
          const item = this.annotationToRedactionItem(ta.object);
          const page = ta.object.pageIndex;
          (result[page] ?? (result[page] = [])).push(item);
        }
      }
      return result;
    } catch {
      return {};
    }
  }
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? null;
  }
  getDocumentStateOrThrow(documentId) {
    const state = this.getDocumentState(documentId);
    if (!state) {
      throw new Error(`Redaction state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  isRedactTool(tool) {
    return (tool == null ? void 0 : tool.id) === redactTool.id && tool.defaults.type === PdfAnnotationSubtype.REDACT;
  }
  getRedactTool() {
    var _a;
    const tool = (_a = this.annotationCapability) == null ? void 0 : _a.getTool("redact");
    return this.isRedactTool(tool) ? tool : void 0;
  }
  // ─────────────────────────────────────────────────────────
  // Annotation Mode State Sync
  // ─────────────────────────────────────────────────────────
  /**
   * Sync internal state when REDACT annotation is created.
   * Called from annotation event listener in annotation mode.
   */
  syncFromAnnotationCreate(documentId, annotation) {
    const item = this.annotationToRedactionItem(annotation);
    this.dispatch(addPending(documentId, [item]));
  }
  /**
   * Sync internal state when REDACT annotation is updated (moved/resized/color changed).
   * Called from annotation event listener in annotation mode.
   */
  syncFromAnnotationUpdate(documentId, annotation, patch) {
    if (!("rect" in patch) && !("segmentRects" in patch) && !("strokeColor" in patch) && !("color" in patch))
      return;
    const updatePatch = {};
    if (patch.rect) updatePatch.rect = patch.rect;
    if (patch.segmentRects) updatePatch.rects = patch.segmentRects;
    if (patch.strokeColor) updatePatch.markColor = patch.strokeColor;
    if (patch.color) updatePatch.redactionColor = patch.color;
    this.logger.debug("RedactionPlugin", "AnnotationUpdated", {
      documentId,
      annotation,
      patch: updatePatch
    });
    this.dispatch(updatePending(documentId, annotation.pageIndex, annotation.id, updatePatch));
  }
  /**
   * Sync internal state when REDACT annotation is deleted.
   * Called from annotation event listener in annotation mode.
   */
  syncFromAnnotationDelete(documentId, annotation) {
    this.dispatch(removePending(documentId, annotation.pageIndex, annotation.id));
  }
  /**
   * Sync internal state from existing REDACT annotations after initial load.
   * Called when annotation plugin emits 'loaded' event.
   */
  syncFromAnnotationLoad(documentId) {
    const pending = this.getPendingFromAnnotations(documentId);
    this.dispatch(clearPending(documentId));
    for (const [, items] of Object.entries(pending)) {
      if (items.length > 0) {
        this.dispatch(addPending(documentId, items));
      }
    }
  }
  /**
   * Sync selection state from annotation plugin's selected REDACT annotation.
   * Called when annotation plugin state changes.
   */
  syncSelectionFromAnnotation(documentId) {
    var _a;
    const annoState = (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(documentId).getState();
    if (!annoState) return;
    const selectedRedact = annoState.selectedUids.map((uid) => annoState.byUid[uid]).find((ta) => (ta == null ? void 0 : ta.object.type) === PdfAnnotationSubtype.REDACT);
    if (selectedRedact) {
      const obj = selectedRedact.object;
      this.dispatch(selectPending(documentId, obj.pageIndex, obj.id));
    } else {
      const docState = this.getDocumentState(documentId);
      if (docState == null ? void 0 : docState.selected) {
        this.dispatch(deselectPending(documentId));
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  addPendingItems(items, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "AddPendingItems",
        `Cannot add redactions: document ${id} lacks ModifyContents permission`
      );
      return;
    }
    if (this.useAnnotationMode) {
      if (!this.annotationCapability) return;
      const annoScope = this.annotationCapability.forDocument(id);
      for (const item of items) {
        const annotation = this.redactionItemToAnnotation(item);
        annoScope.createAnnotation(item.page, annotation);
      }
      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        annoScope.selectAnnotation(lastItem.page, lastItem.id);
      }
    } else {
      this.dispatch(addPending(id, items));
    }
    this.events$.emit({ type: "add", documentId: id, items });
  }
  removePendingItem(page, itemId, documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    if (this.useAnnotationMode) {
      (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(id).deleteAnnotation(page, itemId);
    } else {
      this.dispatch(removePending(id, page, itemId));
    }
    this.events$.emit({ type: "remove", documentId: id, page, id: itemId });
  }
  clearPendingItems(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    if (this.useAnnotationMode) {
      const pending = this.getPendingFromAnnotations(id);
      const annoScope = (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(id);
      for (const [pageStr, items] of Object.entries(pending)) {
        const page = Number(pageStr);
        for (const item of items) {
          annoScope == null ? void 0 : annoScope.deleteAnnotation(page, item.id);
        }
      }
    } else {
      this.dispatch(clearPending(id));
    }
    this.events$.emit({ type: "clear", documentId: id });
  }
  selectPending(page, itemId, documentId) {
    var _a, _b, _c;
    const id = documentId ?? this.getActiveDocumentId();
    if (this.useAnnotationMode) {
      (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(id).selectAnnotation(page, itemId);
    } else {
      this.dispatch(selectPending(id, page, itemId));
      (_b = this.interactionManagerCapability) == null ? void 0 : _b.claimPageActivity(id, "redaction-selection", page);
    }
    (_c = this.selectionCapability) == null ? void 0 : _c.forDocument(id).clear();
  }
  getSelectedPending(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    return ((_a = this.getDocumentState(id)) == null ? void 0 : _a.selected) ?? null;
  }
  deselectPending(documentId) {
    var _a, _b;
    const id = documentId ?? this.getActiveDocumentId();
    if (this.useAnnotationMode) {
      (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(id).deselectAnnotation();
    } else {
      this.dispatch(deselectPending(id));
      (_b = this.interactionManagerCapability) == null ? void 0 : _b.releasePageActivity(id, "redaction-selection");
    }
  }
  // ─────────────────────────────────────────────────────────
  // Legacy Selection Mode (text-based redactions)
  // ─────────────────────────────────────────────────────────
  enableRedactSelection(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "EnableRedactSelection",
        `Cannot enable redact selection: document ${id} lacks ModifyContents permission`
      );
      return;
    }
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activate(RedactionMode.RedactSelection);
  }
  toggleRedactSelection(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const scope = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id);
    const activeMode = scope == null ? void 0 : scope.getActiveMode();
    if (activeMode === RedactionMode.RedactSelection) {
      scope == null ? void 0 : scope.activateDefaultMode();
    } else {
      if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
        return;
      }
      scope == null ? void 0 : scope.activate(RedactionMode.RedactSelection);
    }
  }
  isRedactSelectionActive(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const activeMode = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).getActiveMode();
    return activeMode === RedactionMode.Redact || activeMode === RedactionMode.RedactSelection;
  }
  // ─────────────────────────────────────────────────────────
  // Legacy Marquee Mode (area-based redactions)
  // ─────────────────────────────────────────────────────────
  enableMarqueeRedact(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "EnableMarqueeRedact",
        `Cannot enable marquee redact: document ${id} lacks ModifyContents permission`
      );
      return;
    }
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activate(RedactionMode.MarqueeRedact);
  }
  toggleMarqueeRedact(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const scope = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id);
    const activeMode = scope == null ? void 0 : scope.getActiveMode();
    if (activeMode === RedactionMode.MarqueeRedact) {
      scope == null ? void 0 : scope.activateDefaultMode();
    } else {
      if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
        return;
      }
      scope == null ? void 0 : scope.activate(RedactionMode.MarqueeRedact);
    }
  }
  isMarqueeRedactActive(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const activeMode = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).getActiveMode();
    return activeMode === RedactionMode.Redact || activeMode === RedactionMode.MarqueeRedact;
  }
  // ─────────────────────────────────────────────────────────
  // Unified Redact Mode (recommended)
  // ─────────────────────────────────────────────────────────
  enableRedact(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "EnableRedact",
        `Cannot enable redact mode: document ${id} lacks ModifyContents permission`
      );
      return;
    }
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activate(RedactionMode.Redact);
  }
  toggleRedact(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const scope = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id);
    const activeMode = scope == null ? void 0 : scope.getActiveMode();
    if (activeMode === RedactionMode.Redact) {
      scope == null ? void 0 : scope.activateDefaultMode();
    } else {
      if (!this.checkPermission(id, PdfPermissionFlag.ModifyContents)) {
        return;
      }
      scope == null ? void 0 : scope.activate(RedactionMode.Redact);
    }
  }
  isRedactActive(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const activeMode = (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).getActiveMode();
    return activeMode === RedactionMode.Redact;
  }
  endRedact(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    (_a = this.interactionManagerCapability) == null ? void 0 : _a.forDocument(id).activateDefaultMode();
  }
  // ─────────────────────────────────────────────────────────
  // Public Methods
  // ─────────────────────────────────────────────────────────
  onRedactionSelectionChange(documentId, callback) {
    const emitter = this.redactionSelection$.get(documentId);
    return (emitter == null ? void 0 : emitter.on(callback)) ?? (() => {
    });
  }
  onRedactionMarqueeChange(documentId, callback) {
    const emitter = this.redactionMarquee$.get(documentId);
    return (emitter == null ? void 0 : emitter.on(callback)) ?? (() => {
    });
  }
  /**
   * Get the stroke color for redaction previews.
   * In annotation mode: returns tool's defaults.strokeColor
   * In legacy mode: returns hardcoded red
   */
  getPreviewStrokeColor() {
    var _a;
    if (this.useAnnotationMode) {
      return ((_a = this.getRedactTool()) == null ? void 0 : _a.defaults.strokeColor) ?? "#FF0000";
    }
    return "#FF0000";
  }
  queueCurrentSelectionAsPending(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.selectionCapability) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "[RedactionPlugin] selection plugin required"
      });
    }
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const selectionScope = this.selectionCapability.forDocument(id);
    const formatted = selectionScope.getFormattedSelection();
    if (!formatted.length) return PdfTaskHelper.resolve(true);
    const textTask = selectionScope.getSelectedText();
    const emitter = this.redactionSelection$.get(id);
    emitter == null ? void 0 : emitter.emit([]);
    selectionScope.clear();
    if (!this.useAnnotationMode) {
      this.enableRedactSelection(id);
    }
    const task = new Task();
    textTask.wait(
      (textArr) => {
        const text = textArr.join(" ");
        this.createRedactionsFromSelection(id, formatted, text);
        task.resolve(true);
      },
      () => {
        this.createRedactionsFromSelection(id, formatted);
        task.resolve(true);
      }
    );
    return task;
  }
  commitPendingOne(page, id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "CommitPendingOne",
        `Cannot commit redaction: document ${docId} lacks ModifyContents permission`
      );
      return PdfTaskHelper.reject({
        code: PdfErrorCode.Security,
        message: "Document lacks ModifyContents permission"
      });
    }
    const coreDoc = this.coreState.core.documents[docId];
    if (!(coreDoc == null ? void 0 : coreDoc.document))
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    const pdfPage = coreDoc.document.pages[page];
    if (!pdfPage)
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Page not found" });
    if (this.useAnnotationMode) {
      this.logger.debug(
        "RedactionPlugin",
        "CommitPendingOne",
        `Applying redaction in annotation mode: page ${page}, id ${id}`
      );
      return this.applyRedactionAnnotationMode(docId, coreDoc.document, pdfPage, id);
    }
    const docState = this.getDocumentState(docId);
    if (!docState) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "Document state not found"
      });
    }
    const item = (docState.pending[page] ?? []).find((it) => it.id === id);
    if (!item) {
      this.logger.debug(
        "RedactionPlugin",
        "CommitPendingOne",
        `No pending item found for page ${page}, id ${id}`
      );
      return PdfTaskHelper.resolve(true);
    }
    return this.commitPendingOneLegacy(docId, coreDoc.document, pdfPage, page, item);
  }
  /**
   * Legacy commit single redaction using redactTextInRects
   */
  commitPendingOneLegacy(docId, doc, pdfPage, page, item) {
    const rects = item.kind === "text" ? item.rects : [item.rect];
    const task = new Task();
    this.engine.redactTextInRects(doc, pdfPage, rects, {
      drawBlackBoxes: this.config.drawBlackBoxes
    }).wait(
      () => {
        this.dispatch(removePending(docId, page, item.id));
        this.dispatchCoreAction(refreshPages(docId, [page]));
        this.events$.emit({ type: "commit", documentId: docId, success: true });
        task.resolve(true);
      },
      (error) => {
        this.events$.emit({
          type: "commit",
          documentId: docId,
          success: false,
          error: error.reason
        });
        task.reject({ code: PdfErrorCode.Unknown, message: "Failed to commit redactions" });
      }
    );
    return task;
  }
  /**
   * Annotation mode: Apply single redaction using engine.applyRedaction
   */
  applyRedactionAnnotationMode(docId, doc, pdfPage, annotationId) {
    var _a;
    const task = new Task();
    const anno = (_a = this.annotationCapability) == null ? void 0 : _a.forDocument(docId).getAnnotationById(annotationId);
    this.logger.debug(
      "RedactionPlugin",
      "ApplyRedactionAnnotationMode",
      `Looking for annotation ${annotationId}, found: ${!!anno}, type: ${anno == null ? void 0 : anno.object.type}`
    );
    if (!anno || anno.object.type !== PdfAnnotationSubtype.REDACT) {
      this.logger.warn(
        "RedactionPlugin",
        "ApplyRedactionAnnotationMode",
        `Redaction annotation not found or wrong type: ${annotationId}`
      );
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "Redaction annotation not found"
      });
    }
    this.logger.debug(
      "RedactionPlugin",
      "ApplyRedactionAnnotationMode",
      `Calling engine.applyRedaction for annotation ${annotationId} on page ${pdfPage.index}`
    );
    this.engine.applyRedaction(doc, pdfPage, anno.object).wait(
      () => {
        var _a2, _b;
        this.logger.debug(
          "RedactionPlugin",
          "ApplyRedactionAnnotationMode",
          `Successfully applied redaction ${annotationId} on page ${pdfPage.index}`
        );
        (_a2 = this.annotationCapability) == null ? void 0 : _a2.forDocument(docId).purgeAnnotation(pdfPage.index, annotationId);
        this.dispatch(removePending(docId, pdfPage.index, annotationId));
        (_b = this.historyCapability) == null ? void 0 : _b.forDocument(docId).purgeByMetadata(
          (meta) => {
            var _a3;
            return ((_a3 = meta == null ? void 0 : meta.annotationIds) == null ? void 0 : _a3.includes(annotationId)) ?? false;
          },
          "annotations"
        );
        this.dispatchCoreAction(refreshPages(docId, [pdfPage.index]));
        this.events$.emit({ type: "commit", documentId: docId, success: true });
        task.resolve(true);
      },
      (error) => {
        var _a2;
        this.logger.error(
          "RedactionPlugin",
          "ApplyRedactionAnnotationMode",
          `Failed to apply redaction ${annotationId}: ${((_a2 = error.reason) == null ? void 0 : _a2.message) ?? "Unknown error"}`
        );
        this.events$.emit({
          type: "commit",
          documentId: docId,
          success: false,
          error: error.reason
        });
        task.reject({ code: PdfErrorCode.Unknown, message: "Failed to apply redaction" });
      }
    );
    return task;
  }
  commitAllPending(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyContents)) {
      this.logger.debug(
        "RedactionPlugin",
        "CommitAllPending",
        `Cannot commit redactions: document ${docId} lacks ModifyContents permission`
      );
      return PdfTaskHelper.reject({
        code: PdfErrorCode.Security,
        message: "Document lacks ModifyContents permission"
      });
    }
    const coreDoc = this.coreState.core.documents[docId];
    if (!(coreDoc == null ? void 0 : coreDoc.document))
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    const docState = this.getDocumentState(docId);
    if (!docState) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "Document state not found"
      });
    }
    if (this.useAnnotationMode) {
      return this.applyAllRedactionsAnnotationMode(docId, coreDoc.document);
    } else {
      return this.commitAllPendingLegacy(docId, coreDoc.document, docState);
    }
  }
  /**
   * Legacy commit all redactions using redactTextInRects
   */
  commitAllPendingLegacy(docId, doc, docState) {
    const perPage = /* @__PURE__ */ new Map();
    for (const [page, items] of Object.entries(docState.pending)) {
      const p = Number(page);
      const list = perPage.get(p) ?? [];
      for (const it of items) {
        if (it.kind === "text") list.push(...it.rects);
        else list.push(it.rect);
      }
      perPage.set(p, list);
    }
    const pagesToRefresh = Array.from(perPage.entries()).filter(([_, rects]) => rects.length > 0).map(([pageIndex]) => pageIndex);
    const tasks = [];
    for (const [pageIndex, rects] of perPage) {
      const page = doc.pages[pageIndex];
      if (!page) continue;
      if (!rects.length) continue;
      tasks.push(
        this.engine.redactTextInRects(doc, page, rects, {
          drawBlackBoxes: this.config.drawBlackBoxes
        })
      );
    }
    const task = new Task();
    Task.all(tasks).wait(
      () => {
        this.dispatch(clearPending(docId));
        this.dispatchCoreAction(refreshPages(docId, pagesToRefresh));
        this.events$.emit({ type: "commit", documentId: docId, success: true });
        task.resolve(true);
      },
      (error) => {
        this.events$.emit({
          type: "commit",
          documentId: docId,
          success: false,
          error: error.reason
        });
        task.reject({ code: PdfErrorCode.Unknown, message: "Failed to commit redactions" });
      }
    );
    return task;
  }
  /**
   * Annotation mode: Apply all redactions using engine.applyAllRedactions per page
   */
  applyAllRedactionsAnnotationMode(docId, doc) {
    const annotationCapability = this.annotationCapability;
    if (!annotationCapability) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "Annotation capability not found"
      });
    }
    const annoState = annotationCapability.forDocument(docId).getState();
    const redactAnnotationsByPage = /* @__PURE__ */ new Map();
    for (const ta of Object.values(annoState.byUid)) {
      if (ta.object.type === PdfAnnotationSubtype.REDACT) {
        const pageIds = redactAnnotationsByPage.get(ta.object.pageIndex) ?? [];
        pageIds.push(ta.object.id);
        redactAnnotationsByPage.set(ta.object.pageIndex, pageIds);
      }
    }
    const pagesToProcess = Array.from(redactAnnotationsByPage.keys());
    if (pagesToProcess.length === 0) {
      return PdfTaskHelper.resolve(true);
    }
    const tasks = [];
    for (const pageIndex of pagesToProcess) {
      const page = doc.pages[pageIndex];
      if (!page) continue;
      tasks.push(this.engine.applyAllRedactions(doc, page));
    }
    const task = new Task();
    Task.all(tasks).wait(
      () => {
        var _a;
        const annoScope = annotationCapability.forDocument(docId);
        const allPurgedIds = [];
        for (const [pageIndex, ids] of redactAnnotationsByPage) {
          for (const id of ids) {
            annoScope.purgeAnnotation(pageIndex, id);
            this.dispatch(removePending(docId, pageIndex, id));
            allPurgedIds.push(id);
          }
        }
        if (allPurgedIds.length > 0) {
          (_a = this.historyCapability) == null ? void 0 : _a.forDocument(docId).purgeByMetadata(
            (meta) => {
              var _a2;
              return ((_a2 = meta == null ? void 0 : meta.annotationIds) == null ? void 0 : _a2.some((id) => allPurgedIds.includes(id))) ?? false;
            },
            "annotations"
          );
        }
        this.dispatchCoreAction(refreshPages(docId, pagesToProcess));
        this.events$.emit({ type: "commit", documentId: docId, success: true });
        task.resolve(true);
      },
      (error) => {
        this.events$.emit({
          type: "commit",
          documentId: docId,
          success: false,
          error: error.reason
        });
        task.reject({ code: PdfErrorCode.Unknown, message: "Failed to apply redactions" });
      }
    );
    return task;
  }
  // ─────────────────────────────────────────────────────────
  // Annotation Mode Helpers
  // ─────────────────────────────────────────────────────────
  /**
   * Create REDACT annotations from text selection (annotation mode only)
   * @returns Array of annotation IDs that were created
   */
  createRedactAnnotationsFromSelection(documentId, formattedSelection, text) {
    var _a;
    if (!this.annotationCapability) return [];
    const annoScope = this.annotationCapability.forDocument(documentId);
    const defaults = (_a = this.getRedactTool()) == null ? void 0 : _a.defaults;
    const annotationIds = [];
    for (const selection of formattedSelection) {
      const annotationId = uuidV4();
      annotationIds.push(annotationId);
      const annotation = {
        ...defaults,
        id: annotationId,
        type: PdfAnnotationSubtype.REDACT,
        pageIndex: selection.pageIndex,
        rect: selection.rect,
        segmentRects: selection.segmentRects,
        ...text ? { custom: { text } } : {},
        created: /* @__PURE__ */ new Date()
      };
      annoScope.createAnnotation(selection.pageIndex, annotation);
      if (selection === formattedSelection[formattedSelection.length - 1]) {
        annoScope.selectAnnotation(selection.pageIndex, annotationId);
      }
    }
    if (text) {
      for (let i = 0; i < annotationIds.length; i++) {
        const pageIndex = formattedSelection[i].pageIndex;
        this.dispatch(updatePending(documentId, pageIndex, annotationIds[i], { text }));
      }
    }
    return annotationIds;
  }
  /**
   * Create legacy RedactionItems from text selection (legacy mode only)
   */
  createLegacyRedactionsFromSelection(documentId, formattedSelection, text) {
    const redactionColor = this.config.drawBlackBoxes ? "#000000" : "transparent";
    const items = formattedSelection.map((s) => ({
      id: uuidV4(),
      kind: "text",
      page: s.pageIndex,
      rect: s.rect,
      rects: s.segmentRects,
      source: "legacy",
      markColor: "#FF0000",
      redactionColor,
      text
    }));
    this.dispatch(addPending(documentId, items));
    if (items.length) {
      this.selectPending(items[items.length - 1].page, items[items.length - 1].id, documentId);
    }
  }
  /**
   * Unified method to create redactions from text selection.
   * Delegates to annotation mode or legacy mode helper based on configuration.
   */
  createRedactionsFromSelection(documentId, formattedSelection, text) {
    if (this.useAnnotationMode) {
      this.createRedactAnnotationsFromSelection(documentId, formattedSelection, text);
    } else {
      this.createLegacyRedactionsFromSelection(documentId, formattedSelection, text);
    }
  }
  /**
   * Create a REDACT annotation from an area/marquee selection (annotation mode only)
   */
  createRedactAnnotationFromArea(documentId, pageIndex, rect) {
    var _a;
    if (!this.annotationCapability) return;
    const annoScope = this.annotationCapability.forDocument(documentId);
    const defaults = (_a = this.getRedactTool()) == null ? void 0 : _a.defaults;
    const annotationId = uuidV4();
    const annotation = {
      ...defaults,
      id: annotationId,
      type: PdfAnnotationSubtype.REDACT,
      pageIndex,
      rect,
      segmentRects: [],
      // No segment rects for area redaction
      created: /* @__PURE__ */ new Date()
    };
    annoScope.createAnnotation(pageIndex, annotation);
    annoScope.selectAnnotation(pageIndex, annotationId);
  }
  /**
   * Convert a RedactionItem to a PdfRedactAnnoObject
   */
  redactionItemToAnnotation(item) {
    var _a;
    const defaults = ((_a = this.getRedactTool()) == null ? void 0 : _a.defaults) ?? {};
    return {
      ...defaults,
      id: item.id,
      type: PdfAnnotationSubtype.REDACT,
      pageIndex: item.page,
      rect: item.rect,
      segmentRects: item.kind === "text" ? item.rects : [],
      created: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Convert a PdfRedactAnnoObject to a RedactionItem
   */
  annotationToRedactionItem(anno) {
    var _a;
    const markColor = anno.strokeColor ?? "#FF0000";
    const redactionColor = anno.color ?? "transparent";
    if (anno.segmentRects && anno.segmentRects.length > 0) {
      return {
        id: anno.id,
        kind: "text",
        page: anno.pageIndex,
        rect: anno.rect,
        rects: anno.segmentRects,
        source: "annotation",
        markColor,
        redactionColor,
        ...((_a = anno.custom) == null ? void 0 : _a.text) ? { text: anno.custom.text } : {}
      };
    } else {
      return {
        id: anno.id,
        kind: "area",
        page: anno.pageIndex,
        rect: anno.rect,
        source: "annotation",
        markColor,
        redactionColor
      };
    }
  }
  // ─────────────────────────────────────────────────────────
  // Event Emission Helpers
  // ─────────────────────────────────────────────────────────
  emitPendingChange(documentId) {
    const docState = this.getDocumentState(documentId);
    if (docState) {
      this.pending$.emit({ documentId, pending: docState.pending });
    }
  }
  emitSelectedChange(documentId) {
    const docState = this.getDocumentState(documentId);
    if (docState) {
      this.selected$.emit({ documentId, selected: docState.selected });
    }
  }
  emitStateChange(documentId) {
    const docState = this.getDocumentState(documentId);
    if (docState) {
      this.state$.emit({ documentId, state: docState });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(_, newState) {
    for (const documentId in newState.documents) {
      const docState = newState.documents[documentId];
      if (docState) {
        this.emitPendingChange(documentId);
        this.emitSelectedChange(documentId);
        this.emitStateChange(documentId);
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async destroy() {
    this.pending$.clear();
    this.selected$.clear();
    this.state$.clear();
    this.events$.clear();
    this.redactionSelection$.forEach((emitter) => emitter.clear());
    this.redactionSelection$.clear();
    this.redactionMarquee$.forEach((emitter) => emitter.clear());
    this.redactionMarquee$.clear();
    this.documentUnsubscribers.forEach((unsubscribers) => {
      unsubscribers.forEach((unsub) => unsub());
    });
    this.documentUnsubscribers.clear();
    await super.destroy();
  }
};
_RedactionPlugin.id = "redaction";
let RedactionPlugin = _RedactionPlugin;
const REDACTION_PLUGIN_ID = "redaction";
const manifest = {
  id: REDACTION_PLUGIN_ID,
  name: "Redaction Plugin",
  version: "1.0.0",
  provides: ["redaction"],
  requires: [],
  optional: ["interaction-manager", "selection", "annotation"],
  defaultConfig: {
    drawBlackBoxes: true
  }
};
const getPendingRedactionsCount = (s) => s.pendingCount;
const hasPendingRedactions = (s) => s.pendingCount > 0;
const getDocumentPendingCount = (state, documentId) => {
  var _a;
  return ((_a = state.documents[documentId]) == null ? void 0 : _a.pendingCount) ?? 0;
};
const getTotalPendingCount = (state) => {
  return Object.values(state.documents).reduce((sum, doc) => sum + doc.pendingCount, 0);
};
const RedactionPluginPackage = {
  manifest,
  create: (registry, config) => new RedactionPlugin(REDACTION_PLUGIN_ID, registry, config),
  reducer: redactionReducer,
  initialState
};
export {
  REDACTION_PLUGIN_ID,
  RedactionMode,
  RedactionPlugin,
  RedactionPluginPackage,
  getDocumentPendingCount,
  getPendingRedactionsCount,
  getTotalPendingCount,
  hasPendingRedactions,
  initialDocumentState,
  initialState,
  manifest,
  redactTool,
  redactTools
};
//# sourceMappingURL=index.js.map
