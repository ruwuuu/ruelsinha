import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { CaptureCapability, CapturePluginConfig, RegisterMarqueeOnPageOptions, CaptureState } from './types';
import { CaptureAction } from './actions';
export declare class CapturePlugin extends BasePlugin<CapturePluginConfig, CaptureCapability, CaptureState, CaptureAction> {
    static readonly id: "capture";
    private captureArea$;
    private state$;
    private renderCapability;
    private interactionManagerCapability;
    private config;
    constructor(id: string, registry: PluginRegistry, config: CapturePluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    initialize(_: CapturePluginConfig): Promise<void>;
    protected buildCapability(): CaptureCapability;
    private createCaptureScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    registerMarqueeOnPage(opts: RegisterMarqueeOnPageOptions): () => void;
    private captureArea;
    private enableMarqueeCapture;
    private disableMarqueeCapture;
    private toggleMarqueeCapture;
    private isMarqueeCaptureActive;
    onStoreUpdated(prevState: CaptureState, newState: CaptureState): void;
    destroy(): Promise<void>;
}
