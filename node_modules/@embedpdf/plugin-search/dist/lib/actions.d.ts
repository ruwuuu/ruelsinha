import { Action } from '@embedpdf/core';
import { MatchFlag, SearchResult } from '@embedpdf/models';
import { SearchDocumentState } from './types';
export declare const INIT_SEARCH_STATE = "SEARCH/INIT_STATE";
export declare const CLEANUP_SEARCH_STATE = "SEARCH/CLEANUP_STATE";
export declare const START_SEARCH_SESSION = "SEARCH/START_SEARCH_SESSION";
export declare const STOP_SEARCH_SESSION = "SEARCH/STOP_SEARCH_SESSION";
export declare const SET_SEARCH_FLAGS = "SEARCH/SET_SEARCH_FLAGS";
export declare const SET_SHOW_ALL_RESULTS = "SEARCH/SET_SHOW_ALL_RESULTS";
export declare const START_SEARCH = "SEARCH/START_SEARCH";
export declare const SET_SEARCH_RESULTS = "SEARCH/SET_SEARCH_RESULTS";
export declare const APPEND_SEARCH_RESULTS = "SEARCH/APPEND_SEARCH_RESULTS";
export declare const SET_ACTIVE_RESULT_INDEX = "SEARCH/SET_ACTIVE_RESULT_INDEX";
export interface InitSearchStateAction extends Action {
    type: typeof INIT_SEARCH_STATE;
    payload: {
        documentId: string;
        state: SearchDocumentState;
    };
}
export interface CleanupSearchStateAction extends Action {
    type: typeof CLEANUP_SEARCH_STATE;
    payload: string;
}
export interface StartSearchSessionAction extends Action {
    type: typeof START_SEARCH_SESSION;
    payload: {
        documentId: string;
    };
}
export interface StopSearchSessionAction extends Action {
    type: typeof STOP_SEARCH_SESSION;
    payload: {
        documentId: string;
    };
}
export interface SetSearchFlagsAction extends Action {
    type: typeof SET_SEARCH_FLAGS;
    payload: {
        documentId: string;
        flags: MatchFlag[];
    };
}
export interface SetShowAllResultsAction extends Action {
    type: typeof SET_SHOW_ALL_RESULTS;
    payload: {
        documentId: string;
        showAll: boolean;
    };
}
export interface StartSearchAction extends Action {
    type: typeof START_SEARCH;
    payload: {
        documentId: string;
        query: string;
    };
}
export interface SetSearchResultsAction extends Action {
    type: typeof SET_SEARCH_RESULTS;
    payload: {
        documentId: string;
        results: SearchResult[];
        total: number;
        activeResultIndex: number;
    };
}
export interface AppendSearchResultsAction extends Action {
    type: typeof APPEND_SEARCH_RESULTS;
    payload: {
        documentId: string;
        results: SearchResult[];
    };
}
export interface SetActiveResultIndexAction extends Action {
    type: typeof SET_ACTIVE_RESULT_INDEX;
    payload: {
        documentId: string;
        index: number;
    };
}
export type SearchAction = InitSearchStateAction | CleanupSearchStateAction | StartSearchSessionAction | StopSearchSessionAction | SetSearchFlagsAction | SetShowAllResultsAction | StartSearchAction | SetSearchResultsAction | AppendSearchResultsAction | SetActiveResultIndexAction;
export declare function initSearchState(documentId: string, state: SearchDocumentState): InitSearchStateAction;
export declare function cleanupSearchState(documentId: string): CleanupSearchStateAction;
export declare function startSearchSession(documentId: string): StartSearchSessionAction;
export declare function stopSearchSession(documentId: string): StopSearchSessionAction;
export declare function setSearchFlags(documentId: string, flags: MatchFlag[]): SetSearchFlagsAction;
export declare function setShowAllResults(documentId: string, showAll: boolean): SetShowAllResultsAction;
export declare function startSearch(documentId: string, query: string): StartSearchAction;
export declare function setSearchResults(documentId: string, results: SearchResult[], total: number, activeResultIndex: number): SetSearchResultsAction;
export declare function appendSearchResults(documentId: string, results: SearchResult[]): AppendSearchResultsAction;
export declare function setActiveResultIndex(documentId: string, index: number): SetActiveResultIndexAction;
