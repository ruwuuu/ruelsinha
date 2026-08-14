import { BasePlugin, PluginRegistry, RefreshPagesAction } from '@embedpdf/core';
import { TilingPluginConfig, TilingCapability, TilingState } from './types';
export declare class TilingPlugin extends BasePlugin<TilingPluginConfig, TilingCapability, TilingState> {
    static readonly id: "tiling";
    private readonly tileRendering$;
    private config;
    private renderCapability;
    private scrollCapability;
    private viewportCapability;
    constructor(id: string, registry: PluginRegistry, config: TilingPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected onScaleChanged(documentId: string): void;
    protected onRotationChanged(documentId: string): void;
    private recalculateTilesForDocument;
    recalculateTiles(payload: RefreshPagesAction['payload']): Promise<void>;
    initialize(): Promise<void>;
    private calculateVisibleTiles;
    onStoreUpdated(prevState: TilingState, newState: TilingState): void;
    protected buildCapability(): TilingCapability;
    private createTilingScope;
    private renderTile;
}
