import { Action } from '@embedpdf/core';
import { ThumbnailDocumentState, WindowState } from './types';
export declare const INIT_THUMBNAIL_STATE = "THUMBNAIL/INIT_STATE";
export declare const CLEANUP_THUMBNAIL_STATE = "THUMBNAIL/CLEANUP_STATE";
export declare const SET_ACTIVE_DOCUMENT = "THUMBNAIL/SET_ACTIVE_DOCUMENT";
export declare const SET_WINDOW_STATE = "THUMBNAIL/SET_WINDOW_STATE";
export declare const UPDATE_VIEWPORT_METRICS = "THUMBNAIL/UPDATE_VIEWPORT_METRICS";
export interface InitThumbnailStateAction extends Action {
    type: typeof INIT_THUMBNAIL_STATE;
    payload: {
        documentId: string;
        state: ThumbnailDocumentState;
    };
}
export interface CleanupThumbnailStateAction extends Action {
    type: typeof CLEANUP_THUMBNAIL_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface SetWindowStateAction extends Action {
    type: typeof SET_WINDOW_STATE;
    payload: {
        documentId: string;
        window: WindowState | null;
    };
}
export interface UpdateViewportMetricsAction extends Action {
    type: typeof UPDATE_VIEWPORT_METRICS;
    payload: {
        documentId: string;
        scrollY: number;
        viewportH: number;
    };
}
export type ThumbnailAction = InitThumbnailStateAction | CleanupThumbnailStateAction | SetActiveDocumentAction | SetWindowStateAction | UpdateViewportMetricsAction;
export declare function initThumbnailState(documentId: string, state: ThumbnailDocumentState): InitThumbnailStateAction;
export declare function cleanupThumbnailState(documentId: string): CleanupThumbnailStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare function setWindowState(documentId: string, window: WindowState | null): SetWindowStateAction;
export declare function updateViewportMetrics(documentId: string, scrollY: number, viewportH: number): UpdateViewportMetricsAction;
