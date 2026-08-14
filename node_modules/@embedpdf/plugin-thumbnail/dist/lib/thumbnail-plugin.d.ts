import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { ThumbnailPluginConfig, ThumbnailCapability, ThumbnailState } from './types';
import { ThumbnailAction } from './actions';
export declare class ThumbnailPlugin extends BasePlugin<ThumbnailPluginConfig, ThumbnailCapability, ThumbnailState, ThumbnailAction> {
    cfg: ThumbnailPluginConfig;
    static readonly id: "thumbnail";
    private renderCapability;
    private scrollCapability;
    private readonly taskCaches;
    private readonly canAutoScroll;
    private readonly window$;
    private readonly scrollTo$;
    private readonly refreshPages$;
    constructor(id: string, registry: PluginRegistry, cfg: ThumbnailPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected onRotationChanged(documentId: string): void;
    protected buildCapability(): ThumbnailCapability;
    private createThumbnailScope;
    private getDocumentState;
    private calculateWindowState;
    updateWindow(scrollY: number, viewportH: number, documentId?: string): void;
    private getWindow;
    private scrollToThumb;
    private renderThumb;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
}
