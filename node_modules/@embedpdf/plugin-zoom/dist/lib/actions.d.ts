import { Action } from '@embedpdf/core';
import { ZoomLevel, ZoomDocumentState } from './types';
export declare const INIT_ZOOM_STATE = "ZOOM/INIT_STATE";
export declare const CLEANUP_ZOOM_STATE = "ZOOM/CLEANUP_STATE";
export declare const SET_ACTIVE_DOCUMENT = "ZOOM/SET_ACTIVE_DOCUMENT";
export declare const SET_ZOOM_LEVEL = "ZOOM/SET_ZOOM_LEVEL";
export declare const SET_MARQUEE_ZOOM_ACTIVE = "ZOOM/SET_MARQUEE_ZOOM_ACTIVE";
export interface InitZoomStateAction extends Action {
    type: typeof INIT_ZOOM_STATE;
    payload: {
        documentId: string;
        state: ZoomDocumentState;
    };
}
export interface CleanupZoomStateAction extends Action {
    type: typeof CLEANUP_ZOOM_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface SetZoomLevelAction extends Action {
    type: typeof SET_ZOOM_LEVEL;
    payload: {
        documentId: string;
        zoomLevel: ZoomLevel;
        currentZoomLevel: number;
    };
}
export interface SetMarqueeZoomActiveAction extends Action {
    type: typeof SET_MARQUEE_ZOOM_ACTIVE;
    payload: {
        documentId: string;
        isActive: boolean;
    };
}
export type ZoomAction = InitZoomStateAction | CleanupZoomStateAction | SetActiveDocumentAction | SetZoomLevelAction | SetMarqueeZoomActiveAction;
export declare function initZoomState(documentId: string, state: ZoomDocumentState): InitZoomStateAction;
export declare function cleanupZoomState(documentId: string): CleanupZoomStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare function setZoomLevel(documentId: string, zoomLevel: ZoomLevel, currentZoomLevel: number): SetZoomLevelAction;
export declare function setMarqueeZoomActive(documentId: string, isActive: boolean): SetMarqueeZoomActiveAction;
