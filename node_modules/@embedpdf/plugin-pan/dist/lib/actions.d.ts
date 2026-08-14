import { Action } from '@embedpdf/core';
import { PanDocumentState } from './types';
export declare const INIT_PAN_STATE = "PAN/INIT_STATE";
export declare const CLEANUP_PAN_STATE = "PAN/CLEANUP_STATE";
export declare const SET_ACTIVE_PAN_DOCUMENT = "PAN/SET_ACTIVE_DOCUMENT";
export declare const SET_PAN_MODE = "PAN/SET_PAN_MODE";
export interface InitPanStateAction extends Action {
    type: typeof INIT_PAN_STATE;
    payload: {
        documentId: string;
        state: PanDocumentState;
    };
}
export interface CleanupPanStateAction extends Action {
    type: typeof CLEANUP_PAN_STATE;
    payload: string;
}
export interface SetActivePanDocumentAction extends Action {
    type: typeof SET_ACTIVE_PAN_DOCUMENT;
    payload: string | null;
}
export interface SetPanModeAction extends Action {
    type: typeof SET_PAN_MODE;
    payload: {
        documentId: string;
        isPanMode: boolean;
    };
}
export type PanAction = InitPanStateAction | CleanupPanStateAction | SetActivePanDocumentAction | SetPanModeAction;
export declare function initPanState(documentId: string, state: PanDocumentState): InitPanStateAction;
export declare function cleanupPanState(documentId: string): CleanupPanStateAction;
export declare function setActivePanDocument(documentId: string | null): SetActivePanDocumentAction;
export declare function setPanMode(documentId: string, isPanMode: boolean): SetPanModeAction;
