import { PdfPageObjectWithRotatedSize, Size } from '@embedpdf/models';
import { ViewportMetrics } from '@embedpdf/plugin-viewport';
import { BaseScrollStrategy, ScrollStrategyConfig } from './base-strategy';
import { VirtualItem } from '../types/virtual-item';
export declare class HorizontalScrollStrategy extends BaseScrollStrategy {
    constructor(config: ScrollStrategyConfig);
    createVirtualItems(pdfPageObject: PdfPageObjectWithRotatedSize[][]): VirtualItem[];
    getTotalContentSize(virtualItems: VirtualItem[]): {
        width: number;
        height: number;
    };
    protected getScrollOffset(viewport: ViewportMetrics): number;
    protected getClientSize(viewport: ViewportMetrics): number;
    /** Horizontal scroll: extent along scroll axis is width. */
    protected getItemSizeAlongScrollAxis(item: VirtualItem): number;
    /**
     * No centering for horizontal layout. Items are laid out in a simple row;
     * using total content width would produce incorrect offsets and shift pages.
     */
    protected getCenteringOffsetX(_item: VirtualItem, _totalContentSize: Size | undefined): number;
    /**
     * Horizontal rows visually center shorter items within the tallest row height.
     * Match that DOM layout so page-coordinate targeting lands on the rendered page.
     */
    protected getCenteringOffsetY(item: VirtualItem, totalContentSize: Size | undefined): number;
}
