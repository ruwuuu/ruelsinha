import { Rotation, PdfPermissionFlag, NoopLogger, PermissionDeniedError } from "@embedpdf/models";
class DependencyResolver {
  constructor() {
    this.dependencyGraph = /* @__PURE__ */ new Map();
  }
  addNode(id, dependencies = []) {
    this.dependencyGraph.set(id, new Set(dependencies));
  }
  hasCircularDependencies() {
    const visited = /* @__PURE__ */ new Set();
    const recursionStack = /* @__PURE__ */ new Set();
    const dfs = (id) => {
      visited.add(id);
      recursionStack.add(id);
      const dependencies = this.dependencyGraph.get(id) || /* @__PURE__ */ new Set();
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }
      recursionStack.delete(id);
      return false;
    };
    for (const id of this.dependencyGraph.keys()) {
      if (!visited.has(id)) {
        if (dfs(id)) return true;
      }
    }
    return false;
  }
  resolveLoadOrder() {
    if (this.hasCircularDependencies()) {
      throw new Error("Circular dependencies detected");
    }
    const result = [];
    const visited = /* @__PURE__ */ new Set();
    const temp = /* @__PURE__ */ new Set();
    const visit = (id) => {
      if (temp.has(id)) throw new Error("Circular dependency");
      if (visited.has(id)) return;
      temp.add(id);
      const dependencies = this.dependencyGraph.get(id) || /* @__PURE__ */ new Set();
      for (const dep of dependencies) {
        visit(dep);
      }
      temp.delete(id);
      visited.add(id);
      result.push(id);
    };
    for (const id of this.dependencyGraph.keys()) {
      if (!visited.has(id)) {
        visit(id);
      }
    }
    return result;
  }
}
class PluginRegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PluginRegistrationError";
  }
}
class PluginNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "PluginNotFoundError";
  }
}
class CircularDependencyError extends Error {
  constructor(message) {
    super(message);
    this.name = "CircularDependencyError";
  }
}
class CapabilityNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "CapabilityNotFoundError";
  }
}
class CapabilityConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "CapabilityConflictError";
  }
}
class PluginInitializationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PluginInitializationError";
  }
}
class PluginConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PluginConfigurationError";
  }
}
class PluginStore {
  /**
   * Initializes the PluginStore with the main store and plugin ID.
   * @param store The main store instance.
   * @param pluginId The unique identifier for the plugin.
   */
  constructor(store, pluginId) {
    this.store = store;
    this.pluginId = pluginId;
  }
  /**
   * Gets the current state of the plugin.
   * @returns The plugin's state.
   */
  getState() {
    return this.store.getState().plugins[this.pluginId];
  }
  /**
   * Dispatches an action for the plugin and returns the *new* global state.
   * If you only need the plugin’s updated state, call `getState()` afterward.
   * @param action The action to dispatch.
   * @returns The updated global store state (after plugin reducer).
   */
  dispatch(action) {
    return this.store.dispatchToPlugin(this.pluginId, action);
  }
  /**
   * Subscribes to state changes only for this specific plugin.
   * You now receive (action, newPluginState, oldPluginState) in the callback.
   *
   * @param listener The callback to invoke when plugin state changes.
   * @returns A function to unsubscribe the listener.
   */
  subscribeToState(listener) {
    return this.store.subscribeToPlugin(this.pluginId, (action, newPluginState, oldPluginState) => {
      listener(
        action,
        newPluginState,
        oldPluginState
      );
    });
  }
  /**
   * Subscribes to a specific action type for the plugin.
   * This still uses the main store's `onAction`, so you get the *global*
   * old/new store states there. If you specifically want old/new plugin state,
   * use `subscribeToState` instead.
   *
   * @param type The action type to listen for.
   * @param handler The callback to invoke when the action occurs.
   * @returns A function to unsubscribe the handler.
   */
  onAction(type, handler) {
    return this.store.onAction(type, (action, state, oldState) => {
      handler(
        action,
        state.plugins[this.pluginId],
        oldState.plugins[this.pluginId]
      );
    });
  }
}
const START_LOADING_DOCUMENT = "START_LOADING_DOCUMENT";
const UPDATE_DOCUMENT_LOADING_PROGRESS = "UPDATE_DOCUMENT_LOADING_PROGRESS";
const SET_DOCUMENT_LOADED = "SET_DOCUMENT_LOADED";
const SET_DOCUMENT_ERROR = "SET_DOCUMENT_ERROR";
const RETRY_LOADING_DOCUMENT = "RETRY_LOADING_DOCUMENT";
const CLOSE_DOCUMENT = "CLOSE_DOCUMENT";
const SET_ACTIVE_DOCUMENT = "SET_ACTIVE_DOCUMENT";
const REORDER_DOCUMENTS = "REORDER_DOCUMENTS";
const MOVE_DOCUMENT = "MOVE_DOCUMENT";
const UPDATE_DOCUMENT_SECURITY = "UPDATE_DOCUMENT_SECURITY";
const REFRESH_DOCUMENT = "REFRESH_DOCUMENT";
const REFRESH_PAGES = "REFRESH_PAGES";
const SET_PAGES = "SET_PAGES";
const SET_SCALE = "SET_SCALE";
const SET_ROTATION = "SET_ROTATION";
const SET_DEFAULT_SCALE = "SET_DEFAULT_SCALE";
const SET_DEFAULT_ROTATION = "SET_DEFAULT_ROTATION";
const CORE_ACTION_TYPES = [
  START_LOADING_DOCUMENT,
  UPDATE_DOCUMENT_LOADING_PROGRESS,
  SET_DOCUMENT_LOADED,
  CLOSE_DOCUMENT,
  SET_ACTIVE_DOCUMENT,
  SET_DOCUMENT_ERROR,
  RETRY_LOADING_DOCUMENT,
  REFRESH_DOCUMENT,
  REFRESH_PAGES,
  SET_PAGES,
  SET_SCALE,
  SET_ROTATION,
  SET_DEFAULT_SCALE,
  SET_DEFAULT_ROTATION,
  REORDER_DOCUMENTS,
  MOVE_DOCUMENT,
  UPDATE_DOCUMENT_SECURITY
];
const startLoadingDocument = (documentId, name, scale, rotation, passwordProvided, autoActivate, permissions) => ({
  type: START_LOADING_DOCUMENT,
  payload: { documentId, name, scale, rotation, passwordProvided, autoActivate, permissions }
});
const updateDocumentLoadingProgress = (documentId, progress) => ({
  type: UPDATE_DOCUMENT_LOADING_PROGRESS,
  payload: { documentId, progress }
});
const setDocumentLoaded = (documentId, document) => ({
  type: SET_DOCUMENT_LOADED,
  payload: { documentId, document }
});
const setDocumentError = (documentId, error, errorCode, errorDetails) => ({
  type: SET_DOCUMENT_ERROR,
  payload: { documentId, error, errorCode, errorDetails }
});
const retryLoadingDocument = (documentId, passwordProvided) => ({
  type: RETRY_LOADING_DOCUMENT,
  payload: { documentId, passwordProvided }
});
const closeDocument = (documentId, nextActiveDocumentId) => ({
  type: CLOSE_DOCUMENT,
  payload: { documentId, nextActiveDocumentId }
});
const setActiveDocument = (documentId) => ({
  type: SET_ACTIVE_DOCUMENT,
  payload: documentId
});
const refreshDocument = (documentId, document) => ({
  type: REFRESH_DOCUMENT,
  payload: { documentId, document }
});
const refreshPages = (documentId, pageIndexes) => ({
  type: REFRESH_PAGES,
  payload: { documentId, pageIndexes }
});
const setPages = (documentId, pages) => ({
  type: SET_PAGES,
  payload: { documentId, pages }
});
const setScale = (scale, documentId) => ({
  type: SET_SCALE,
  payload: { scale, documentId }
});
const setRotation = (rotation, documentId) => ({
  type: SET_ROTATION,
  payload: { rotation, documentId }
});
const setDefaultScale = (scale) => ({
  type: SET_DEFAULT_SCALE,
  payload: scale
});
const setDefaultRotation = (rotation) => ({
  type: SET_DEFAULT_ROTATION,
  payload: rotation
});
const reorderDocuments = (order) => ({
  type: REORDER_DOCUMENTS,
  payload: order
});
const moveDocument = (documentId, toIndex) => ({
  type: MOVE_DOCUMENT,
  payload: { documentId, toIndex }
});
const updateDocumentSecurity = (documentId, permissions, isOwnerUnlocked) => ({
  type: UPDATE_DOCUMENT_SECURITY,
  payload: { documentId, permissions, isOwnerUnlocked }
});
class Store {
  /**
   * Initializes the store with the provided core state.
   * @param reducer          The core reducer function
   * @param initialCoreState The initial core state
   */
  constructor(reducer, initialCoreState2) {
    this.initialCoreState = initialCoreState2;
    this.pluginReducers = {};
    this.listeners = [];
    this.pluginListeners = {};
    this.isDispatching = false;
    this.state = { core: initialCoreState2, plugins: {} };
    this.coreReducer = reducer;
  }
  /**
   * Adds a reducer for a plugin-specific state.
   * @param pluginId The unique identifier for the plugin.
   * @param reducer The reducer function for the plugin state.
   * @param initialState The initial state for the plugin.
   */
  addPluginReducer(pluginId, reducer, initialState) {
    this.state.plugins[pluginId] = initialState;
    this.pluginReducers[pluginId] = reducer;
  }
  /**
   * Dispatches an action *only* to the core reducer.
   * Notifies the global store listeners with (action, newState, oldState).
   *
   * @param action The action to dispatch, typed as CoreAction
   * @returns The updated *global* store state
   */
  dispatchToCore(action) {
    if (!this.coreReducer) {
      return this.getState();
    }
    if (this.isDispatching) {
      throw new Error(
        "Reducers may not dispatch actions. To trigger cascading actions, dispatch from a listener callback instead."
      );
    }
    const oldState = this.getState();
    try {
      this.isDispatching = true;
      this.state.core = this.coreReducer(this.state.core, action);
    } finally {
      this.isDispatching = false;
    }
    this.listeners.forEach((listener) => {
      const currentState = this.getState();
      listener(action, currentState, oldState);
    });
    return this.getState();
  }
  /**
   * Dispatches an action *only* to a specific plugin.
   * Optionally notifies global store listeners if `notifyGlobal` is true.
   * Always notifies plugin-specific listeners with (action, newPluginState, oldPluginState).
   *
   * @param pluginId   The plugin identifier
   * @param action     The plugin action to dispatch
   * @param notifyGlobal Whether to also notify global store listeners
   * @returns The updated plugin state
   */
  dispatchToPlugin(pluginId, action, notifyGlobal = true) {
    if (this.isDispatching) {
      throw new Error(
        "Reducers may not dispatch actions. To trigger cascading actions, dispatch from a listener callback instead."
      );
    }
    const oldGlobalState = this.getState();
    const reducer = this.pluginReducers[pluginId];
    if (!reducer) {
      return oldGlobalState.plugins[pluginId];
    }
    const oldPluginState = oldGlobalState.plugins[pluginId];
    try {
      this.isDispatching = true;
      const newPluginState = reducer(oldPluginState, action);
      this.state.plugins[pluginId] = newPluginState;
    } finally {
      this.isDispatching = false;
    }
    if (notifyGlobal) {
      this.listeners.forEach((listener) => {
        const currentGlobalState = this.getState();
        listener(action, currentGlobalState, oldGlobalState);
      });
    }
    if (this.pluginListeners[pluginId]) {
      this.pluginListeners[pluginId].forEach((listener) => {
        const currentPluginState = this.getState().plugins[pluginId];
        listener(action, currentPluginState, oldPluginState);
      });
    }
    return this.getState().plugins[pluginId];
  }
  /**
   * Dispatches an action to update the state using:
   * - the core reducer (if it's a CoreAction)
   * - *all* plugin reducers (regardless of action type), with no global notify for each plugin
   *
   * Returns the new *global* store state after all reducers have processed the action.
   *
   * @param action The action to dispatch (can be CoreAction or any Action).
   */
  dispatch(action) {
    if (this.isDispatching) {
      throw new Error(
        "Reducers may not dispatch actions. To trigger cascading actions, dispatch from a listener callback instead."
      );
    }
    const oldState = this.getState();
    try {
      this.isDispatching = true;
      if (this.isCoreAction(action)) {
        this.state.core = this.coreReducer(this.state.core, action);
      }
      for (const pluginId in this.pluginReducers) {
        const reducer = this.pluginReducers[pluginId];
        const oldPluginState = oldState.plugins[pluginId];
        if (reducer) {
          this.state.plugins[pluginId] = reducer(oldPluginState, action);
        }
      }
    } finally {
      this.isDispatching = false;
    }
    this.listeners.forEach((listener) => {
      const currentState = this.getState();
      listener(action, currentState, oldState);
    });
    return this.getState();
  }
  /**
   * Returns a shallow copy of the current state.
   * @returns The current store state.
   */
  getState() {
    if (this.isDispatching) {
      throw new Error(
        "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store."
      );
    }
    return {
      core: { ...this.state.core },
      plugins: { ...this.state.plugins }
    };
  }
  /**
   * Subscribes a listener to *global* state changes.
   * The callback signature is now (action, newState, oldState).
   *
   * @param listener The callback to invoke on state changes
   * @returns A function to unsubscribe the listener
   */
  subscribe(listener) {
    if (this.isDispatching) {
      throw new Error(
        "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state."
      );
    }
    this.listeners.push(listener);
    return () => {
      if (this.isDispatching) {
        throw new Error(
          "You may not unsubscribe from a store listener while the reducer is executing."
        );
      }
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  /**
   * Subscribes a listener to *plugin-specific* state changes.
   * The callback signature is now (action, newPluginState, oldPluginState).
   *
   * @param pluginId The unique identifier for the plugin.
   * @param listener The callback to invoke on plugin state changes.
   * @returns A function to unsubscribe the listener.
   */
  subscribeToPlugin(pluginId, listener) {
    if (!(pluginId in this.state.plugins)) {
      throw new Error(
        `Plugin state not found for plugin "${pluginId}". Did you forget to call addPluginReducer?`
      );
    }
    if (this.isDispatching) {
      throw new Error("You may not call store.subscribeToPlugin() while the reducer is executing.");
    }
    if (!this.pluginListeners[pluginId]) {
      this.pluginListeners[pluginId] = [];
    }
    this.pluginListeners[pluginId].push(listener);
    return () => {
      if (this.isDispatching) {
        throw new Error(
          "You may not unsubscribe from a store listener while the reducer is executing."
        );
      }
      this.pluginListeners[pluginId] = this.pluginListeners[pluginId].filter((l) => l !== listener);
      if (this.pluginListeners[pluginId].length === 0) {
        delete this.pluginListeners[pluginId];
      }
    };
  }
  /**
   * Subscribes to a specific action type (only from the core's action union).
   * The callback signature is (action, newState, oldState).
   *
   * @param type The action type to listen for.
   * @param handler The callback to invoke when the action occurs.
   * @returns A function to unsubscribe the handler.
   */
  onAction(type, handler) {
    return this.subscribe((action, newState, oldState) => {
      if (action.type === type) {
        handler(action, newState, oldState);
      }
    });
  }
  /**
   * Gets a PluginStore handle for a specific plugin.
   * @param pluginId The unique identifier for the plugin.
   * @returns A PluginStore instance for the plugin.
   */
  getPluginStore(pluginId) {
    if (!(pluginId in this.state.plugins)) {
      throw new Error(
        `Plugin state not found for plugin "${pluginId}". Did you forget to call addPluginReducer?`
      );
    }
    return new PluginStore(this, pluginId);
  }
  /**
   * Helper method to check if an action is a CoreAction.
   * Adjust if you have a more refined way to differentiate CoreAction vs. any other Action.
   */
  isCoreAction(action) {
    return CORE_ACTION_TYPES.includes(action.type);
  }
  /**
   * Destroy the store: drop every listener and plugin reducer
   */
  destroy() {
    var _a, _b;
    this.listeners.length = 0;
    for (const id in this.pluginListeners) {
      (_b = (_a = this.pluginListeners[id]) == null ? void 0 : _a.splice) == null ? void 0 : _b.call(_a, 0);
    }
    this.pluginListeners = {};
    this.pluginReducers = {};
    this.state.plugins = {};
    this.state.core = { ...this.initialCoreState };
  }
}
const initialCoreState = (config) => ({
  documents: {},
  documentOrder: [],
  activeDocumentId: null,
  defaultScale: (config == null ? void 0 : config.defaultScale) ?? 1,
  defaultRotation: (config == null ? void 0 : config.defaultRotation) ?? Rotation.Degree0,
  globalPermissions: config == null ? void 0 : config.permissions
});
const PERMISSION_NAME_TO_FLAG = {
  print: PdfPermissionFlag.Print,
  modifyContents: PdfPermissionFlag.ModifyContents,
  copyContents: PdfPermissionFlag.CopyContents,
  modifyAnnotations: PdfPermissionFlag.ModifyAnnotations,
  fillForms: PdfPermissionFlag.FillForms,
  extractForAccessibility: PdfPermissionFlag.ExtractForAccessibility,
  assembleDocument: PdfPermissionFlag.AssembleDocument,
  printHighQuality: PdfPermissionFlag.PrintHighQuality
};
const ALL_PERMISSION_FLAGS = [
  PdfPermissionFlag.Print,
  PdfPermissionFlag.ModifyContents,
  PdfPermissionFlag.CopyContents,
  PdfPermissionFlag.ModifyAnnotations,
  PdfPermissionFlag.FillForms,
  PdfPermissionFlag.ExtractForAccessibility,
  PdfPermissionFlag.AssembleDocument,
  PdfPermissionFlag.PrintHighQuality
];
const ALL_PERMISSION_NAMES = [
  "print",
  "modifyContents",
  "copyContents",
  "modifyAnnotations",
  "fillForms",
  "extractForAccessibility",
  "assembleDocument",
  "printHighQuality"
];
const PERMISSION_FLAG_TO_NAME = {
  [PdfPermissionFlag.Print]: "print",
  [PdfPermissionFlag.ModifyContents]: "modifyContents",
  [PdfPermissionFlag.CopyContents]: "copyContents",
  [PdfPermissionFlag.ModifyAnnotations]: "modifyAnnotations",
  [PdfPermissionFlag.FillForms]: "fillForms",
  [PdfPermissionFlag.ExtractForAccessibility]: "extractForAccessibility",
  [PdfPermissionFlag.AssembleDocument]: "assembleDocument",
  [PdfPermissionFlag.PrintHighQuality]: "printHighQuality"
};
function getPermissionOverride(overrides, flag) {
  if (!overrides) return void 0;
  if (flag in overrides) {
    return overrides[flag];
  }
  const name = PERMISSION_FLAG_TO_NAME[flag];
  if (name && name in overrides) {
    return overrides[name];
  }
  return void 0;
}
const getActiveDocumentState = (state) => {
  if (!state.activeDocumentId) return null;
  return state.documents[state.activeDocumentId] ?? null;
};
const getDocumentState = (state, documentId) => {
  return state.documents[documentId] ?? null;
};
const getDocumentIds = (state) => {
  return Object.keys(state.documents);
};
const isDocumentLoaded = (state, documentId) => {
  return !!state.documents[documentId];
};
const getDocumentCount = (state) => {
  return Object.keys(state.documents).length;
};
function getEffectivePermission(state, documentId, flag) {
  var _a;
  const docState = state.documents[documentId];
  const docConfig = docState == null ? void 0 : docState.permissions;
  const globalConfig = state.globalPermissions;
  const pdfPermissions = ((_a = docState == null ? void 0 : docState.document) == null ? void 0 : _a.permissions) ?? PdfPermissionFlag.AllowAll;
  const docOverride = getPermissionOverride(docConfig == null ? void 0 : docConfig.overrides, flag);
  if (docOverride !== void 0) {
    return docOverride;
  }
  const globalOverride = getPermissionOverride(globalConfig == null ? void 0 : globalConfig.overrides, flag);
  if (globalOverride !== void 0) {
    return globalOverride;
  }
  const enforce = (docConfig == null ? void 0 : docConfig.enforceDocumentPermissions) ?? (globalConfig == null ? void 0 : globalConfig.enforceDocumentPermissions) ?? true;
  if (!enforce) return true;
  return (pdfPermissions & flag) !== 0;
}
function getEffectivePermissions(state, documentId) {
  return ALL_PERMISSION_FLAGS.reduce((acc, flag) => {
    return getEffectivePermission(state, documentId, flag) ? acc | flag : acc;
  }, 0);
}
function calculateNextActiveDocument(state, closingDocumentId, explicitNext) {
  const currentActiveId = state.activeDocumentId;
  if (currentActiveId !== closingDocumentId) {
    return currentActiveId;
  }
  if (explicitNext !== void 0) {
    return explicitNext && state.documents[explicitNext] ? explicitNext : null;
  }
  const closingIndex = state.documentOrder.indexOf(closingDocumentId);
  if (closingIndex === -1) {
    return null;
  }
  if (closingIndex > 0) {
    return state.documentOrder[closingIndex - 1];
  }
  if (closingIndex < state.documentOrder.length - 1) {
    return state.documentOrder[closingIndex + 1];
  }
  return null;
}
function moveDocumentInOrder(currentOrder, documentId, toIndex) {
  const fromIndex = currentOrder.indexOf(documentId);
  if (fromIndex === -1) return null;
  if (toIndex < 0 || toIndex >= currentOrder.length) return null;
  if (fromIndex === toIndex) return null;
  const newOrder = [...currentOrder];
  newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, documentId);
  return newOrder;
}
const coreReducer = (state, action) => {
  switch (action.type) {
    case START_LOADING_DOCUMENT: {
      const {
        documentId,
        name,
        scale,
        rotation,
        passwordProvided,
        autoActivate = true,
        permissions
      } = action.payload;
      const newDocState = {
        id: documentId,
        name,
        status: "loading",
        loadingProgress: 0,
        error: null,
        document: null,
        scale: scale ?? state.defaultScale,
        rotation: rotation ?? state.defaultRotation,
        passwordProvided: passwordProvided ?? false,
        pageRefreshVersions: {},
        permissions,
        loadStartedAt: Date.now()
      };
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: newDocState
        },
        documentOrder: [...state.documentOrder, documentId],
        // Only activate if autoActivate is true (default), or if no document is currently active
        activeDocumentId: autoActivate || !state.activeDocumentId ? documentId : state.activeDocumentId
      };
    }
    case UPDATE_DOCUMENT_LOADING_PROGRESS: {
      const { documentId, progress } = action.payload;
      const docState = state.documents[documentId];
      if (!docState || docState.status !== "loading") return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            loadingProgress: progress
          }
        }
      };
    }
    case SET_DOCUMENT_LOADED: {
      const { documentId, document } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            status: "loaded",
            document,
            error: null,
            errorCode: void 0,
            errorDetails: void 0,
            passwordProvided: void 0,
            loadedAt: Date.now()
          }
        }
      };
    }
    case SET_DOCUMENT_ERROR: {
      const { documentId, error, errorCode, errorDetails } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            status: "error",
            error,
            errorCode,
            errorDetails
          }
        }
      };
    }
    case RETRY_LOADING_DOCUMENT: {
      const { documentId, passwordProvided } = action.payload;
      const docState = state.documents[documentId];
      if (!docState || docState.status !== "error") return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            status: "loading",
            loadingProgress: 0,
            error: null,
            errorCode: void 0,
            errorDetails: void 0,
            passwordProvided: passwordProvided ?? false,
            loadStartedAt: Date.now()
          }
        }
      };
    }
    case CLOSE_DOCUMENT: {
      const { documentId, nextActiveDocumentId } = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        documentOrder: state.documentOrder.filter((id) => id !== documentId),
        activeDocumentId: calculateNextActiveDocument(state, documentId, nextActiveDocumentId)
      };
    }
    case MOVE_DOCUMENT: {
      const { documentId, toIndex } = action.payload;
      const newOrder = moveDocumentInOrder(state.documentOrder, documentId, toIndex);
      if (!newOrder) return state;
      return {
        ...state,
        documentOrder: newOrder
      };
    }
    case REORDER_DOCUMENTS: {
      return {
        ...state,
        documentOrder: action.payload
      };
    }
    case SET_ACTIVE_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_SCALE: {
      const { scale, documentId } = action.payload;
      const targetId = documentId ?? state.activeDocumentId;
      if (!targetId) return state;
      const docState = state.documents[targetId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [targetId]: {
            ...docState,
            scale
          }
        }
      };
    }
    case SET_ROTATION: {
      const { rotation, documentId } = action.payload;
      const targetId = documentId ?? state.activeDocumentId;
      if (!targetId) return state;
      const docState = state.documents[targetId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [targetId]: {
            ...docState,
            rotation
          }
        }
      };
    }
    case REFRESH_PAGES: {
      const { documentId, pageIndexes } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const newVersions = { ...docState.pageRefreshVersions };
      for (const pageIndex of pageIndexes) {
        newVersions[pageIndex] = (newVersions[pageIndex] || 0) + 1;
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pageRefreshVersions: newVersions
          }
        }
      };
    }
    case UPDATE_DOCUMENT_SECURITY: {
      const { documentId, permissions, isOwnerUnlocked } = action.payload;
      const docState = state.documents[documentId];
      if (!(docState == null ? void 0 : docState.document)) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            document: {
              ...docState.document,
              permissions,
              isOwnerUnlocked
            }
          }
        }
      };
    }
    default:
      return state;
  }
};
class PluginRegistry {
  constructor(engine, config) {
    this.plugins = /* @__PURE__ */ new Map();
    this.manifests = /* @__PURE__ */ new Map();
    this.capabilities = /* @__PURE__ */ new Map();
    this.status = /* @__PURE__ */ new Map();
    this.configurations = /* @__PURE__ */ new Map();
    this.initPromise = null;
    this.pendingRegistrations = [];
    this.processingRegistrations = [];
    this.initialized = false;
    this.isInitializing = false;
    this.pluginsReadyPromise = null;
    this.destroyed = false;
    this.resolver = new DependencyResolver();
    this.engine = engine;
    this.initialCoreState = initialCoreState(config);
    this.store = new Store(coreReducer, this.initialCoreState);
    this.logger = (config == null ? void 0 : config.logger) ?? new NoopLogger();
  }
  /**
   * Get the logger instance
   */
  getLogger() {
    return this.logger;
  }
  /**
   * Register a plugin without initializing it
   */
  registerPlugin(pluginPackage, config) {
    if (this.initialized && !this.isInitializing) {
      throw new PluginRegistrationError("Cannot register plugins after initialization");
    }
    this.validateManifest(pluginPackage.manifest);
    this.store.addPluginReducer(
      pluginPackage.manifest.id,
      // We need one type assertion here since we can't fully reconcile TAction with Action
      // due to TypeScript's type system limitations with generic variance
      pluginPackage.reducer,
      "function" === typeof pluginPackage.initialState ? pluginPackage.initialState(
        this.initialCoreState,
        {
          ...pluginPackage.manifest.defaultConfig,
          ...config
        }
      ) : pluginPackage.initialState
    );
    this.pendingRegistrations.push({
      package: pluginPackage,
      config
    });
  }
  /**
   * Get the central store instance
   */
  getStore() {
    return this.store;
  }
  /**
   * Get the engine instance
   */
  getEngine() {
    return this.engine;
  }
  /**
   * Get a promise that resolves when all plugins are ready
   */
  pluginsReady() {
    if (this.pluginsReadyPromise) {
      return this.pluginsReadyPromise;
    }
    this.pluginsReadyPromise = (async () => {
      if (!this.initialized) {
        await this.initialize();
      }
      const readyPromises = Array.from(this.plugins.values()).map(
        (p) => typeof p.ready === "function" ? p.ready() : Promise.resolve()
      );
      await Promise.all(readyPromises);
    })();
    return this.pluginsReadyPromise;
  }
  /**
   * INITIALISE THE REGISTRY – runs once no-matter-how-many calls   *
   */
  async initialize() {
    if (this.destroyed) {
      throw new PluginRegistrationError("Registry has been destroyed");
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = (async () => {
      if (this.initialized) {
        throw new PluginRegistrationError("Registry is already initialized");
      }
      this.isInitializing = true;
      try {
        if (this.destroyed) return;
        while (this.pendingRegistrations.length > 0) {
          if (this.destroyed) return;
          this.processingRegistrations = [...this.pendingRegistrations];
          this.pendingRegistrations = [];
          for (const reg of this.processingRegistrations) {
            const dependsOn = /* @__PURE__ */ new Set();
            const allDeps = [...reg.package.manifest.requires, ...reg.package.manifest.optional];
            for (const cap of allDeps) {
              const provider = this.processingRegistrations.find(
                (r) => r.package.manifest.provides.includes(cap)
              );
              if (provider) {
                dependsOn.add(provider.package.manifest.id);
              }
            }
            this.resolver.addNode(reg.package.manifest.id, [...dependsOn]);
          }
          const loadOrder = this.resolver.resolveLoadOrder();
          for (const id of loadOrder) {
            const reg = this.processingRegistrations.find((r) => r.package.manifest.id === id);
            this.instantiatePlugin(reg.package.manifest, reg.package.create, reg.config);
          }
          for (const id of loadOrder) {
            await this.runPluginInitialization(id);
          }
          this.processingRegistrations = [];
          this.resolver = new DependencyResolver();
        }
        this.initialized = true;
      } catch (err) {
        if (err instanceof Error) {
          throw new CircularDependencyError(
            `Failed to resolve plugin dependencies: ${err.message}`
          );
        }
        throw err;
      } finally {
        this.isInitializing = false;
      }
    })();
    return this.initPromise;
  }
  /**
   * Phase 2: Create instance and register capabilities
   */
  instantiatePlugin(manifest, packageCreator, config) {
    const finalConfig = {
      ...manifest.defaultConfig,
      ...config
    };
    this.validateConfig(manifest.id, finalConfig, manifest.defaultConfig);
    const plugin = packageCreator(this, finalConfig);
    this.validatePlugin(plugin);
    for (const capability of manifest.provides) {
      if (this.capabilities.has(capability)) {
        throw new PluginRegistrationError(
          `Capability ${capability} is already provided by plugin ${this.capabilities.get(capability)}`
        );
      }
      this.capabilities.set(capability, manifest.id);
    }
    this.plugins.set(manifest.id, plugin);
    this.manifests.set(manifest.id, manifest);
    this.status.set(manifest.id, "registered");
    this.configurations.set(manifest.id, finalConfig);
  }
  /**
   * Phase 3: Run the initialize method
   */
  async runPluginInitialization(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    const manifest = this.manifests.get(pluginId);
    const config = this.configurations.get(pluginId);
    for (const capability of manifest.requires) {
      if (!this.capabilities.has(capability)) {
        throw new PluginRegistrationError(
          `Missing required capability: ${capability} for plugin ${pluginId}`
        );
      }
    }
    this.logger.debug("PluginRegistry", "InitializePlugin", `Initializing plugin ${pluginId}`);
    try {
      if (plugin.initialize) {
        await plugin.initialize(config);
      }
      this.status.set(pluginId, "active");
      this.logger.info(
        "PluginRegistry",
        "PluginInitialized",
        `Plugin ${pluginId} initialized successfully`
      );
    } catch (error) {
      this.status.set(pluginId, "error");
      this.logger.error(
        "PluginRegistry",
        "InitializationFailed",
        `Plugin ${pluginId} initialization failed`,
        { error }
      );
      throw error;
    }
  }
  getPluginConfig(pluginId) {
    const config = this.configurations.get(pluginId);
    if (!config) {
      throw new PluginNotFoundError(`Configuration for plugin ${pluginId} not found`);
    }
    return config;
  }
  validateConfig(pluginId, config, defaultConfig) {
    const requiredKeys = Object.keys(defaultConfig);
    const missingKeys = requiredKeys.filter((key) => !config.hasOwnProperty(key));
    if (missingKeys.length > 0) {
      throw new PluginConfigurationError(
        `Missing required configuration keys for plugin ${pluginId}: ${missingKeys.join(", ")}`
      );
    }
  }
  async updatePluginConfig(pluginId, config) {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(`Plugin ${pluginId} not found`);
    }
    const manifest = this.manifests.get(pluginId);
    const currentConfig = this.configurations.get(pluginId);
    if (!manifest || !currentConfig) {
      throw new PluginNotFoundError(`Plugin ${pluginId} not found`);
    }
    const newConfig = {
      ...currentConfig,
      ...config
    };
    this.validateConfig(pluginId, newConfig, manifest.defaultConfig);
    this.configurations.set(pluginId, newConfig);
    if (plugin.initialize) {
      await plugin.initialize(newConfig);
    }
  }
  /**
   * Register multiple plugins at once
   */
  registerPluginBatch(registrations) {
    for (const reg of registrations) {
      this.registerPlugin(reg.package, reg.config);
    }
  }
  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(`Plugin ${pluginId} is not registered`);
    }
    const manifest = this.manifests.get(pluginId);
    if (!manifest) {
      throw new PluginNotFoundError(`Manifest for plugin ${pluginId} not found`);
    }
    for (const [otherId, otherManifest] of this.manifests.entries()) {
      if (otherId === pluginId) continue;
      const dependsOnThis = [...otherManifest.requires, ...otherManifest.optional].some(
        (cap) => manifest.provides.includes(cap)
      );
      if (dependsOnThis) {
        throw new PluginRegistrationError(
          `Cannot unregister plugin ${pluginId}: plugin ${otherId} depends on it`
        );
      }
    }
    try {
      if (plugin.destroy) {
        await plugin.destroy();
      }
      for (const capability of manifest.provides) {
        this.capabilities.delete(capability);
      }
      this.plugins.delete(pluginId);
      this.manifests.delete(pluginId);
      this.status.delete(pluginId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to unregister plugin ${pluginId}: ${error.message}`);
      }
      throw error;
    }
  }
  /**
   * Get a plugin instance
   * @param pluginId The ID of the plugin to get
   * @returns The plugin instance or null if not found
   */
  getPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return null;
    }
    return plugin;
  }
  /**
   * Get a plugin that provides a specific capability
   * @param capability The capability to get a provider for
   * @returns The plugin providing the capability or null if not found
   */
  getCapabilityProvider(capability) {
    const pluginId = this.capabilities.get(capability);
    if (!pluginId) {
      return null;
    }
    return this.getPlugin(pluginId);
  }
  /**
   * Check if a capability is available
   */
  hasCapability(capability) {
    return this.capabilities.has(capability);
  }
  /**
   * Get all registered plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  /**
   * Get plugin status
   */
  getPluginStatus(pluginId) {
    const status = this.status.get(pluginId);
    if (!status) {
      throw new PluginNotFoundError(`Plugin ${pluginId} not found`);
    }
    return status;
  }
  /**
   * Validate plugin object
   */
  validatePlugin(plugin) {
    if (!plugin.id) {
      throw new PluginRegistrationError("Plugin must have an id");
    }
  }
  /**
   * Validate plugin manifest
   */
  validateManifest(manifest) {
    if (!manifest.id) {
      throw new PluginRegistrationError("Manifest must have an id");
    }
    if (!manifest.name) {
      throw new PluginRegistrationError("Manifest must have a name");
    }
    if (!manifest.version) {
      throw new PluginRegistrationError("Manifest must have a version");
    }
    if (!Array.isArray(manifest.provides)) {
      throw new PluginRegistrationError("Manifest must have a provides array");
    }
    if (!Array.isArray(manifest.requires)) {
      throw new PluginRegistrationError("Manifest must have a requires array");
    }
    if (!Array.isArray(manifest.optional)) {
      throw new PluginRegistrationError("Manifest must have an optional array");
    }
  }
  isDestroyed() {
    return this.destroyed;
  }
  /**
   * DESTROY EVERYTHING – waits for any ongoing initialise(), once  *
   */
  async destroy() {
    var _a;
    if (this.destroyed) throw new PluginRegistrationError("Registry has already been destroyed");
    this.destroyed = true;
    try {
      await this.initPromise;
    } catch {
    }
    for (const plugin of Array.from(this.plugins.values()).reverse()) {
      await ((_a = plugin.destroy) == null ? void 0 : _a.call(plugin));
    }
    this.store.destroy();
    this.plugins.clear();
    this.manifests.clear();
    this.capabilities.clear();
    this.status.clear();
    this.pendingRegistrations.length = 0;
    this.processingRegistrations.length = 0;
  }
}
function createPluginRegistration(pluginPackage, config) {
  return {
    package: pluginPackage,
    config
  };
}
function hasAutoMountElements(pkg) {
  return "autoMountElements" in pkg && typeof pkg.autoMountElements === "function";
}
class BasePlugin {
  constructor(id, registry) {
    this.id = id;
    this.registry = registry;
    this.cooldownActions = {};
    this.debouncedTimeouts = {};
    this.unsubscribeFromState = null;
    this.unsubscribeFromCoreStore = null;
    this.unsubscribeFromStartLoadingDocument = null;
    this.unsubscribeFromSetDocumentLoaded = null;
    this.unsubscribeFromCloseDocument = null;
    this.unsubscribeFromSetScale = null;
    this.unsubscribeFromSetRotation = null;
    if (id !== this.constructor.id) {
      throw new Error(
        `Plugin ID mismatch: ${id} !== ${this.constructor.id}`
      );
    }
    this.engine = this.registry.getEngine();
    this.logger = this.registry.getLogger();
    this.coreStore = this.registry.getStore();
    this.pluginStore = this.coreStore.getPluginStore(this.id);
    this.unsubscribeFromState = this.pluginStore.subscribeToState((action, newState, oldState) => {
      this.onStoreUpdated(oldState, newState);
    });
    this.unsubscribeFromCoreStore = this.coreStore.subscribe((action, newState, oldState) => {
      this.onCoreStoreUpdated(oldState, newState);
      if (newState.core.activeDocumentId !== oldState.core.activeDocumentId) {
        this.onActiveDocumentChanged(
          oldState.core.activeDocumentId,
          newState.core.activeDocumentId
        );
      }
    });
    this.unsubscribeFromStartLoadingDocument = this.coreStore.onAction(
      START_LOADING_DOCUMENT,
      (action) => {
        this.onDocumentLoadingStarted(action.payload.documentId);
      }
    );
    this.unsubscribeFromSetDocumentLoaded = this.coreStore.onAction(
      SET_DOCUMENT_LOADED,
      (action) => {
        this.onDocumentLoaded(action.payload.documentId);
      }
    );
    this.unsubscribeFromCloseDocument = this.coreStore.onAction(CLOSE_DOCUMENT, (action) => {
      this.onDocumentClosed(action.payload.documentId);
    });
    this.unsubscribeFromSetScale = this.coreStore.onAction(SET_SCALE, (action, state) => {
      const targetId = action.payload.documentId ?? state.core.activeDocumentId;
      if (targetId) {
        this.onScaleChanged(targetId, action.payload.scale);
      }
    });
    this.unsubscribeFromSetRotation = this.coreStore.onAction(SET_ROTATION, (action, state) => {
      const targetId = action.payload.documentId ?? state.core.activeDocumentId;
      if (targetId) {
        this.onRotationChanged(targetId, action.payload.rotation);
      }
    });
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
    this.readyResolve();
  }
  provides() {
    if (!this._capability) {
      const cap = this.buildCapability();
      this._capability = Object.freeze(cap);
    }
    return this._capability;
  }
  /**
   *  Get a copy of the current state
   */
  get state() {
    return this.pluginStore.getState();
  }
  /**
   *  Get a copy of the current core state
   */
  get coreState() {
    return this.coreStore.getState();
  }
  /**
   * @deprecated  use `this.state` Get a copy of the current state
   */
  getState() {
    return this.pluginStore.getState();
  }
  /**
   * @deprecated  use `this.coreState` Get a copy of the current core state
   */
  getCoreState() {
    return this.coreStore.getState();
  }
  /**
   * Core Dispatch
   */
  dispatchCoreAction(action) {
    return this.coreStore.dispatchToCore(action);
  }
  /**
   * Dispatch an action to all plugins
   */
  dispatchToAllPlugins(action) {
    return this.coreStore.dispatch(action);
  }
  /**
   * Dispatch an action
   */
  dispatch(action) {
    return this.pluginStore.dispatch(action);
  }
  /**
   * Dispatch an action with a cooldown to prevent rapid repeated calls
   * This executes immediately if cooldown has expired, then blocks subsequent calls
   * @param action The action to dispatch
   * @param cooldownTime Time in ms for cooldown (default: 100ms)
   * @returns boolean indicating whether the action was dispatched or blocked
   */
  cooldownDispatch(action, cooldownTime = 100) {
    const now = Date.now();
    const lastActionTime = this.cooldownActions[action.type] || 0;
    if (now - lastActionTime >= cooldownTime) {
      this.cooldownActions[action.type] = now;
      this.dispatch(action);
      return true;
    }
    return false;
  }
  /**
   * Dispatch an action with true debouncing - waits for the delay after the last call
   * Each new call resets the timer. Action only executes after no calls for the specified time.
   * @param action The action to dispatch
   * @param debounceTime Time in ms to wait after the last call
   */
  debouncedDispatch(action, debounceTime = 100) {
    const actionKey = action.type;
    if (this.debouncedTimeouts[actionKey]) {
      clearTimeout(this.debouncedTimeouts[actionKey]);
    }
    this.debouncedTimeouts[actionKey] = setTimeout(() => {
      this.dispatch(action);
      delete this.debouncedTimeouts[actionKey];
    }, debounceTime);
  }
  /**
   * Cancel a pending debounced action
   * @param actionType The action type to cancel
   */
  cancelDebouncedDispatch(actionType) {
    if (this.debouncedTimeouts[actionType]) {
      clearTimeout(this.debouncedTimeouts[actionType]);
      delete this.debouncedTimeouts[actionType];
    }
  }
  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    return this.pluginStore.subscribeToState(listener);
  }
  /**
   * Subscribe to core store changes
   */
  subscribeToCoreStore(listener) {
    return this.coreStore.subscribe(listener);
  }
  /**
   * Called when the plugin store state is updated
   * @param oldState Previous state
   * @param newState New state
   */
  onStoreUpdated(oldState, newState) {
  }
  /**
   * Called when the core store state is updated
   * @param oldState Previous state
   * @param newState New state
   */
  onCoreStoreUpdated(oldState, newState) {
  }
  /**
   * Called when a document is opened
   * Override to initialize per-document state
   * @param documentId The ID of the document that was opened
   */
  onDocumentLoadingStarted(documentId) {
  }
  /**
   * Called when a document is loaded
   * @param documentId The ID of the document that is loaded
   */
  onDocumentLoaded(documentId) {
  }
  /**
   * Called when a document is closed
   * Override to cleanup per-document state
   * @param documentId The ID of the document that was closed
   */
  onDocumentClosed(documentId) {
  }
  /**
   * Called when the active document changes
   * @param previousId The ID of the previous active document
   * @param currentId The ID of the new active document
   */
  onActiveDocumentChanged(previousId, currentId) {
  }
  onScaleChanged(documentId, scale) {
  }
  onRotationChanged(documentId, rotation) {
  }
  /**
   * Cleanup method to be called when plugin is being destroyed
   */
  destroy() {
    Object.values(this.debouncedTimeouts).forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.debouncedTimeouts = {};
    if (this.unsubscribeFromState) {
      this.unsubscribeFromState();
      this.unsubscribeFromState = null;
    }
    if (this.unsubscribeFromCoreStore) {
      this.unsubscribeFromCoreStore();
      this.unsubscribeFromCoreStore = null;
    }
    if (this.unsubscribeFromStartLoadingDocument) {
      this.unsubscribeFromStartLoadingDocument();
      this.unsubscribeFromStartLoadingDocument = null;
    }
    if (this.unsubscribeFromSetDocumentLoaded) {
      this.unsubscribeFromSetDocumentLoaded();
      this.unsubscribeFromSetDocumentLoaded = null;
    }
    if (this.unsubscribeFromCloseDocument) {
      this.unsubscribeFromCloseDocument();
      this.unsubscribeFromCloseDocument = null;
    }
    if (this.unsubscribeFromSetScale) {
      this.unsubscribeFromSetScale();
      this.unsubscribeFromSetScale = null;
    }
    if (this.unsubscribeFromSetRotation) {
      this.unsubscribeFromSetRotation();
      this.unsubscribeFromSetRotation = null;
    }
  }
  /**
   * Returns a promise that resolves when the plugin is ready
   */
  ready() {
    return this.readyPromise;
  }
  /**
   * Mark the plugin as ready
   */
  markReady() {
    this.readyResolve();
  }
  /**
   * Reset the ready state (useful for plugins that need to reinitialize)
   */
  resetReady() {
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }
  /**
   * Get the active document ID
   * @throws Error if no active document exists
   */
  getActiveDocumentId() {
    const id = this.coreState.core.activeDocumentId;
    if (!id) {
      throw new Error("No active document");
    }
    return id;
  }
  /**
   * Get the active document ID or null if none exists
   */
  getActiveDocumentIdOrNull() {
    return this.coreState.core.activeDocumentId;
  }
  /**
   * Get core document state for a specific document
   * @param documentId Document ID (optional, defaults to active document)
   * @returns Document state or null if not found
   */
  getCoreDocument(documentId) {
    const id = documentId ?? this.getActiveDocumentIdOrNull();
    if (!id) return null;
    return this.coreState.core.documents[id] ?? null;
  }
  /**
   * Get core document state for a specific document
   * @param documentId Document ID (optional, defaults to active document)
   * @throws Error if document not found
   */
  getCoreDocumentOrThrow(documentId) {
    const doc = this.getCoreDocument(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId ?? "active"}`);
    }
    return doc;
  }
  // ─────────────────────────────────────────────────────────
  // Permission Helpers
  // ─────────────────────────────────────────────────────────
  /**
   * Get the effective permission flags for a document.
   * Applies layered resolution: per-document override → global override → PDF permission.
   * Returns AllowAll if document not found.
   * @param documentId Document ID (optional, defaults to active document)
   */
  getDocumentPermissions(documentId) {
    const docId = documentId ?? this.coreState.core.activeDocumentId;
    if (!docId) return PdfPermissionFlag.AllowAll;
    return getEffectivePermissions(this.coreState.core, docId);
  }
  /**
   * Check if a document has the required permissions (returns boolean).
   * Applies layered resolution: per-document override → global override → PDF permission.
   * Useful for conditional UI logic.
   * @param documentId Document ID (optional, defaults to active document)
   * @param flags Permission flags to check
   */
  checkPermission(documentId, ...flags) {
    const docId = documentId ?? this.coreState.core.activeDocumentId;
    if (!docId) return true;
    return flags.every((flag) => getEffectivePermission(this.coreState.core, docId, flag));
  }
  /**
   * Assert that a document has the required permissions.
   * Applies layered resolution: per-document override → global override → PDF permission.
   * Throws PermissionDeniedError if any flag is missing.
   * @param documentId Document ID (optional, defaults to active document)
   * @param flags Permission flags to require
   */
  requirePermission(documentId, ...flags) {
    const docId = documentId ?? this.coreState.core.activeDocumentId;
    if (!docId) return;
    const missingFlags = [];
    for (const flag of flags) {
      if (!getEffectivePermission(this.coreState.core, docId, flag)) {
        missingFlags.push(flag);
      }
    }
    if (missingFlags.length > 0) {
      const effectivePermissions = getEffectivePermissions(this.coreState.core, docId);
      throw new PermissionDeniedError(missingFlags, effectivePermissions);
    }
  }
}
class EventControl {
  constructor(handler, options) {
    this.handler = handler;
    this.options = options;
    this.lastRun = 0;
    this.handle = (data) => {
      if (this.options.mode === "debounce") {
        this.debounce(data);
      } else {
        this.throttle(data);
      }
    };
  }
  debounce(data) {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => {
      this.handler(data);
      this.timeoutId = void 0;
    }, this.options.wait);
  }
  throttle(data) {
    if (this.options.mode === "debounce") return;
    const now = Date.now();
    const throttleMode = this.options.throttleMode || "leading-trailing";
    if (now - this.lastRun >= this.options.wait) {
      if (throttleMode === "leading-trailing") {
        this.handler(data);
      }
      this.lastRun = now;
    }
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(
      () => {
        this.handler(data);
        this.lastRun = Date.now();
        this.timeoutId = void 0;
      },
      this.options.wait - (now - this.lastRun)
    );
  }
  destroy() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }
}
class KeyedEventControl {
  constructor(handler, options) {
    this.handler = handler;
    this.options = options;
    this.controls = /* @__PURE__ */ new Map();
    this.handle = (data) => {
      const key = String(this.options.keyExtractor(data));
      let control = this.controls.get(key);
      if (!control) {
        control = new EventControl(this.handler, this.baseOptions);
        this.controls.set(key, control);
      }
      control.handle(data);
    };
    this.baseOptions = {
      mode: options.mode,
      wait: options.wait,
      ...options.mode === "throttle" && "throttleMode" in options ? { throttleMode: options.throttleMode } : {}
    };
  }
  destroy() {
    for (const control of this.controls.values()) {
      control.destroy();
    }
    this.controls.clear();
  }
}
function isKeyedOptions(options) {
  return "keyExtractor" in options;
}
function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
function arePropsEqual(a, b, visited) {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return a === b;
  }
  const aType = typeof a;
  const bType = typeof b;
  if (aType !== bType) return false;
  if (aType === "object") {
    if (!visited) visited = /* @__PURE__ */ new Set();
    const pairId = getPairId(a, b);
    if (visited.has(pairId)) {
      return true;
    }
    visited.add(pairId);
    const aIsArray = Array.isArray(a);
    const bIsArray = Array.isArray(b);
    if (aIsArray && bIsArray) {
      return arraysEqualUnordered(a, b, visited);
    } else if (!aIsArray && !bIsArray) {
      return objectsEqual(a, b, visited);
    } else {
      return false;
    }
  }
  return false;
}
function getPairId(a, b) {
  return `${objectId(a)}__${objectId(b)}`;
}
let objectIdCounter = 0;
const objectIds = /* @__PURE__ */ new WeakMap();
function objectId(obj) {
  if (!objectIds.has(obj)) {
    objectIds.set(obj, ++objectIdCounter);
  }
  return objectIds.get(obj);
}
function arraysEqualUnordered(a, b, visited) {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  outer: for (let i = 0; i < a.length; i++) {
    const elemA = a[i];
    for (let j = 0; j < b.length; j++) {
      if (used[j]) continue;
      if (arePropsEqual(elemA, b[j], visited)) {
        used[j] = true;
        continue outer;
      }
    }
    return false;
  }
  return true;
}
function objectsEqual(a, b, visited) {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
  }
  for (const key of aKeys) {
    const valA = a[key];
    const valB = b[key];
    if (!arePropsEqual(valA, valB, visited)) {
      return false;
    }
  }
  return true;
}
function createEmitter() {
  const listeners = /* @__PURE__ */ new Set();
  const on = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  return {
    emit: (v = void 0) => listeners.forEach((l) => l(v)),
    on,
    off: (l) => listeners.delete(l),
    clear: () => listeners.clear()
  };
}
function createBehaviorEmitter(initial, equality = arePropsEqual) {
  const listeners = /* @__PURE__ */ new Set();
  const proxyMap = /* @__PURE__ */ new Map();
  let _value = initial;
  const notify = (v) => listeners.forEach((l) => l(v));
  const baseOn = (listener, options) => {
    let realListener = listener;
    let destroy = () => {
    };
    if (options) {
      if (isKeyedOptions(options)) {
        const ctl = new KeyedEventControl(listener, options);
        realListener = ctl.handle;
        destroy = () => ctl.destroy();
      } else {
        const ctl = new EventControl(listener, options);
        realListener = ctl.handle;
        destroy = () => ctl.destroy();
      }
      proxyMap.set(listener, { wrapped: realListener, destroy });
    }
    if (_value !== void 0) realListener(_value);
    listeners.add(realListener);
    return () => {
      listeners.delete(realListener);
      destroy();
      proxyMap.delete(listener);
    };
  };
  return {
    /* emitter behaviour ---------------------------------------- */
    get value() {
      return _value;
    },
    emit(v = void 0) {
      if (_value === void 0 || !equality(_value, v)) {
        _value = v;
        notify(v);
      }
    },
    on: baseOn,
    off(listener) {
      const proxy = proxyMap.get(listener);
      if (proxy) {
        listeners.delete(proxy.wrapped);
        proxy.destroy();
        proxyMap.delete(listener);
      } else {
        listeners.delete(listener);
      }
    },
    clear() {
      listeners.clear();
      proxyMap.forEach((p) => p.destroy());
      proxyMap.clear();
    },
    /* derived hook --------------------------------------------- */
    select(selector, eq = arePropsEqual) {
      return (listener, options) => {
        let prev;
        if (_value !== void 0) {
          const mapped = selector(_value);
          prev = mapped;
          listener(mapped);
        }
        return baseOn(
          (next) => {
            const mapped = selector(next);
            if (prev === void 0 || !eq(prev, mapped)) {
              prev = mapped;
              listener(mapped);
            }
          },
          options
        );
      };
    }
  };
}
function createScopedEmitter(toGlobalEvent, options) {
  const shouldCache = (options == null ? void 0 : options.cache) ?? true;
  const equality = (options == null ? void 0 : options.equality) ?? arePropsEqual;
  const scopeCaches = /* @__PURE__ */ new Map();
  const scopeListeners = /* @__PURE__ */ new Map();
  const scopeProxyMaps = /* @__PURE__ */ new Map();
  const globalListeners = /* @__PURE__ */ new Set();
  const globalProxyMap = /* @__PURE__ */ new Map();
  const normalizeKey = (key) => String(key);
  const getOrCreateListeners = (key) => {
    let listeners = scopeListeners.get(key);
    if (!listeners) {
      listeners = /* @__PURE__ */ new Set();
      scopeListeners.set(key, listeners);
    }
    return listeners;
  };
  const getOrCreateProxyMap = (key) => {
    let proxyMap = scopeProxyMaps.get(key);
    if (!proxyMap) {
      proxyMap = /* @__PURE__ */ new Map();
      scopeProxyMaps.set(key, proxyMap);
    }
    return proxyMap;
  };
  const onGlobal = (listener, options2) => {
    let realListener = listener;
    let destroy = () => {
    };
    if (options2) {
      if (isKeyedOptions(options2)) {
        const ctl = new KeyedEventControl(listener, options2);
        realListener = ctl.handle;
        destroy = () => ctl.destroy();
      } else {
        const ctl = new EventControl(listener, options2);
        realListener = ctl.handle;
        destroy = () => ctl.destroy();
      }
      globalProxyMap.set(listener, { wrapped: realListener, destroy });
    }
    globalListeners.add(realListener);
    return () => {
      globalListeners.delete(realListener);
      destroy();
      globalProxyMap.delete(listener);
    };
  };
  return {
    emit(key, data) {
      const normalizedKey = normalizeKey(key);
      if (shouldCache) {
        const cached = scopeCaches.get(normalizedKey);
        if (cached !== void 0 && equality(cached, data)) {
          return;
        }
        scopeCaches.set(normalizedKey, data);
      }
      const listeners = scopeListeners.get(normalizedKey);
      if (listeners) {
        listeners.forEach((l) => l(data));
      }
      const globalEvent = toGlobalEvent(key, data);
      globalListeners.forEach((l) => l(globalEvent));
    },
    forScope(key) {
      const normalizedKey = normalizeKey(key);
      return (listener, options2) => {
        const listeners = getOrCreateListeners(normalizedKey);
        const proxyMap = getOrCreateProxyMap(normalizedKey);
        let realListener = listener;
        let destroy = () => {
        };
        if (options2) {
          if (isKeyedOptions(options2)) {
            const ctl = new KeyedEventControl(listener, options2);
            realListener = ctl.handle;
            destroy = () => ctl.destroy();
          } else {
            const ctl = new EventControl(listener, options2);
            realListener = ctl.handle;
            destroy = () => ctl.destroy();
          }
          proxyMap.set(listener, { wrapped: realListener, destroy });
        }
        if (shouldCache) {
          const cached = scopeCaches.get(normalizedKey);
          if (cached !== void 0) {
            realListener(cached);
          }
        }
        listeners.add(realListener);
        return () => {
          listeners.delete(realListener);
          destroy();
          proxyMap.delete(listener);
          if (listeners.size === 0) {
            scopeListeners.delete(normalizedKey);
          }
          if (proxyMap.size === 0) {
            scopeProxyMaps.delete(normalizedKey);
          }
        };
      };
    },
    onGlobal,
    getValue(key) {
      return shouldCache ? scopeCaches.get(normalizeKey(key)) : void 0;
    },
    getScopes() {
      if (shouldCache) {
        return Array.from(scopeCaches.keys());
      }
      return Array.from(scopeListeners.keys());
    },
    clearScope(key) {
      const normalizedKey = normalizeKey(key);
      if (shouldCache) {
        scopeCaches.delete(normalizedKey);
      }
      const listeners = scopeListeners.get(normalizedKey);
      if (listeners) {
        listeners.clear();
        scopeListeners.delete(normalizedKey);
      }
      const proxyMap = scopeProxyMaps.get(normalizedKey);
      if (proxyMap) {
        proxyMap.forEach((p) => p.destroy());
        proxyMap.clear();
        scopeProxyMaps.delete(normalizedKey);
      }
    },
    clear() {
      if (shouldCache) {
        scopeCaches.clear();
      }
      scopeListeners.forEach((set) => set.clear());
      scopeListeners.clear();
      scopeProxyMaps.forEach((map) => {
        map.forEach((p) => p.destroy());
        map.clear();
      });
      scopeProxyMaps.clear();
      globalListeners.clear();
      globalProxyMap.forEach((p) => p.destroy());
      globalProxyMap.clear();
    }
  };
}
function enumEntries(record) {
  return Object.entries(record).map(([k, v]) => {
    const maybeNum = Number(k);
    const typedKey = Number.isFinite(maybeNum) && k.trim() !== "" ? maybeNum : k;
    return [typedKey, v];
  });
}
class PluginPackageBuilder {
  constructor(basePackage) {
    this.autoMountElements = [];
    this.package = basePackage;
  }
  addUtility(component) {
    this.autoMountElements.push({ component, type: "utility" });
    return this;
  }
  addWrapper(component) {
    this.autoMountElements.push({ component, type: "wrapper" });
    return this;
  }
  build() {
    return {
      ...this.package,
      autoMountElements: () => this.autoMountElements
    };
  }
}
function createPluginPackage(basePackage) {
  return new PluginPackageBuilder(basePackage);
}
export {
  ALL_PERMISSION_FLAGS,
  ALL_PERMISSION_NAMES,
  BasePlugin,
  CLOSE_DOCUMENT,
  CORE_ACTION_TYPES,
  CapabilityConflictError,
  CapabilityNotFoundError,
  CircularDependencyError,
  DependencyResolver,
  EventControl,
  KeyedEventControl,
  MOVE_DOCUMENT,
  PERMISSION_FLAG_TO_NAME,
  PERMISSION_NAME_TO_FLAG,
  PluginConfigurationError,
  PluginInitializationError,
  PluginNotFoundError,
  PluginPackageBuilder,
  PluginRegistrationError,
  PluginRegistry,
  REFRESH_DOCUMENT,
  REFRESH_PAGES,
  REORDER_DOCUMENTS,
  RETRY_LOADING_DOCUMENT,
  SET_ACTIVE_DOCUMENT,
  SET_DEFAULT_ROTATION,
  SET_DEFAULT_SCALE,
  SET_DOCUMENT_ERROR,
  SET_DOCUMENT_LOADED,
  SET_PAGES,
  SET_ROTATION,
  SET_SCALE,
  START_LOADING_DOCUMENT,
  UPDATE_DOCUMENT_LOADING_PROGRESS,
  UPDATE_DOCUMENT_SECURITY,
  arePropsEqual,
  clamp,
  closeDocument,
  createBehaviorEmitter,
  createEmitter,
  createPluginPackage,
  createPluginRegistration,
  createScopedEmitter,
  enumEntries,
  getActiveDocumentState,
  getDocumentCount,
  getDocumentIds,
  getDocumentState,
  getEffectivePermission,
  getEffectivePermissions,
  getPermissionOverride,
  hasAutoMountElements,
  initialCoreState,
  isDocumentLoaded,
  isKeyedOptions,
  moveDocument,
  refreshDocument,
  refreshPages,
  reorderDocuments,
  retryLoadingDocument,
  setActiveDocument,
  setDefaultRotation,
  setDefaultScale,
  setDocumentError,
  setDocumentLoaded,
  setPages,
  setRotation,
  setScale,
  startLoadingDocument,
  updateDocumentLoadingProgress,
  updateDocumentSecurity
};
//# sourceMappingURL=index.js.map
