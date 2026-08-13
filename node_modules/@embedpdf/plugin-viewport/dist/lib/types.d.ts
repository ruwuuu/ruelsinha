import { BasePluginConfig, EventHook } from '@embedpdf/core';
export interface ViewportState {
    viewportGap: number;
    documents: Record<string, ViewportDocumentState>;
    activeViewports: Set<string>;
    activeDocumentId: string | null;
}
export interface ViewportDocumentState {
    viewportMetrics: ViewportMetrics;
    isScrolling: boolean;
    isSmoothScrolling: boolean;
    gates: Set<string>;
}
export interface ViewportPluginConfig extends BasePluginConfig {
    viewportGap?: number;
    scrollEndDelay?: number;
}
export interface ViewportInputMetrics {
    width: number;
    height: number;
    scrollTop: number;
    scrollLeft: number;
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    clientLeft: number;
    clientTop: number;
}
export interface ViewportMetrics extends ViewportInputMetrics {
    relativePosition: {
        x: number;
        y: number;
    };
}
export interface ViewportScrollMetrics {
    scrollTop: number;
    scrollLeft: number;
}
export interface ScrollToPayload {
    x: number;
    y: number;
    behavior?: ScrollBehavior;
    /**
     * Horizontal alignment as a percentage (0-100).
     * 0 = target at left edge, 50 = centered, 100 = target at right edge.
     */
    alignX?: number;
    /**
     * Vertical alignment as a percentage (0-100).
     * 0 = target at top edge, 50 = centered, 100 = target at bottom edge.
     * Useful for mobile where UI overlays may cover part of the screen.
     */
    alignY?: number;
}
export interface ScrollActivity {
    isSmoothScrolling: boolean;
    isScrolling: boolean;
}
export interface ViewportEvent {
    documentId: string;
    metrics: ViewportMetrics;
}
export interface ScrollActivityEvent {
    documentId: string;
    activity: ScrollActivity;
}
export interface GateChangeEvent {
    documentId: string;
    isGated: boolean;
    gates: string[];
    addedGate?: string;
    removedGate?: string;
}
export interface ScrollChangeEvent {
    documentId: string;
    scrollMetrics: ViewportScrollMetrics;
}
export interface ViewportScope {
    getMetrics(): ViewportMetrics;
    scrollTo(position: ScrollToPayload): void;
    isScrolling(): boolean;
    isSmoothScrolling(): boolean;
    isGated(): boolean;
    hasGate(key: string): boolean;
    getGates(): string[];
    gate(key: string): void;
    releaseGate(key: string): void;
    onViewportChange: EventHook<ViewportMetrics>;
    onScrollChange: EventHook<ViewportScrollMetrics>;
    onScrollActivity: EventHook<ScrollActivity>;
    onGateChange: EventHook<GateChangeEvent>;
}
export interface ViewportCapability {
    getViewportGap(): number;
    getMetrics(): ViewportMetrics;
    scrollTo(position: ScrollToPayload): void;
    isScrolling(): boolean;
    isSmoothScrolling(): boolean;
    isGated(documentId?: string): boolean;
    hasGate(key: string, documentId?: string): boolean;
    getGates(documentId?: string): string[];
    forDocument(documentId: string): ViewportScope;
    gate(key: string, documentId: string): void;
    releaseGate(key: string, documentId: string): void;
    isViewportMounted(documentId: string): boolean;
    onViewportChange: EventHook<ViewportEvent>;
    onViewportResize: EventHook<ViewportEvent>;
    onScrollChange: EventHook<ScrollChangeEvent>;
    onScrollActivity: EventHook<ScrollActivityEvent>;
    onGateChange: EventHook<GateChangeEvent>;
}
