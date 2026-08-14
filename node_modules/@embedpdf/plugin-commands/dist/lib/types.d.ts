import { BasePluginConfig, CoreState, EventHook, PluginRegistry } from '@embedpdf/core';
import { Logger } from '@embedpdf/models';
import { TranslationKey } from '@embedpdf/plugin-i18n';
export type Dynamic<TStore, T> = T | ((context: {
    registry: PluginRegistry;
    state: TStore;
    documentId: string;
    logger: Logger;
}) => T);
export interface IconProps {
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
    title?: string;
}
export interface Command<TStore = any> {
    id: string;
    label?: string;
    labelKey?: Dynamic<TStore, TranslationKey>;
    labelParams?: Dynamic<TStore, Record<string, string | number>>;
    icon?: Dynamic<TStore, string>;
    iconProps?: Dynamic<TStore, IconProps>;
    action: (context: {
        registry: PluginRegistry;
        state: TStore;
        documentId: string;
        logger: Logger;
    }) => void;
    active?: Dynamic<TStore, boolean>;
    disabled?: Dynamic<TStore, boolean>;
    visible?: Dynamic<TStore, boolean>;
    shortcuts?: string | string[];
    shortcutLabel?: string;
    categories?: string[];
    description?: string;
}
export interface ResolvedCommand {
    id: string;
    label: string;
    icon?: string;
    iconProps?: IconProps;
    active: boolean;
    disabled: boolean;
    visible: boolean;
    shortcuts?: string[];
    shortcutLabel?: string;
    categories?: string[];
    description?: string;
    execute: () => void;
}
export interface GlobalStoreState<TPlugins extends Record<string, any> = {}> {
    core: CoreState;
    plugins: TPlugins;
}
export interface CommandsPluginConfig extends BasePluginConfig {
    commands: Record<string, Command>;
    /** Categories to disable at initialization */
    disabledCategories?: string[];
}
export interface CommandsState {
    /** Globally disabled command categories */
    disabledCategories: string[];
}
export interface CommandExecutedEvent {
    commandId: string;
    documentId: string;
    source: 'keyboard' | 'ui' | 'api';
}
export interface CommandStateChangedEvent {
    commandId: string;
    documentId: string;
    changes: {
        active?: boolean;
        disabled?: boolean;
        visible?: boolean;
        label?: string;
        icon?: string;
        iconProps?: IconProps;
    };
}
export interface ShortcutExecutedEvent {
    shortcut: string;
    commandId: string;
    documentId: string;
}
export interface CategoryChangedEvent {
    disabledCategories: string[];
}
export interface CommandScope {
    resolve(commandId: string): ResolvedCommand;
    execute(commandId: string, source?: 'keyboard' | 'ui' | 'api'): void;
    getAllCommands(): ResolvedCommand[];
    getCommandsByCategory(category: string): ResolvedCommand[];
    onCommandStateChanged: EventHook<Omit<CommandStateChangedEvent, 'documentId'>>;
}
export interface CommandsCapability {
    resolve(commandId: string, documentId?: string): ResolvedCommand;
    execute(commandId: string, documentId?: string, source?: 'keyboard' | 'ui' | 'api'): void;
    getAllCommands(documentId?: string): ResolvedCommand[];
    getCommandsByCategory(category: string, documentId?: string): ResolvedCommand[];
    getCommandByShortcut(shortcut: string): Command | null;
    getAllShortcuts(): Map<string, string>;
    forDocument(documentId: string): CommandScope;
    registerCommand(command: Command): void;
    unregisterCommand(commandId: string): void;
    disableCategory(category: string): void;
    enableCategory(category: string): void;
    toggleCategory(category: string): void;
    setDisabledCategories(categories: string[]): void;
    getDisabledCategories(): string[];
    isCategoryDisabled(category: string): boolean;
    onCommandExecuted: EventHook<CommandExecutedEvent>;
    onCommandStateChanged: EventHook<CommandStateChangedEvent>;
    onShortcutExecuted: EventHook<ShortcutExecutedEvent>;
    onCategoryChanged: EventHook<CategoryChangedEvent>;
}
