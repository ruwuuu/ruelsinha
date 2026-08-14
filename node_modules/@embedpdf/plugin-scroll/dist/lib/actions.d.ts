import { Action } from '@embedpdf/core';
import { ScrollDocumentState, ScrollStrategy } from './types';
export declare const INIT_SCROLL_STATE = "INIT_SCROLL_STATE";
export declare const CLEANUP_SCROLL_STATE = "CLEANUP_SCROLL_STATE";
export declare const UPDATE_DOCUMENT_SCROLL_STATE = "UPDATE_DOCUMENT_SCROLL_STATE";
export declare const SET_SCROLL_STRATEGY = "SET_SCROLL_STRATEGY";
export interface InitScrollStateAction extends Action {
    type: typeof INIT_SCROLL_STATE;
    payload: {
        documentId: string;
        state: ScrollDocumentState;
    };
}
export interface CleanupScrollStateAction extends Action {
    type: typeof CLEANUP_SCROLL_STATE;
    payload: string;
}
export interface UpdateDocumentScrollStateAction extends Action {
    type: typeof UPDATE_DOCUMENT_SCROLL_STATE;
    payload: {
        documentId: string;
        state: Partial<ScrollDocumentState>;
    };
}
export interface SetScrollStrategyAction extends Action {
    type: typeof SET_SCROLL_STRATEGY;
    payload: {
        documentId: string;
        strategy: ScrollStrategy;
    };
}
export type ScrollAction = InitScrollStateAction | CleanupScrollStateAction | UpdateDocumentScrollStateAction | SetScrollStrategyAction;
export declare function initScrollState(documentId: string, state: ScrollDocumentState): InitScrollStateAction;
export declare function cleanupScrollState(documentId: string): CleanupScrollStateAction;
export declare function updateDocumentScrollState(documentId: string, state: Partial<ScrollDocumentState>): UpdateDocumentScrollStateAction;
export declare function setScrollStrategy(documentId: string, strategy: ScrollStrategy): SetScrollStrategyAction;
