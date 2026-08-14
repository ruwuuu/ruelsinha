import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { PanCapability, PanPluginConfig, PanState } from './types';
import { PanAction } from './actions';
export declare class PanPlugin extends BasePlugin<PanPluginConfig, PanCapability, PanState, PanAction> {
    static readonly id: "pan";
    private readonly panMode$;
    private interactionManager;
    private viewport;
    config: PanPluginConfig;
    private documentHandlers;
    constructor(id: string, registry: PluginRegistry, config: PanPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected buildCapability(): PanCapability;
    private createPanScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private enablePan;
    private disablePan;
    private togglePan;
    private makePanDefault;
    private isPanMode;
    private registerPanHandlersForDocument;
    onStoreUpdated(prevState: PanState, newState: PanState): void;
    initialize(_: PanPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
