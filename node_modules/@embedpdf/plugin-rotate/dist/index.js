import { BasePlugin, createBehaviorEmitter, setRotation as setRotation$1 } from "@embedpdf/core";
const ROTATE_PLUGIN_ID = "rotate";
const manifest = {
  id: ROTATE_PLUGIN_ID,
  name: "Rotate Plugin",
  version: "1.0.0",
  provides: ["rotate"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
function getRotationMatrix(rotation, w, h) {
  let a = 1, b = 0, c = 0, d = 1, e = 0, f = 0;
  switch (rotation) {
    case 1:
      a = 0;
      b = 1;
      c = -1;
      d = 0;
      e = h;
      break;
    case 2:
      a = -1;
      b = 0;
      c = 0;
      d = -1;
      e = w;
      f = h;
      break;
    case 3:
      a = 0;
      b = -1;
      c = 1;
      d = 0;
      f = w;
      break;
  }
  return [a, b, c, d, e, f];
}
function getRotationMatrixString(rotation, w, h) {
  const [a, b, c, d, e, f] = getRotationMatrix(rotation, w, h);
  return `matrix(${a},${b},${c},${d},${e},${f})`;
}
function getNextRotation(current) {
  return (current + 1) % 4;
}
function getPreviousRotation(current) {
  return (current + 3) % 4;
}
const INIT_ROTATE_STATE = "ROTATE/INIT_STATE";
const CLEANUP_ROTATE_STATE = "ROTATE/CLEANUP_STATE";
const SET_ACTIVE_ROTATE_DOCUMENT = "ROTATE/SET_ACTIVE_DOCUMENT";
const SET_ROTATION = "ROTATE/SET_ROTATION";
function initRotateState(documentId, state) {
  return { type: INIT_ROTATE_STATE, payload: { documentId, state } };
}
function cleanupRotateState(documentId) {
  return { type: CLEANUP_ROTATE_STATE, payload: documentId };
}
function setActiveRotateDocument(documentId) {
  return { type: SET_ACTIVE_ROTATE_DOCUMENT, payload: documentId };
}
function setRotation(documentId, rotation) {
  return { type: SET_ROTATION, payload: { documentId, rotation } };
}
const _RotatePlugin = class _RotatePlugin extends BasePlugin {
  constructor(id, registry, cfg) {
    super(id, registry);
    this.rotate$ = createBehaviorEmitter();
    this.defaultRotation = cfg.defaultRotation ?? 0;
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    const docState = {
      rotation: this.defaultRotation
    };
    this.dispatch(initRotateState(documentId, docState));
    this.dispatchCoreAction(setRotation$1(this.defaultRotation, documentId));
    this.logger.debug(
      "RotatePlugin",
      "DocumentOpened",
      `Initialized rotation state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupRotateState(documentId));
    this.logger.debug(
      "RotatePlugin",
      "DocumentClosed",
      `Cleaned up rotation state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      setRotation: (rotation) => this.setRotationForDocument(rotation),
      getRotation: () => this.getRotationForDocument(),
      rotateForward: () => this.rotateForward(),
      rotateBackward: () => this.rotateBackward(),
      // Document-scoped operations
      forDocument: (documentId) => this.createRotateScope(documentId),
      // Events
      onRotateChange: this.rotate$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createRotateScope(documentId) {
    return {
      setRotation: (rotation) => this.setRotationForDocument(rotation, documentId),
      getRotation: () => this.getRotationForDocument(documentId),
      rotateForward: () => this.rotateForward(documentId),
      rotateBackward: () => this.rotateBackward(documentId),
      onRotateChange: (listener) => this.rotate$.on((event) => {
        if (event.documentId === documentId) listener(event.rotation);
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
      throw new Error(`Rotation state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  setRotationForDocument(rotation, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      throw new Error(`Document ${id} not loaded`);
    }
    this.dispatch(setRotation(id, rotation));
    this.dispatchCoreAction(setRotation$1(rotation, id));
    this.rotate$.emit({
      documentId: id,
      rotation
    });
  }
  getRotationForDocument(documentId) {
    return this.getDocumentStateOrThrow(documentId).rotation;
  }
  rotateForward(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const currentRotation = this.getRotationForDocument(id);
    const nextRotation = getNextRotation(currentRotation);
    this.setRotationForDocument(nextRotation, id);
  }
  rotateBackward(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const currentRotation = this.getRotationForDocument(id);
    const prevRotation = getPreviousRotation(currentRotation);
    this.setRotationForDocument(prevRotation, id);
  }
  getMatrixAsString(options) {
    return getRotationMatrixString(options.rotation, options.width, options.height);
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if ((prevDoc == null ? void 0 : prevDoc.rotation) !== newDoc.rotation) {
        this.logger.debug(
          "RotatePlugin",
          "RotationChanged",
          `Rotation changed for document ${documentId}: ${(prevDoc == null ? void 0 : prevDoc.rotation) ?? 0} -> ${newDoc.rotation}`
        );
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize(_config) {
    this.logger.info("RotatePlugin", "Initialize", "Rotate plugin initialized");
  }
  async destroy() {
    this.rotate$.clear();
    super.destroy();
  }
};
_RotatePlugin.id = "rotate";
let RotatePlugin = _RotatePlugin;
const initialDocumentState = {
  rotation: 0
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const rotateReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_ROTATE_STATE: {
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
    case CLEANUP_ROTATE_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_ROTATE_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_ROTATION: {
      const { documentId, rotation } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            rotation
          }
        }
      };
    }
    default:
      return state;
  }
};
const RotatePluginPackage = {
  manifest,
  create: (registry, config) => new RotatePlugin(ROTATE_PLUGIN_ID, registry, config),
  reducer: rotateReducer,
  initialState
};
export {
  CLEANUP_ROTATE_STATE,
  INIT_ROTATE_STATE,
  ROTATE_PLUGIN_ID,
  RotatePlugin,
  RotatePluginPackage,
  SET_ACTIVE_ROTATE_DOCUMENT,
  SET_ROTATION,
  cleanupRotateState,
  getNextRotation,
  getPreviousRotation,
  getRotationMatrix,
  getRotationMatrixString,
  initRotateState,
  initialDocumentState,
  initialState,
  manifest,
  rotateReducer,
  setActiveRotateDocument,
  setRotation
};
//# sourceMappingURL=index.js.map
