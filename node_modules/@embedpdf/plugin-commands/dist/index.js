import { BasePlugin, createEmitter, createBehaviorEmitter, arePropsEqual } from "@embedpdf/core";
const COMMANDS_PLUGIN_ID = "commands";
const manifest = {
  id: COMMANDS_PLUGIN_ID,
  name: "Commands Plugin",
  version: "1.0.0",
  provides: ["commands"],
  requires: [],
  optional: ["i18n", "ui"],
  defaultConfig: {
    commands: {}
  }
};
const SET_DISABLED_CATEGORIES = "COMMANDS/SET_DISABLED_CATEGORIES";
const setDisabledCategories = (categories) => ({
  type: SET_DISABLED_CATEGORIES,
  payload: categories
});
const _CommandsPlugin = class _CommandsPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a;
    super(id, registry);
    this.commands = /* @__PURE__ */ new Map();
    this.i18n = null;
    this.shortcutMap = /* @__PURE__ */ new Map();
    this.commandExecuted$ = createEmitter();
    this.commandStateChanged$ = createEmitter();
    this.shortcutExecuted$ = createEmitter();
    this.categoryChanged$ = createBehaviorEmitter();
    this.previousStates = /* @__PURE__ */ new Map();
    const i18nPlugin = registry.getPlugin("i18n");
    this.i18n = (i18nPlugin == null ? void 0 : i18nPlugin.provides()) ?? null;
    if ((_a = config.disabledCategories) == null ? void 0 : _a.length) {
      this.dispatch(setDisabledCategories(config.disabledCategories));
    }
    Object.values(config.commands).forEach((command) => {
      this.registerCommand(command);
    });
    this.registry.getStore().subscribe((_action, newState) => {
      this.onGlobalStoreChange(newState);
    });
  }
  onDocumentClosed(documentId) {
    this.previousStates.delete(documentId);
    this.logger.debug(
      "CommandsPlugin",
      "DocumentClosed",
      `Cleaned up command state cache for document: ${documentId}`
    );
  }
  async initialize() {
    this.logger.info("CommandsPlugin", "Initialize", "Commands plugin initialized");
  }
  async destroy() {
    this.commandExecuted$.clear();
    this.commandStateChanged$.clear();
    this.shortcutExecuted$.clear();
    this.categoryChanged$.clear();
    this.commands.clear();
    this.shortcutMap.clear();
    this.previousStates.clear();
    super.destroy();
  }
  // ─────────────────────────────────────────────────────────
  // Category Management
  // ─────────────────────────────────────────────────────────
  disableCategoryImpl(category) {
    const current = new Set(this.state.disabledCategories);
    if (!current.has(category)) {
      current.add(category);
      this.dispatch(setDisabledCategories(Array.from(current)));
      this.categoryChanged$.emit({ disabledCategories: Array.from(current) });
    }
  }
  enableCategoryImpl(category) {
    const current = new Set(this.state.disabledCategories);
    if (current.has(category)) {
      current.delete(category);
      this.dispatch(setDisabledCategories(Array.from(current)));
      this.categoryChanged$.emit({ disabledCategories: Array.from(current) });
    }
  }
  toggleCategoryImpl(category) {
    if (this.state.disabledCategories.includes(category)) {
      this.enableCategoryImpl(category);
    } else {
      this.disableCategoryImpl(category);
    }
  }
  setDisabledCategoriesImpl(categories) {
    this.dispatch(setDisabledCategories(categories));
    this.categoryChanged$.emit({ disabledCategories: categories });
  }
  /**
   * Check if command has any disabled category
   */
  isCommandCategoryDisabled(command) {
    var _a;
    if (!((_a = command.categories) == null ? void 0 : _a.length)) return false;
    return command.categories.some((cat) => this.state.disabledCategories.includes(cat));
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      resolve: (commandId, documentId) => this.resolve(commandId, documentId),
      execute: (commandId, documentId, source = "ui") => this.execute(commandId, documentId, source),
      getAllCommands: (documentId) => this.getAllCommands(documentId),
      getCommandsByCategory: (category, documentId) => this.getCommandsByCategory(category, documentId),
      getCommandByShortcut: (shortcut) => this.getCommandByShortcut(shortcut),
      getAllShortcuts: () => new Map(this.shortcutMap),
      forDocument: (documentId) => this.createCommandScope(documentId),
      registerCommand: (command) => this.registerCommand(command),
      unregisterCommand: (commandId) => this.unregisterCommand(commandId),
      // Category management
      disableCategory: (category) => this.disableCategoryImpl(category),
      enableCategory: (category) => this.enableCategoryImpl(category),
      toggleCategory: (category) => this.toggleCategoryImpl(category),
      setDisabledCategories: (categories) => this.setDisabledCategoriesImpl(categories),
      getDisabledCategories: () => this.state.disabledCategories,
      isCategoryDisabled: (category) => this.state.disabledCategories.includes(category),
      // Events
      onCommandExecuted: this.commandExecuted$.on,
      onCommandStateChanged: this.commandStateChanged$.on,
      onShortcutExecuted: this.shortcutExecuted$.on,
      onCategoryChanged: this.categoryChanged$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createCommandScope(documentId) {
    return {
      resolve: (commandId) => this.resolve(commandId, documentId),
      execute: (commandId, source = "ui") => this.execute(commandId, documentId, source),
      getAllCommands: () => this.getAllCommands(documentId),
      getCommandsByCategory: (category) => this.getCommandsByCategory(category, documentId),
      onCommandStateChanged: (listener) => this.commandStateChanged$.on((event) => {
        if (event.documentId === documentId) {
          const { documentId: _, ...rest } = event;
          listener(rest);
        }
      })
    };
  }
  // ─────────────────────────────────────────────────────────
  // Command Resolution
  // ─────────────────────────────────────────────────────────
  resolve(commandId, documentId) {
    const resolvedDocId = documentId ?? this.getActiveDocumentId();
    const command = this.commands.get(commandId);
    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }
    const state = this.registry.getStore().getState();
    const label = this.resolveLabel(command, state, resolvedDocId);
    const shortcuts = command.shortcuts ? Array.isArray(command.shortcuts) ? command.shortcuts : [command.shortcuts] : void 0;
    const explicitDisabled = this.resolveDynamic(command.disabled, state, resolvedDocId) ?? false;
    const categoryDisabled = this.isCommandCategoryDisabled(command);
    const isDisabled = explicitDisabled || categoryDisabled;
    return {
      id: command.id,
      label,
      icon: this.resolveDynamic(command.icon, state, resolvedDocId),
      iconProps: this.resolveDynamic(command.iconProps, state, resolvedDocId),
      active: this.resolveDynamic(command.active, state, resolvedDocId) ?? false,
      disabled: isDisabled,
      visible: this.resolveDynamic(command.visible, state, resolvedDocId) ?? true,
      shortcuts,
      shortcutLabel: command.shortcutLabel,
      categories: command.categories,
      description: command.description,
      execute: () => command.action({
        registry: this.registry,
        state,
        documentId: resolvedDocId,
        logger: this.logger
      })
    };
  }
  resolveLabel(command, state, documentId) {
    const labelKey = this.resolveDynamic(command.labelKey, state, documentId);
    if (labelKey && this.i18n) {
      const params = this.resolveDynamic(command.labelParams, state, documentId);
      return this.i18n.t(labelKey, { params, documentId });
    }
    if (command.label) {
      return command.label;
    }
    return command.id;
  }
  resolveDynamic(value, state, documentId) {
    if (value === void 0) return void 0;
    if (typeof value === "function") {
      return value({
        registry: this.registry,
        state,
        documentId,
        logger: this.logger
      });
    }
    return value;
  }
  // ─────────────────────────────────────────────────────────
  // Command Execution
  // ─────────────────────────────────────────────────────────
  execute(commandId, documentId, source = "ui") {
    const resolvedDocId = documentId ?? this.getActiveDocumentId();
    const resolved = this.resolve(commandId, resolvedDocId);
    if (resolved.disabled) {
      this.logger.warn(
        "CommandsPlugin",
        "ExecutionBlocked",
        `Command '${commandId}' is disabled for document '${resolvedDocId}'`
      );
      return;
    }
    if (!resolved.visible) {
      this.logger.warn(
        "CommandsPlugin",
        "ExecutionBlocked",
        `Command '${commandId}' is not visible for document '${resolvedDocId}'`
      );
      return;
    }
    resolved.execute();
    this.commandExecuted$.emit({
      commandId,
      documentId: resolvedDocId,
      source
    });
    this.logger.debug(
      "CommandsPlugin",
      "CommandExecuted",
      `Command '${commandId}' executed for document '${resolvedDocId}' (source: ${source})`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Command Registration
  // ─────────────────────────────────────────────────────────
  registerCommand(command) {
    if (this.commands.has(command.id)) {
      this.logger.warn(
        "CommandsPlugin",
        "CommandOverwrite",
        `Command '${command.id}' already exists and will be overwritten`
      );
    }
    this.commands.set(command.id, command);
    if (command.shortcuts) {
      const shortcuts = Array.isArray(command.shortcuts) ? command.shortcuts : [command.shortcuts];
      shortcuts.forEach((shortcut) => {
        const normalized = this.normalizeShortcut(shortcut);
        this.shortcutMap.set(normalized, command.id);
      });
    }
    this.logger.debug("CommandsPlugin", "CommandRegistered", `Command '${command.id}' registered`);
  }
  unregisterCommand(commandId) {
    const command = this.commands.get(commandId);
    if (!command) return;
    if (command.shortcuts) {
      const shortcuts = Array.isArray(command.shortcuts) ? command.shortcuts : [command.shortcuts];
      shortcuts.forEach((shortcut) => {
        const normalized = this.normalizeShortcut(shortcut);
        this.shortcutMap.delete(normalized);
      });
    }
    this.commands.delete(commandId);
    this.logger.debug(
      "CommandsPlugin",
      "CommandUnregistered",
      `Command '${commandId}' unregistered`
    );
  }
  // ─────────────────────────────────────────────────────────
  // Shortcuts
  // ─────────────────────────────────────────────────────────
  getCommandByShortcut(shortcut) {
    const normalized = this.normalizeShortcut(shortcut);
    const commandId = this.shortcutMap.get(normalized);
    return commandId ? this.commands.get(commandId) ?? null : null;
  }
  normalizeShortcut(shortcut) {
    return shortcut.toLowerCase().split("+").sort().join("+");
  }
  // ─────────────────────────────────────────────────────────
  // Query Methods
  // ─────────────────────────────────────────────────────────
  getAllCommands(documentId) {
    const resolvedDocId = documentId ?? this.getActiveDocumentId();
    return Array.from(this.commands.keys()).map((id) => this.resolve(id, resolvedDocId));
  }
  getCommandsByCategory(category, documentId) {
    const resolvedDocId = documentId ?? this.getActiveDocumentId();
    return Array.from(this.commands.values()).filter((cmd) => {
      var _a;
      return (_a = cmd.categories) == null ? void 0 : _a.includes(category);
    }).map((cmd) => this.resolve(cmd.id, resolvedDocId));
  }
  // ─────────────────────────────────────────────────────────
  // State Change Detection
  // ─────────────────────────────────────────────────────────
  onGlobalStoreChange(newState) {
    const documentIds = Object.keys(newState.core.documents);
    documentIds.forEach((documentId) => {
      this.detectCommandChanges(documentId, newState);
    });
  }
  detectCommandChanges(documentId, newState) {
    const coreDoc = newState.core.documents[documentId];
    if (!coreDoc || coreDoc.status !== "loaded") return;
    const previousCache = this.previousStates.get(documentId) ?? /* @__PURE__ */ new Map();
    this.commands.forEach((command, commandId) => {
      const newResolved = this.resolve(commandId, documentId);
      const prevResolved = previousCache.get(commandId);
      if (!prevResolved) {
        previousCache.set(commandId, newResolved);
        return;
      }
      const changes = {};
      if (prevResolved.active !== newResolved.active) {
        changes.active = newResolved.active;
      }
      if (prevResolved.disabled !== newResolved.disabled) {
        changes.disabled = newResolved.disabled;
      }
      if (prevResolved.visible !== newResolved.visible) {
        changes.visible = newResolved.visible;
      }
      if (prevResolved.label !== newResolved.label) {
        changes.label = newResolved.label;
      }
      if (prevResolved.icon !== newResolved.icon) {
        changes.icon = newResolved.icon;
      }
      if (!arePropsEqual(prevResolved.iconProps, newResolved.iconProps)) {
        changes.iconProps = newResolved.iconProps;
      }
      if (Object.keys(changes).length > 0) {
        previousCache.set(commandId, newResolved);
        this.commandStateChanged$.emit({
          commandId,
          documentId,
          changes
        });
      }
    });
    this.previousStates.set(documentId, previousCache);
  }
};
_CommandsPlugin.id = "commands";
let CommandsPlugin = _CommandsPlugin;
const initialState = {
  disabledCategories: []
};
const commandsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DISABLED_CATEGORIES:
      return {
        ...state,
        disabledCategories: action.payload
      };
    default:
      return state;
  }
};
const CommandsPluginPackage = {
  manifest,
  create: (registry, config) => new CommandsPlugin(COMMANDS_PLUGIN_ID, registry, config),
  reducer: commandsReducer,
  initialState
};
export {
  COMMANDS_PLUGIN_ID,
  CommandsPlugin,
  CommandsPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
