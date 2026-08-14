import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { Rect } from '@embedpdf/models';
import { ViewportMetrics } from '@embedpdf/plugin-viewport';
export declare enum ZoomMode {
    Automatic = "automatic",
    FitPage = "fit-page",
    FitWidth = "fit-width"
}
export type ZoomLevel = ZoomMode | number;
export interface Point {
    vx: number;
    vy: number;
}
export interface ZoomChangeEvent {
    documentId: string;
    /** old and new *actual* scale factors */
    oldZoom: number;
    newZoom: number;
    /** level used to obtain the newZoom (number | mode) */
    level: ZoomLevel;
    /** viewport point kept under the finger / mouse‑wheel focus */
    center: Point;
    /** where the viewport should scroll to after the scale change */
    desiredScrollLeft: number;
    desiredScrollTop: number;
    /** metrics at the moment the zoom was requested */
    viewport: ViewportMetrics;
}
export interface StateChangeEvent {
    documentId: string;
    state: ZoomDocumentState;
}
export interface MarqueeZoomCallback {
    onPreview?: (rect: Rect | null) => void;
    onCommit?: (rect: Rect) => void;
    onSmallDrag?: () => void;
}
export interface RegisterMarqueeOnPageOptions {
    documentId: string;
    pageIndex: number;
    scale: number;
    callback: MarqueeZoomCallback;
}
export interface ZoomDocumentState {
    zoomLevel: ZoomLevel;
    currentZoomLevel: number;
    isMarqueeZoomActive: boolean;
}
export interface ZoomScope {
    requestZoom(level: ZoomLevel, center?: Point): void;
    requestZoomBy(delta: number, center?: Point): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToArea(pageIndex: number, rect: Rect): void;
    enableMarqueeZoom(): void;
    disableMarqueeZoom(): void;
    toggleMarqueeZoom(): void;
    isMarqueeZoomActive(): boolean;
    getState(): ZoomDocumentState;
    onZoomChange: EventHook<ZoomChangeEvent>;
    onStateChange: EventHook<ZoomDocumentState>;
}
export interface ZoomCapability {
    requestZoom(level: ZoomLevel, center?: Point): void;
    requestZoomBy(delta: number, center?: Point): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToArea(pageIndex: number, rect: Rect): void;
    enableMarqueeZoom(): void;
    disableMarqueeZoom(): void;
    toggleMarqueeZoom(): void;
    isMarqueeZoomActive(): boolean;
    getState(): ZoomDocumentState;
    forDocument(documentId: string): ZoomScope;
    registerMarqueeOnPage: (opts: RegisterMarqueeOnPageOptions) => () => void;
    getPresets(): ZoomPreset[];
    onZoomChange: EventHook<ZoomChangeEvent>;
    onStateChange: EventHook<StateChangeEvent>;
}
export interface ZoomRangeStep {
    min: number;
    max: number;
    step: number;
}
export interface ZoomPreset {
    name: string;
    value: ZoomLevel;
    icon?: string;
}
export interface ZoomPluginConfig extends BasePluginConfig {
    defaultZoomLevel: ZoomLevel;
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
    zoomRanges?: ZoomRangeStep[];
    presets?: ZoomPreset[];
}
export interface ZoomState {
    documents: Record<string, ZoomDocumentState>;
    activeDocumentId: string | null;
}
export declare enum VerticalZoomFocus {
    Center = 0,
    Top = 1
}
export interface ZoomRequest {
    level: ZoomLevel;
    delta?: number;
    center?: Point;
    focus?: VerticalZoomFocus;
    align?: 'keep' | 'center';
}
