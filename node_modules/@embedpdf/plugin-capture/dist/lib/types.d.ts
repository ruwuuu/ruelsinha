import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { ImageConversionTypes, Rect } from '@embedpdf/models';
export interface CapturePluginConfig extends BasePluginConfig {
    scale?: number;
    imageType?: ImageConversionTypes;
    withAnnotations?: boolean;
}
export interface CaptureAreaEvent {
    documentId: string;
    pageIndex: number;
    rect: Rect;
    blob: Blob;
    imageType: ImageConversionTypes;
    scale: number;
    withAnnotations: boolean;
}
export interface StateChangeEvent {
    documentId: string;
    state: CaptureDocumentState;
}
export interface MarqueeCaptureCallback {
    onPreview?: (rect: Rect | null) => void;
    onCommit?: (rect: Rect) => void;
}
export interface RegisterMarqueeOnPageOptions {
    documentId: string;
    pageIndex: number;
    scale: number;
    callback: MarqueeCaptureCallback;
}
export interface CaptureDocumentState {
    isMarqueeCaptureActive: boolean;
}
export interface CaptureScope {
    captureArea(pageIndex: number, rect: Rect): void;
    enableMarqueeCapture(): void;
    disableMarqueeCapture(): void;
    toggleMarqueeCapture(): void;
    isMarqueeCaptureActive(): boolean;
    getState(): CaptureDocumentState;
    onCaptureArea: EventHook<CaptureAreaEvent>;
    onStateChange: EventHook<CaptureDocumentState>;
}
export interface CaptureCapability {
    captureArea(pageIndex: number, rect: Rect): void;
    enableMarqueeCapture: () => void;
    disableMarqueeCapture: () => void;
    toggleMarqueeCapture: () => void;
    isMarqueeCaptureActive: () => boolean;
    getState(): CaptureDocumentState;
    forDocument(documentId: string): CaptureScope;
    registerMarqueeOnPage: (opts: RegisterMarqueeOnPageOptions) => () => void;
    onCaptureArea: EventHook<CaptureAreaEvent>;
    onStateChange: EventHook<StateChangeEvent>;
}
export interface CaptureState {
    documents: Record<string, CaptureDocumentState>;
    activeDocumentId: string | null;
}
