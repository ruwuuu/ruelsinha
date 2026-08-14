import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { GetMatrixOptions, RotateCapability, RotatePluginConfig, RotateState } from './types';
import { RotateAction } from './actions';
export declare class RotatePlugin extends BasePlugin<RotatePluginConfig, RotateCapability, RotateState, RotateAction> {
    static readonly id: "rotate";
    private readonly rotate$;
    private readonly defaultRotation;
    constructor(id: string, registry: PluginRegistry, cfg: RotatePluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected buildCapability(): RotateCapability;
    private createRotateScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private setRotationForDocument;
    private getRotationForDocument;
    private rotateForward;
    private rotateBackward;
    getMatrixAsString(options: GetMatrixOptions): string;
    onStoreUpdated(prevState: RotateState, newState: RotateState): void;
    initialize(_config: RotatePluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
