import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { HistoryCapability, HistoryPluginConfig, HistoryState } from './types';
import { HistoryAction } from './actions';
export declare class HistoryPlugin extends BasePlugin<HistoryPluginConfig, HistoryCapability, HistoryState, HistoryAction> {
    static readonly id: "history";
    private readonly documentHistories;
    private readonly historyChange$;
    constructor(id: string, registry: PluginRegistry);
    initialize(_: HistoryPluginConfig): Promise<void>;
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    private getDocumentHistoryData;
    private getDocumentHistoryState;
    private emitHistoryChange;
    private register;
    private undo;
    private redo;
    private canUndo;
    private canRedo;
    /**
     * Purges history entries that match the given predicate based on command metadata.
     * Used to remove commands that are no longer valid (e.g., after a permanent redaction commit).
     *
     * @param predicate A function that returns true for commands that should be purged
     * @param topic If provided, only purges entries for that specific topic
     * @param documentId The document to purge history for
     * @returns The number of entries that were purged
     */
    private purgeByMetadata;
    private createHistoryScope;
    protected buildCapability(): HistoryCapability;
    destroy(): Promise<void>;
}
