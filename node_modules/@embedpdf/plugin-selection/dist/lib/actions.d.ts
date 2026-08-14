import { Action } from '@embedpdf/core';
import { PdfPageGeometry, Rect } from '@embedpdf/models';
import { SelectionDocumentState, SelectionRangeX } from './types';
export declare const INIT_SELECTION_STATE = "SELECTION/INIT_STATE";
export declare const CLEANUP_SELECTION_STATE = "SELECTION/CLEANUP_STATE";
export declare const CACHE_PAGE_GEOMETRY = "SELECTION/CACHE_PAGE_GEOMETRY";
export declare const SET_SELECTION = "SELECTION/SET_SELECTION";
export declare const START_SELECTION = "SELECTION/START_SELECTION";
export declare const END_SELECTION = "SELECTION/END_SELECTION";
export declare const CLEAR_SELECTION = "SELECTION/CLEAR_SELECTION";
export declare const SET_RECTS = "SELECTION/SET_RECTS";
export declare const SET_SLICES = "SELECTION/SET_SLICES";
export declare const EVICT_PAGE_GEOMETRY = "SELECTION/EVICT_PAGE_GEOMETRY";
export declare const RESET = "SELECTION/RESET";
export interface InitSelectionStateAction extends Action {
    type: typeof INIT_SELECTION_STATE;
    payload: {
        documentId: string;
        state: SelectionDocumentState;
    };
}
export interface CleanupSelectionStateAction extends Action {
    type: typeof CLEANUP_SELECTION_STATE;
    payload: string;
}
export interface CachePageGeometryAction extends Action {
    type: typeof CACHE_PAGE_GEOMETRY;
    payload: {
        documentId: string;
        page: number;
        geo: PdfPageGeometry;
    };
}
export interface SetSelectionAction extends Action {
    type: typeof SET_SELECTION;
    payload: {
        documentId: string;
        selection: SelectionRangeX | null;
    };
}
export interface StartSelectionAction extends Action {
    type: typeof START_SELECTION;
    payload: {
        documentId: string;
    };
}
export interface EndSelectionAction extends Action {
    type: typeof END_SELECTION;
    payload: {
        documentId: string;
    };
}
export interface ClearSelectionAction extends Action {
    type: typeof CLEAR_SELECTION;
    payload: {
        documentId: string;
    };
}
export interface SetRectsAction extends Action {
    type: typeof SET_RECTS;
    payload: {
        documentId: string;
        rects: Record<number, Rect[]>;
    };
}
export interface SetSlicesAction extends Action {
    type: typeof SET_SLICES;
    payload: {
        documentId: string;
        slices: Record<number, {
            start: number;
            count: number;
        }>;
    };
}
export interface EvictPageGeometryAction extends Action {
    type: typeof EVICT_PAGE_GEOMETRY;
    payload: {
        documentId: string;
        pages: number[];
    };
}
export interface ResetAction extends Action {
    type: typeof RESET;
    payload: {
        documentId: string;
    };
}
export type SelectionAction = InitSelectionStateAction | CleanupSelectionStateAction | CachePageGeometryAction | SetSelectionAction | StartSelectionAction | EndSelectionAction | ClearSelectionAction | SetRectsAction | SetSlicesAction | EvictPageGeometryAction | ResetAction;
export declare const initSelectionState: (documentId: string, state: SelectionDocumentState) => InitSelectionStateAction;
export declare const cleanupSelectionState: (documentId: string) => CleanupSelectionStateAction;
export declare const cachePageGeometry: (documentId: string, page: number, geo: PdfPageGeometry) => CachePageGeometryAction;
export declare const setSelection: (documentId: string, sel: SelectionRangeX | null) => SetSelectionAction;
export declare const startSelection: (documentId: string) => StartSelectionAction;
export declare const endSelection: (documentId: string) => EndSelectionAction;
export declare const clearSelection: (documentId: string) => ClearSelectionAction;
export declare const setRects: (documentId: string, allRects: Record<number, Rect[]>) => SetRectsAction;
export declare const setSlices: (documentId: string, slices: Record<number, {
    start: number;
    count: number;
}>) => SetSlicesAction;
export declare const evictPageGeometry: (documentId: string, pages: number[]) => EvictPageGeometryAction;
export declare const reset: (documentId: string) => ResetAction;
