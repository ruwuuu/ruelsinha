import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { SpreadCapability, SpreadPluginConfig, SpreadState } from './types';
import { SpreadAction } from './actions';
export declare class SpreadPlugin extends BasePlugin<SpreadPluginConfig, SpreadCapability, SpreadState, SpreadAction> {
    static readonly id: "spread";
    private readonly spreadEmitter$;
    private readonly defaultSpreadMode;
    private readonly viewport;
    constructor(id: string, registry: PluginRegistry, cfg: SpreadPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected buildCapability(): SpreadCapability;
    private createSpreadScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private setSpreadModeForDocument;
    private getSpreadModeForDocument;
    /**
     * Calculate page grouping indices based on spread mode
     * Returns indices, not actual page objects
     */
    private calculatePageGrouping;
    /**
     * Get the actual page objects grouped according to spread mode
     * This is computed on-demand, not stored
     */
    private getSpreadPages;
    onStoreUpdated(prevState: SpreadState, newState: SpreadState): void;
    initialize(_config: SpreadPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
