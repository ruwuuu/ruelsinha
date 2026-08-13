import { Action } from '@embedpdf/core';
import { CaptureDocumentState } from './types';
export declare const INIT_CAPTURE_STATE = "CAPTURE/INIT_STATE";
export declare const CLEANUP_CAPTURE_STATE = "CAPTURE/CLEANUP_STATE";
export declare const SET_ACTIVE_DOCUMENT = "CAPTURE/SET_ACTIVE_DOCUMENT";
export declare const SET_MARQUEE_CAPTURE_ACTIVE = "CAPTURE/SET_MARQUEE_CAPTURE_ACTIVE";
export interface InitCaptureStateAction extends Action {
    type: typeof INIT_CAPTURE_STATE;
    payload: {
        documentId: string;
        state: CaptureDocumentState;
    };
}
export interface CleanupCaptureStateAction extends Action {
    type: typeof CLEANUP_CAPTURE_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface SetMarqueeCaptureActiveAction extends Action {
    type: typeof SET_MARQUEE_CAPTURE_ACTIVE;
    payload: {
        documentId: string;
        isActive: boolean;
    };
}
export type CaptureAction = InitCaptureStateAction | CleanupCaptureStateAction | SetActiveDocumentAction | SetMarqueeCaptureActiveAction;
export declare function initCaptureState(documentId: string, state: CaptureDocumentState): InitCaptureStateAction;
export declare function cleanupCaptureState(documentId: string): CleanupCaptureStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare function setMarqueeCaptureActive(documentId: string, isActive: boolean): SetMarqueeCaptureActiveAction;
