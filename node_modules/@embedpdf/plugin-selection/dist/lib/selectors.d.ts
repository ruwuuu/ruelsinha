import { Rect } from '@embedpdf/models';
import { FormattedSelection, SelectionDocumentState } from './types';
export declare function selectRectsForPage(state: SelectionDocumentState, page: number): Rect[];
export declare function selectBoundingRectForPage(state: SelectionDocumentState, page: number): Rect | null;
export declare function selectRectsAndBoundingRectForPage(state: SelectionDocumentState, page: number): {
    rects: Rect[];
    boundingRect: Rect | null;
};
export declare function selectBoundingRectsForAllPages(state: SelectionDocumentState): {
    page: number;
    rect: Rect;
}[];
export declare function getFormattedSelectionForPage(state: SelectionDocumentState, page: number): FormattedSelection | null;
export declare function getFormattedSelection(state: SelectionDocumentState): FormattedSelection[];
