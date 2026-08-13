import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { CommandsCapability, CommandsPluginConfig, CommandsState } from './types';
import { CommandsAction } from './actions';
export declare class CommandsPlugin extends BasePlugin<CommandsPluginConfig, CommandsCapability, CommandsState, CommandsAction> {
    static readonly id: "commands";
    private commands;
    private i18n;
    private shortcutMap;
    private readonly commandExecuted$;
    private readonly commandStateChanged$;
    private readonly shortcutExecuted$;
    private readonly categoryChanged$;
    private previousStates;
    constructor(id: string, registry: PluginRegistry, config: CommandsPluginConfig);
    protected onDocumentClosed(documentId: string): void;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    private disableCategoryImpl;
    private enableCategoryImpl;
    private toggleCategoryImpl;
    private setDisabledCategoriesImpl;
    /**
     * Check if command has any disabled category
     */
    private isCommandCategoryDisabled;
    protected buildCapability(): CommandsCapability;
    private createCommandScope;
    private resolve;
    private resolveLabel;
    private resolveDynamic;
    private execute;
    private registerCommand;
    private unregisterCommand;
    private getCommandByShortcut;
    private normalizeShortcut;
    private getAllCommands;
    private getCommandsByCategory;
    private onGlobalStoreChange;
    private detectCommandChanges;
}
