import { BasePlugin, createEmitter } from "@embedpdf/core";
const HISTORY_PLUGIN_ID = "history";
const manifest = {
  id: HISTORY_PLUGIN_ID,
  name: "History Plugin",
  version: "1.0.0",
  provides: ["history"],
  requires: [],
  optional: [],
  defaultConfig: {}
};
const INIT_HISTORY_STATE = "HISTORY/INIT_STATE";
const CLEANUP_HISTORY_STATE = "HISTORY/CLEANUP_STATE";
const SET_HISTORY_DOCUMENT_STATE = "HISTORY/SET_DOCUMENT_STATE";
const SET_ACTIVE_HISTORY_DOCUMENT = "HISTORY/SET_ACTIVE_DOCUMENT";
const initHistoryState = (documentId) => ({
  type: INIT_HISTORY_STATE,
  payload: { documentId }
});
const cleanupHistoryState = (documentId) => ({
  type: CLEANUP_HISTORY_STATE,
  payload: { documentId }
});
const setHistoryDocumentState = (documentId, state) => ({
  type: SET_HISTORY_DOCUMENT_STATE,
  payload: { documentId, state }
});
const _HistoryPlugin = class _HistoryPlugin extends BasePlugin {
  constructor(id, registry) {
    super(id, registry);
    this.documentHistories = /* @__PURE__ */ new Map();
    this.historyChange$ = createEmitter();
  }
  async initialize(_) {
    this.logger.info("HistoryPlugin", "Initialize", "History plugin initialized");
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initHistoryState(documentId));
    this.documentHistories.set(documentId, {
      topicHistories: /* @__PURE__ */ new Map(),
      globalTimeline: [],
      globalIndex: -1
    });
    this.logger.debug(
      "HistoryPlugin",
      "DocumentOpened",
      `Initialized history state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupHistoryState(documentId));
    this.documentHistories.delete(documentId);
    this.logger.debug(
      "HistoryPlugin",
      "DocumentClosed",
      `Cleaned up history state for document: ${documentId}`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────
  getDocumentHistoryData(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const data = this.documentHistories.get(id);
    if (!data) {
      throw new Error(`History data not found for document: ${id}`);
    }
    return data;
  }
  getDocumentHistoryState(documentId) {
    const data = this.documentHistories.get(documentId);
    if (!data) {
      throw new Error(`History data not found for document: ${documentId}`);
    }
    const topics = {};
    Array.from(data.topicHistories.entries()).forEach(([topic, history]) => {
      topics[topic] = {
        canUndo: history.currentIndex > -1,
        canRedo: history.currentIndex < history.commands.length - 1
      };
    });
    return {
      global: {
        canUndo: data.globalIndex > -1,
        canRedo: data.globalIndex < data.globalTimeline.length - 1
      },
      topics
    };
  }
  emitHistoryChange(documentId, topic) {
    const state = this.getDocumentHistoryState(documentId);
    this.dispatch(setHistoryDocumentState(documentId, state));
    this.historyChange$.emit({
      documentId,
      topic,
      state
    });
  }
  // ─────────────────────────────────────────────────────────
  // History Operations (per document)
  // ─────────────────────────────────────────────────────────
  register(command, topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    if (!data.topicHistories.has(topic)) {
      data.topicHistories.set(topic, { commands: [], currentIndex: -1 });
    }
    const topicHistory = data.topicHistories.get(topic);
    topicHistory.commands.splice(topicHistory.currentIndex + 1);
    topicHistory.commands.push(command);
    topicHistory.currentIndex++;
    const historyEntry = { command, topic };
    data.globalTimeline.splice(data.globalIndex + 1);
    data.globalTimeline.push(historyEntry);
    data.globalIndex++;
    command.execute();
    this.emitHistoryChange(documentId, topic);
  }
  undo(topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    let affectedTopic;
    if (topic) {
      const topicHistory = data.topicHistories.get(topic);
      if (topicHistory && topicHistory.currentIndex > -1) {
        topicHistory.commands[topicHistory.currentIndex].undo();
        topicHistory.currentIndex--;
        affectedTopic = topic;
      }
    } else {
      if (data.globalIndex > -1) {
        const entry = data.globalTimeline[data.globalIndex];
        entry.command.undo();
        data.topicHistories.get(entry.topic).currentIndex--;
        data.globalIndex--;
        affectedTopic = entry.topic;
      }
    }
    if (affectedTopic) {
      this.emitHistoryChange(documentId, affectedTopic);
    }
  }
  redo(topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    let affectedTopic;
    if (topic) {
      const topicHistory = data.topicHistories.get(topic);
      if (topicHistory && topicHistory.currentIndex < topicHistory.commands.length - 1) {
        topicHistory.currentIndex++;
        topicHistory.commands[topicHistory.currentIndex].execute();
        affectedTopic = topic;
      }
    } else {
      if (data.globalIndex < data.globalTimeline.length - 1) {
        data.globalIndex++;
        const entry = data.globalTimeline[data.globalIndex];
        entry.command.execute();
        data.topicHistories.get(entry.topic).currentIndex++;
        affectedTopic = entry.topic;
      }
    }
    if (affectedTopic) {
      this.emitHistoryChange(documentId, affectedTopic);
    }
  }
  canUndo(topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    if (topic) {
      const history = data.topicHistories.get(topic);
      return !!history && history.currentIndex > -1;
    }
    return data.globalIndex > -1;
  }
  canRedo(topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    if (topic) {
      const history = data.topicHistories.get(topic);
      return !!history && history.currentIndex < history.commands.length - 1;
    }
    return data.globalIndex < data.globalTimeline.length - 1;
  }
  /**
   * Purges history entries that match the given predicate based on command metadata.
   * Used to remove commands that are no longer valid (e.g., after a permanent redaction commit).
   *
   * @param predicate A function that returns true for commands that should be purged
   * @param topic If provided, only purges entries for that specific topic
   * @param documentId The document to purge history for
   * @returns The number of entries that were purged
   */
  purgeByMetadata(predicate, topic, documentId) {
    const data = this.getDocumentHistoryData(documentId);
    let purgedCount = 0;
    const shouldPurge = (command) => {
      return predicate(command.metadata);
    };
    const topicsToProcess = topic ? [topic] : Array.from(data.topicHistories.keys());
    for (const topicName of topicsToProcess) {
      const topicHistory = data.topicHistories.get(topicName);
      if (!topicHistory) continue;
      const newCommands = [];
      let indexAdjustment = 0;
      for (let i = 0; i < topicHistory.commands.length; i++) {
        const command = topicHistory.commands[i];
        if (shouldPurge(command)) {
          if (i <= topicHistory.currentIndex) {
            indexAdjustment++;
          }
          purgedCount++;
        } else {
          newCommands.push(command);
        }
      }
      topicHistory.commands = newCommands;
      topicHistory.currentIndex = Math.max(-1, topicHistory.currentIndex - indexAdjustment);
    }
    const newTimeline = [];
    let globalIndexAdjustment = 0;
    for (let i = 0; i < data.globalTimeline.length; i++) {
      const entry = data.globalTimeline[i];
      const matchesTopic = !topic || entry.topic === topic;
      if (matchesTopic && shouldPurge(entry.command)) {
        if (i <= data.globalIndex) {
          globalIndexAdjustment++;
        }
      } else {
        newTimeline.push(entry);
      }
    }
    data.globalTimeline = newTimeline;
    data.globalIndex = Math.max(-1, data.globalIndex - globalIndexAdjustment);
    if (purgedCount > 0) {
      this.emitHistoryChange(documentId, topic);
      this.logger.debug(
        "HistoryPlugin",
        "PurgeByMetadata",
        `Purged ${purgedCount} history entries for document: ${documentId}${topic ? `, topic: ${topic}` : ""}`
      );
    }
    return purgedCount;
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createHistoryScope(documentId) {
    return {
      register: (command, topic) => this.register(command, topic, documentId),
      undo: (topic) => this.undo(topic, documentId),
      redo: (topic) => this.redo(topic, documentId),
      canUndo: (topic) => this.canUndo(topic, documentId),
      canRedo: (topic) => this.canRedo(topic, documentId),
      getHistoryState: () => this.getDocumentHistoryState(documentId),
      onHistoryChange: (listener) => this.historyChange$.on((event) => {
        if (event.documentId === documentId) {
          listener(event.topic);
        }
      }),
      purgeByMetadata: (predicate, topic) => this.purgeByMetadata(predicate, topic, documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      register: (command, topic) => {
        const documentId = this.getActiveDocumentId();
        this.register(command, topic, documentId);
      },
      undo: (topic) => {
        const documentId = this.getActiveDocumentId();
        this.undo(topic, documentId);
      },
      redo: (topic) => {
        const documentId = this.getActiveDocumentId();
        this.redo(topic, documentId);
      },
      canUndo: (topic) => {
        const documentId = this.getActiveDocumentId();
        return this.canUndo(topic, documentId);
      },
      canRedo: (topic) => {
        const documentId = this.getActiveDocumentId();
        return this.canRedo(topic, documentId);
      },
      getHistoryState: () => {
        const documentId = this.getActiveDocumentId();
        return this.getDocumentHistoryState(documentId);
      },
      // Document-scoped operations
      forDocument: (documentId) => this.createHistoryScope(documentId),
      // Events
      onHistoryChange: this.historyChange$.on,
      // Purge operations
      purgeByMetadata: (predicate, topic) => {
        const documentId = this.getActiveDocumentId();
        return this.purgeByMetadata(predicate, topic, documentId);
      }
    };
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async destroy() {
    this.historyChange$.clear();
    this.documentHistories.clear();
    super.destroy();
  }
};
_HistoryPlugin.id = "history";
let HistoryPlugin = _HistoryPlugin;
const initialDocumentState = {
  global: {
    canUndo: false,
    canRedo: false
  },
  topics: {}
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_HISTORY_STATE: {
      const { documentId } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...initialDocumentState }
        }
      };
    }
    case CLEANUP_HISTORY_STATE: {
      const { documentId } = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_HISTORY_DOCUMENT_STATE: {
      const { documentId, state: docState } = action.payload;
      if (!state.documents[documentId]) {
        return state;
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        }
      };
    }
    case SET_ACTIVE_HISTORY_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    default:
      return state;
  }
};
const HistoryPluginPackage = {
  manifest,
  create: (registry) => new HistoryPlugin(HISTORY_PLUGIN_ID, registry),
  reducer,
  initialState
};
export {
  HISTORY_PLUGIN_ID,
  HistoryPlugin,
  HistoryPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
