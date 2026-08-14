import { Action } from '@embedpdf/core';
import { SpreadMode, SpreadDocumentState } from './types';
export declare const INIT_SPREAD_STATE = "SPREAD/INIT_STATE";
export declare const CLEANUP_SPREAD_STATE = "SPREAD/CLEANUP_STATE";
export declare const SET_ACTIVE_SPREAD_DOCUMENT = "SPREAD/SET_ACTIVE_DOCUMENT";
export declare const SET_SPREAD_MODE = "SPREAD/SET_SPREAD_MODE";
export declare const SET_PAGE_GROUPING = "SPREAD/SET_PAGE_GROUPING";
export interface InitSpreadStateAction extends Action {
    type: typeof INIT_SPREAD_STATE;
    payload: {
        documentId: string;
        state: SpreadDocumentState;
    };
}
export interface CleanupSpreadStateAction extends Action {
    type: typeof CLEANUP_SPREAD_STATE;
    payload: string;
}
export interface SetActiveSpreadDocumentAction extends Action {
    type: typeof SET_ACTIVE_SPREAD_DOCUMENT;
    payload: string | null;
}
export interface SetSpreadModeAction extends Action {
    type: typeof SET_SPREAD_MODE;
    payload: {
        documentId: string;
        spreadMode: SpreadMode;
    };
}
export interface SetPageGroupingAction extends Action {
    type: typeof SET_PAGE_GROUPING;
    payload: {
        documentId: string;
        grouping: number[][];
    };
}
export type SpreadAction = InitSpreadStateAction | CleanupSpreadStateAction | SetActiveSpreadDocumentAction | SetSpreadModeAction | SetPageGroupingAction;
export declare function initSpreadState(documentId: string, state: SpreadDocumentState): InitSpreadStateAction;
export declare function cleanupSpreadState(documentId: string): CleanupSpreadStateAction;
export declare function setActiveSpreadDocument(documentId: string | null): SetActiveSpreadDocumentAction;
export declare function setSpreadMode(documentId: string, spreadMode: SpreadMode): SetSpreadModeAction;
export declare function setPageGrouping(documentId: string, grouping: number[][]): SetPageGroupingAction;
