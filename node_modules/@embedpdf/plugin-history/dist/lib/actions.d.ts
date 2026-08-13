import { Action } from '@embedpdf/core';
import { HistoryDocumentState } from './types';
export declare const INIT_HISTORY_STATE = "HISTORY/INIT_STATE";
export declare const CLEANUP_HISTORY_STATE = "HISTORY/CLEANUP_STATE";
export declare const SET_HISTORY_DOCUMENT_STATE = "HISTORY/SET_DOCUMENT_STATE";
export declare const SET_ACTIVE_HISTORY_DOCUMENT = "HISTORY/SET_ACTIVE_DOCUMENT";
export interface InitHistoryStateAction extends Action {
    type: typeof INIT_HISTORY_STATE;
    payload: {
        documentId: string;
    };
}
export interface CleanupHistoryStateAction extends Action {
    type: typeof CLEANUP_HISTORY_STATE;
    payload: {
        documentId: string;
    };
}
export interface SetHistoryDocumentStateAction extends Action {
    type: typeof SET_HISTORY_DOCUMENT_STATE;
    payload: {
        documentId: string;
        state: HistoryDocumentState;
    };
}
export interface SetActiveHistoryDocumentAction extends Action {
    type: typeof SET_ACTIVE_HISTORY_DOCUMENT;
    payload: string | null;
}
export type HistoryAction = InitHistoryStateAction | CleanupHistoryStateAction | SetHistoryDocumentStateAction | SetActiveHistoryDocumentAction;
export declare const initHistoryState: (documentId: string) => InitHistoryStateAction;
export declare const cleanupHistoryState: (documentId: string) => CleanupHistoryStateAction;
export declare const setHistoryDocumentState: (documentId: string, state: HistoryDocumentState) => SetHistoryDocumentStateAction;
export declare const setActiveHistoryDocument: (documentId: string | null) => SetActiveHistoryDocumentAction;
