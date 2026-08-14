import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { Rotation } from '@embedpdf/models';
export interface RotatePluginConfig extends BasePluginConfig {
    defaultRotation?: Rotation;
}
export interface GetMatrixOptions {
    width: number;
    height: number;
    rotation: Rotation;
}
export interface RotateDocumentState {
    rotation: Rotation;
}
export interface RotateState {
    documents: Record<string, RotateDocumentState>;
    activeDocumentId: string | null;
}
export interface RotationChangeEvent {
    documentId: string;
    rotation: Rotation;
}
export interface RotateScope {
    setRotation(rotation: Rotation): void;
    getRotation(): Rotation;
    rotateForward(): void;
    rotateBackward(): void;
    onRotateChange: EventHook<Rotation>;
}
export interface RotateCapability {
    setRotation(rotation: Rotation): void;
    getRotation(): Rotation;
    rotateForward(): void;
    rotateBackward(): void;
    forDocument(documentId: string): RotateScope;
    onRotateChange: EventHook<RotationChangeEvent>;
}
