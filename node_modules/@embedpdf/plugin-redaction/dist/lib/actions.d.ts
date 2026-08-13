import { Action } from '@embedpdf/core';
import { Rect } from '@embedpdf/models';
import { RedactionItem, RedactionMode, RedactionDocumentState } from './types';
export declare const INIT_REDACTION_STATE = "REDACTION/INIT_STATE";
export declare const CLEANUP_REDACTION_STATE = "REDACTION/CLEANUP_STATE";
export declare const SET_ACTIVE_DOCUMENT = "REDACTION/SET_ACTIVE_DOCUMENT";
export declare const START_REDACTION = "START_REDACTION";
export declare const END_REDACTION = "END_REDACTION";
export declare const SET_ACTIVE_TYPE = "SET_ACTIVE_TYPE";
export declare const ADD_PENDING = "ADD_PENDING";
export declare const REMOVE_PENDING = "REMOVE_PENDING";
export declare const UPDATE_PENDING = "UPDATE_PENDING";
export declare const CLEAR_PENDING = "CLEAR_PENDING";
export declare const SELECT_PENDING = "SELECT_PENDING";
export declare const DESELECT_PENDING = "DESELECT_PENDING";
export interface InitRedactionStateAction extends Action {
    type: typeof INIT_REDACTION_STATE;
    payload: {
        documentId: string;
        state: RedactionDocumentState;
    };
}
export interface CleanupRedactionStateAction extends Action {
    type: typeof CLEANUP_REDACTION_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface StartRedactionAction extends Action {
    type: typeof START_REDACTION;
    payload: {
        documentId: string;
        mode: RedactionMode;
    };
}
export interface EndRedactionAction extends Action {
    type: typeof END_REDACTION;
    payload: string;
}
export interface SetActiveTypeAction extends Action {
    type: typeof SET_ACTIVE_TYPE;
    payload: {
        documentId: string;
        mode: RedactionMode | null;
    };
}
export interface AddPendingAction extends Action {
    type: typeof ADD_PENDING;
    payload: {
        documentId: string;
        items: RedactionItem[];
    };
}
export interface RemovePendingAction extends Action {
    type: typeof REMOVE_PENDING;
    payload: {
        documentId: string;
        page: number;
        id: string;
    };
}
export interface ClearPendingAction extends Action {
    type: typeof CLEAR_PENDING;
    payload: string;
}
export interface UpdatePendingAction extends Action {
    type: typeof UPDATE_PENDING;
    payload: {
        documentId: string;
        page: number;
        id: string;
        patch: {
            rect?: Rect;
            rects?: Rect[];
            markColor?: string;
            text?: string;
            redactionColor?: string;
        };
    };
}
export interface SelectPendingAction extends Action {
    type: typeof SELECT_PENDING;
    payload: {
        documentId: string;
        page: number;
        id: string;
    };
}
export interface DeselectPendingAction extends Action {
    type: typeof DESELECT_PENDING;
    payload: string;
}
export type RedactionAction = InitRedactionStateAction | CleanupRedactionStateAction | SetActiveDocumentAction | StartRedactionAction | EndRedactionAction | SetActiveTypeAction | AddPendingAction | RemovePendingAction | UpdatePendingAction | ClearPendingAction | SelectPendingAction | DeselectPendingAction;
export declare function initRedactionState(documentId: string, state: RedactionDocumentState): InitRedactionStateAction;
export declare function cleanupRedactionState(documentId: string): CleanupRedactionStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare const addPending: (documentId: string, items: RedactionItem[]) => AddPendingAction;
export declare const removePending: (documentId: string, page: number, id: string) => RemovePendingAction;
export declare const clearPending: (documentId: string) => ClearPendingAction;
export declare const updatePending: (documentId: string, page: number, id: string, patch: {
    rect?: Rect;
    rects?: Rect[];
    markColor?: string;
    text?: string;
    redactionColor?: string;
}) => UpdatePendingAction;
export declare const startRedaction: (documentId: string, mode: RedactionMode) => StartRedactionAction;
export declare const endRedaction: (documentId: string) => EndRedactionAction;
export declare const setActiveType: (documentId: string, mode: RedactionMode | null) => SetActiveTypeAction;
export declare const selectPending: (documentId: string, page: number, id: string) => SelectPendingAction;
export declare const deselectPending: (documentId: string) => DeselectPendingAction;
