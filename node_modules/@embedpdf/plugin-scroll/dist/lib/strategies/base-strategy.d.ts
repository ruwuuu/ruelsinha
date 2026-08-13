import { PdfPageObjectWithRotatedSize, Position, Rect, Rotation, Size } from '@embedpdf/models';
import { ViewportMetrics } from '@embedpdf/plugin-viewport';
import { VirtualItem } from '../types/virtual-item';
import { ScrollMetrics } from '../types';
export interface ScrollStrategyConfig {
    pageGap?: number;
    viewportGap?: number;
    bufferSize?: number;
}
export declare abstract class BaseScrollStrategy {
    protected pageGap: number;
    protected viewportGap: number;
    protected bufferSize: number;
    constructor(config: ScrollStrategyConfig);
    abstract createVirtualItems(pdfPageObject: PdfPageObjectWithRotatedSize[][]): VirtualItem[];
    abstract getTotalContentSize(virtualItems: VirtualItem[]): Size;
    protected abstract getScrollOffset(viewport: ViewportMetrics): number;
    protected abstract getClientSize(viewport: ViewportMetrics): number;
    /**
     * Returns the item's extent along the scroll axis. Vertical layout uses height;
     * horizontal layout uses width. Used for visible range and end spacing calculations.
     */
    protected abstract getItemSizeAlongScrollAxis(item: VirtualItem): number;
    /**
     * Horizontal centering offset for items narrower than the content max width.
     * Vertical layout centers spreads within the row; horizontal layout overrides to 0
     * since items stay in a simple row without centering.
     */
    protected getCenteringOffsetX(_item: VirtualItem, totalContentSize: Size | undefined): number;
    /**
     * Vertical centering offset for items shorter than the content max height.
     * Horizontal layout centers items within the row height; vertical layout keeps
     * items top-aligned and uses the default of 0.
     */
    protected getCenteringOffsetY(_item: VirtualItem, _totalContentSize: Size | undefined): number;
    protected getVisibleRange(viewport: ViewportMetrics, virtualItems: VirtualItem[], scale: number): {
        start: number;
        end: number;
    };
    handleScroll(viewport: ViewportMetrics, virtualItems: VirtualItem[], scale: number): ScrollMetrics;
    protected calculatePageVisibility(virtualItems: VirtualItem[], viewport: ViewportMetrics, scale: number, totalContentSize?: Size): ScrollMetrics['pageVisibilityMetrics'];
    protected determineCurrentPage(visibilityMetrics: ScrollMetrics['pageVisibilityMetrics']): number;
    private getRectLocationForPage;
    getScrollPositionForPage(pageNumber: number, virtualItems: VirtualItem[], scale: number, rotation: Rotation, pageCoordinates?: {
        x: number;
        y: number;
    }): Position | null;
    getRectPositionForPage(pageNumber: number, virtualItems: VirtualItem[], scale: number, rotation: Rotation, rect: Rect): Rect | null;
}
