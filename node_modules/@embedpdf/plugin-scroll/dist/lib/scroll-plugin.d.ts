import { BasePlugin, PluginRegistry, Unsubscribe } from '@embedpdf/core';
import { ScrollCapability, ScrollPluginConfig, ScrollState, ScrollerLayout } from './types';
import { ScrollAction } from './actions';
export declare class ScrollPlugin extends BasePlugin<ScrollPluginConfig, ScrollCapability, ScrollState, ScrollAction> {
    readonly id: string;
    private config?;
    static readonly id: "scroll";
    private viewport;
    private spread;
    private elevatedPages;
    private strategies;
    private layoutReady;
    private initialLayoutFired;
    private scrollerLayoutEmitters;
    private readonly pageChange$;
    private readonly scroll$;
    private readonly layoutChange$;
    private readonly pageChangeState$;
    private readonly layoutReady$;
    private readonly state$;
    constructor(id: string, registry: PluginRegistry, config?: ScrollPluginConfig | undefined);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected onScaleChanged(documentId: string): void;
    protected onRotationChanged(documentId: string): void;
    /**
     * Subscribe to scroller layout updates for a specific document
     * This is the key method for the Scroller component to stay reactive
     */
    onScrollerData(documentId: string, callback: (layout: ScrollerLayout) => void): Unsubscribe;
    /**
     * Get current scroller layout for a document
     */
    getScrollerLayout(documentId: string): ScrollerLayout;
    setLayoutReady(documentId: string): void;
    clearLayoutReady(documentId: string): void;
    protected buildCapability(): ScrollCapability;
    private createScrollScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private getStrategy;
    private createStrategy;
    private createDocumentState;
    private startPageChange;
    private completePageChange;
    private computeLayout;
    private computeMetrics;
    private commitMetrics;
    private pushScrollerLayout;
    private refreshDocumentLayout;
    private getSpreadPagesWithRotatedSize;
    private getCurrentPage;
    private getTotalPages;
    private getPageChangeState;
    private scrollToPage;
    private scrollToNextPage;
    private scrollToPreviousPage;
    private getMetrics;
    private getLayout;
    private getRectPositionForPage;
    private setScrollStrategyForDocument;
    onStoreUpdated(prevState: ScrollState, newState: ScrollState): void;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
}
