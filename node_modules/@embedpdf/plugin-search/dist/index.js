import { BasePlugin, createBehaviorEmitter } from "@embedpdf/core";
import { PdfErrorCode, PdfTaskHelper } from "@embedpdf/models";
const INIT_SEARCH_STATE = "SEARCH/INIT_STATE";
const CLEANUP_SEARCH_STATE = "SEARCH/CLEANUP_STATE";
const START_SEARCH_SESSION = "SEARCH/START_SEARCH_SESSION";
const STOP_SEARCH_SESSION = "SEARCH/STOP_SEARCH_SESSION";
const SET_SEARCH_FLAGS = "SEARCH/SET_SEARCH_FLAGS";
const SET_SHOW_ALL_RESULTS = "SEARCH/SET_SHOW_ALL_RESULTS";
const START_SEARCH = "SEARCH/START_SEARCH";
const SET_SEARCH_RESULTS = "SEARCH/SET_SEARCH_RESULTS";
const APPEND_SEARCH_RESULTS = "SEARCH/APPEND_SEARCH_RESULTS";
const SET_ACTIVE_RESULT_INDEX = "SEARCH/SET_ACTIVE_RESULT_INDEX";
function initSearchState(documentId, state) {
  return { type: INIT_SEARCH_STATE, payload: { documentId, state } };
}
function cleanupSearchState(documentId) {
  return { type: CLEANUP_SEARCH_STATE, payload: documentId };
}
function startSearchSession(documentId) {
  return { type: START_SEARCH_SESSION, payload: { documentId } };
}
function stopSearchSession(documentId) {
  return { type: STOP_SEARCH_SESSION, payload: { documentId } };
}
function setSearchFlags(documentId, flags) {
  return { type: SET_SEARCH_FLAGS, payload: { documentId, flags } };
}
function setShowAllResults(documentId, showAll) {
  return { type: SET_SHOW_ALL_RESULTS, payload: { documentId, showAll } };
}
function startSearch(documentId, query) {
  return { type: START_SEARCH, payload: { documentId, query } };
}
function setSearchResults(documentId, results, total, activeResultIndex) {
  return { type: SET_SEARCH_RESULTS, payload: { documentId, results, total, activeResultIndex } };
}
function appendSearchResults(documentId, results) {
  return { type: APPEND_SEARCH_RESULTS, payload: { documentId, results } };
}
function setActiveResultIndex(documentId, index) {
  return { type: SET_ACTIVE_RESULT_INDEX, payload: { documentId, index } };
}
const initialSearchDocumentState = {
  flags: [],
  results: [],
  total: 0,
  activeResultIndex: -1,
  showAllResults: true,
  query: "",
  loading: false,
  active: false
};
const initialState = {
  documents: {}
};
const updateDocState = (state, documentId, newDocState) => {
  const oldDocState = state.documents[documentId] || initialSearchDocumentState;
  return {
    ...state,
    documents: {
      ...state.documents,
      [documentId]: {
        ...oldDocState,
        ...newDocState
      }
    }
  };
};
const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_SEARCH_STATE:
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.payload.documentId]: action.payload.state
        }
      };
    case CLEANUP_SEARCH_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remaining } = state.documents;
      return {
        ...state,
        documents: remaining
      };
    }
    case START_SEARCH_SESSION:
      return updateDocState(state, action.payload.documentId, { active: true });
    case STOP_SEARCH_SESSION:
      return updateDocState(state, action.payload.documentId, {
        results: [],
        total: 0,
        activeResultIndex: -1,
        query: "",
        loading: false,
        active: false
      });
    case SET_SEARCH_FLAGS:
      return updateDocState(state, action.payload.documentId, { flags: action.payload.flags });
    case SET_SHOW_ALL_RESULTS:
      return updateDocState(state, action.payload.documentId, {
        showAllResults: action.payload.showAll
      });
    case START_SEARCH:
      return updateDocState(state, action.payload.documentId, {
        loading: true,
        query: action.payload.query,
        // clear old results on new search start
        results: [],
        total: 0,
        activeResultIndex: -1
      });
    case APPEND_SEARCH_RESULTS: {
      const { documentId, results } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const newResults = [...docState.results, ...results];
      const firstHitIndex = docState.activeResultIndex === -1 && newResults.length > 0 ? 0 : docState.activeResultIndex;
      return updateDocState(state, documentId, {
        results: newResults,
        total: newResults.length,
        // total-so-far
        activeResultIndex: firstHitIndex,
        // keep loading true until final SET_SEARCH_RESULTS
        loading: true
      });
    }
    case SET_SEARCH_RESULTS: {
      const { documentId, results, total, activeResultIndex } = action.payload;
      return updateDocState(state, documentId, {
        results,
        total,
        activeResultIndex,
        loading: false
      });
    }
    case SET_ACTIVE_RESULT_INDEX:
      return updateDocState(state, action.payload.documentId, {
        activeResultIndex: action.payload.index
      });
    default:
      return state;
  }
};
const _SearchPlugin = class _SearchPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.searchStop$ = createBehaviorEmitter();
    this.searchStart$ = createBehaviorEmitter();
    this.searchResult$ = createBehaviorEmitter();
    this.searchActiveResultChange$ = createBehaviorEmitter();
    this.searchResultState$ = createBehaviorEmitter();
    this.searchState$ = createBehaviorEmitter();
    this.currentTask = /* @__PURE__ */ new Map();
    this.pluginConfig = config;
  }
  onDocumentLoadingStarted(documentId) {
    const initialState2 = {
      ...initialSearchDocumentState,
      flags: this.pluginConfig.flags || [],
      showAllResults: this.pluginConfig.showAllResults ?? true
    };
    this.dispatch(initSearchState(documentId, initialState2));
  }
  onDocumentClosed(documentId) {
    this.stopSearchSession(documentId);
    this.dispatch(cleanupSearchState(documentId));
    this.currentTask.delete(documentId);
  }
  async initialize() {
  }
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDocState = prevState.documents[documentId];
      const newDocState = newState.documents[documentId];
      if (prevDocState !== newDocState) {
        this.searchState$.emit({ documentId, state: newDocState });
        if (!prevDocState || prevDocState.results !== newDocState.results || prevDocState.activeResultIndex !== newDocState.activeResultIndex || prevDocState.showAllResults !== newDocState.showAllResults || prevDocState.active !== newDocState.active) {
          this.searchResultState$.emit({
            documentId,
            state: {
              results: newDocState.results,
              activeResultIndex: newDocState.activeResultIndex,
              showAllResults: newDocState.showAllResults,
              active: newDocState.active
            }
          });
        }
      }
    }
  }
  buildCapability() {
    const getDocId = (documentId) => documentId ?? this.getActiveDocumentId();
    const getDocState = (docId) => {
      const id = getDocId(docId);
      const state = this.state.documents[id];
      if (!state) throw new Error(`Search state not found for document ${id}`);
      return state;
    };
    return {
      startSearch: (docId) => this.startSearchSession(getDocId(docId)),
      stopSearch: (docId) => this.stopSearchSession(getDocId(docId)),
      searchAllPages: (keyword, docId) => this.searchAllPages(keyword, getDocId(docId)),
      nextResult: (docId) => this.nextResult(getDocId(docId)),
      previousResult: (docId) => this.previousResult(getDocId(docId)),
      goToResult: (index, docId) => this.goToResult(index, getDocId(docId)),
      setShowAllResults: (showAll, docId) => this.dispatch(setShowAllResults(getDocId(docId), showAll)),
      getShowAllResults: (docId) => getDocState(docId).showAllResults,
      getFlags: (docId) => getDocState(docId).flags,
      setFlags: (flags, docId) => this.setFlags(flags, getDocId(docId)),
      getState: (docId) => getDocState(docId),
      forDocument: this.createSearchScope.bind(this),
      onSearchResult: this.searchResult$.on,
      onSearchStart: this.searchStart$.on,
      onSearchStop: this.searchStop$.on,
      onActiveResultChange: this.searchActiveResultChange$.on,
      onSearchResultStateChange: this.searchResultState$.on,
      onStateChange: this.searchState$.on
    };
  }
  createSearchScope(documentId) {
    const getDocState = () => {
      const state = this.state.documents[documentId];
      if (!state) throw new Error(`Search state not found for document ${documentId}`);
      return state;
    };
    return {
      startSearch: () => this.startSearchSession(documentId),
      stopSearch: () => this.stopSearchSession(documentId),
      searchAllPages: (keyword) => this.searchAllPages(keyword, documentId),
      nextResult: () => this.nextResult(documentId),
      previousResult: () => this.previousResult(documentId),
      goToResult: (index) => this.goToResult(index, documentId),
      setShowAllResults: (showAll) => this.dispatch(setShowAllResults(documentId, showAll)),
      getShowAllResults: () => getDocState().showAllResults,
      getFlags: () => getDocState().flags,
      setFlags: (flags) => this.setFlags(flags, documentId),
      getState: getDocState,
      onSearchResult: (listener) => this.searchResult$.on((event) => {
        if (event.documentId === documentId) listener(event.results);
      }),
      onSearchStart: (listener) => this.searchStart$.on((event) => {
        if (event.documentId === documentId) listener();
      }),
      onSearchStop: (listener) => this.searchStop$.on((event) => {
        if (event.documentId === documentId) listener();
      }),
      onActiveResultChange: (listener) => this.searchActiveResultChange$.on((event) => {
        if (event.documentId === documentId) listener(event.index);
      }),
      onSearchResultStateChange: (listener) => this.searchResultState$.on((event) => {
        if (event.documentId === documentId) listener(event.state);
      }),
      onStateChange: (listener) => this.searchState$.on((event) => {
        if (event.documentId === documentId) listener(event.state);
      })
    };
  }
  setFlags(flags, documentId) {
    this.dispatch(setSearchFlags(documentId, flags));
    const docState = this.state.documents[documentId];
    if (docState == null ? void 0 : docState.active) {
      this.searchAllPages(docState.query, documentId, true);
    }
  }
  notifySearchStart(documentId) {
    this.searchStart$.emit({ documentId });
  }
  notifySearchStop(documentId) {
    this.searchStop$.emit({ documentId });
  }
  notifyActiveResultChange(documentId, index) {
    this.searchActiveResultChange$.emit({ documentId, index });
  }
  startSearchSession(documentId) {
    const coreDoc = this.getCoreDocument(documentId);
    if (!coreDoc) return;
    this.dispatch(startSearchSession(documentId));
    this.notifySearchStart(documentId);
  }
  stopSearchSession(documentId) {
    var _a;
    const docState = this.state.documents[documentId];
    if (!(docState == null ? void 0 : docState.active)) return;
    const task = this.currentTask.get(documentId);
    if (task) {
      try {
        (_a = task.abort) == null ? void 0 : _a.call(task, { code: PdfErrorCode.Cancelled, message: "search stopped" });
      } catch {
      }
      this.currentTask.delete(documentId);
    }
    this.dispatch(stopSearchSession(documentId));
    this.notifySearchStop(documentId);
  }
  searchAllPages(keyword, documentId, force = false) {
    var _a;
    const docState = this.state.documents[documentId];
    if (!docState) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "Search state not initialized"
      });
    }
    const coreDoc = this.getCoreDocument(documentId);
    if (!(coreDoc == null ? void 0 : coreDoc.document)) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not loaded" });
    }
    const trimmedKeyword = keyword.trim();
    if (docState.query === trimmedKeyword && !force) {
      return PdfTaskHelper.resolve({
        results: docState.results,
        total: docState.total
      });
    }
    const oldTask = this.currentTask.get(documentId);
    if (oldTask) {
      try {
        (_a = oldTask.abort) == null ? void 0 : _a.call(oldTask, { code: PdfErrorCode.Cancelled, message: "new search" });
      } catch {
      }
      this.currentTask.delete(documentId);
    }
    this.dispatch(startSearch(documentId, trimmedKeyword));
    if (!trimmedKeyword) {
      this.dispatch(setSearchResults(documentId, [], 0, -1));
      return PdfTaskHelper.resolve({
        results: [],
        total: 0
      });
    }
    if (!docState.active) {
      this.startSearchSession(documentId);
    }
    const task = this.engine.searchAllPages(coreDoc.document, trimmedKeyword, {
      flags: docState.flags
    });
    this.currentTask.set(documentId, task);
    task.onProgress((p) => {
      var _a2;
      if ((_a2 = p == null ? void 0 : p.results) == null ? void 0 : _a2.length) {
        if (this.currentTask.get(documentId) === task) {
          this.dispatch(appendSearchResults(documentId, p.results));
          if (this.state.documents[documentId].activeResultIndex === -1) {
            this.dispatch(setActiveResultIndex(documentId, 0));
            this.notifyActiveResultChange(documentId, 0);
          }
        }
      }
    });
    task.wait(
      (results) => {
        this.currentTask.delete(documentId);
        const activeResultIndex = results.total > 0 ? 0 : -1;
        this.dispatch(
          setSearchResults(documentId, results.results, results.total, activeResultIndex)
        );
        this.searchResult$.emit({ documentId, results });
        if (results.total > 0) {
          this.notifyActiveResultChange(documentId, 0);
        }
      },
      (error) => {
        var _a2;
        if (((_a2 = error == null ? void 0 : error.reason) == null ? void 0 : _a2.code) !== PdfErrorCode.Cancelled) {
          console.error("Error during search:", error);
          this.dispatch(setSearchResults(documentId, [], 0, -1));
        }
        this.currentTask.delete(documentId);
      }
    );
    return task;
  }
  nextResult(documentId) {
    const docState = this.state.documents[documentId];
    if (!docState || docState.results.length === 0) return -1;
    const nextIndex = docState.activeResultIndex >= docState.results.length - 1 ? 0 : docState.activeResultIndex + 1;
    return this.goToResult(nextIndex, documentId);
  }
  previousResult(documentId) {
    const docState = this.state.documents[documentId];
    if (!docState || docState.results.length === 0) return -1;
    const prevIndex = docState.activeResultIndex <= 0 ? docState.results.length - 1 : docState.activeResultIndex - 1;
    return this.goToResult(prevIndex, documentId);
  }
  goToResult(index, documentId) {
    const docState = this.state.documents[documentId];
    if (!docState || docState.results.length === 0 || index < 0 || index >= docState.results.length) {
      return -1;
    }
    this.dispatch(setActiveResultIndex(documentId, index));
    this.notifyActiveResultChange(documentId, index);
    return index;
  }
  async destroy() {
    for (const documentId of Object.keys(this.state.documents)) {
      this.stopSearchSession(documentId);
    }
    this.searchResult$.clear();
    this.searchStart$.clear();
    this.searchStop$.clear();
    this.searchActiveResultChange$.clear();
    this.searchResultState$.clear();
    this.searchState$.clear();
    super.destroy();
  }
};
_SearchPlugin.id = "search";
let SearchPlugin = _SearchPlugin;
const SEARCH_PLUGIN_ID = "search";
const manifest = {
  id: SEARCH_PLUGIN_ID,
  name: "Search Plugin",
  version: "1.0.0",
  provides: ["search"],
  requires: [],
  optional: [],
  defaultConfig: {
    flags: []
  }
};
const SearchPluginPackage = {
  manifest,
  create: (registry, config) => new SearchPlugin(SEARCH_PLUGIN_ID, registry, config),
  reducer: searchReducer,
  initialState
};
export {
  SEARCH_PLUGIN_ID,
  SearchPlugin,
  SearchPluginPackage,
  initialSearchDocumentState,
  initialState,
  manifest
};
//# sourceMappingURL=index.js.map
