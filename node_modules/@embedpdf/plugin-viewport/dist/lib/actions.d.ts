import { Action } from '@embedpdf/core';
import { ViewportInputMetrics, ViewportScrollMetrics } from './types';
export declare const INIT_VIEWPORT_STATE = "INIT_VIEWPORT_STATE";
export declare const CLEANUP_VIEWPORT_STATE = "CLEANUP_VIEWPORT_STATE";
export declare const REGISTER_VIEWPORT = "REGISTER_VIEWPORT";
export declare const UNREGISTER_VIEWPORT = "UNREGISTER_VIEWPORT";
export declare const SET_VIEWPORT_METRICS = "SET_VIEWPORT_METRICS";
export declare const SET_VIEWPORT_SCROLL_METRICS = "SET_VIEWPORT_SCROLL_METRICS";
export declare const SET_VIEWPORT_GAP = "SET_VIEWPORT_GAP";
export declare const SET_SCROLL_ACTIVITY = "SET_SCROLL_ACTIVITY";
export declare const SET_SMOOTH_SCROLL_ACTIVITY = "SET_SMOOTH_SCROLL_ACTIVITY";
export declare const SET_ACTIVE_VIEWPORT_DOCUMENT = "SET_ACTIVE_VIEWPORT_DOCUMENT";
export declare const ADD_VIEWPORT_GATE = "ADD_VIEWPORT_GATE";
export declare const REMOVE_VIEWPORT_GATE = "REMOVE_VIEWPORT_GATE";
export interface InitViewportStateAction extends Action {
    type: typeof INIT_VIEWPORT_STATE;
    payload: {
        documentId: string;
    };
}
export interface CleanupViewportStateAction extends Action {
    type: typeof CLEANUP_VIEWPORT_STATE;
    payload: {
        documentId: string;
    };
}
export interface RegisterViewportAction extends Action {
    type: typeof REGISTER_VIEWPORT;
    payload: {
        documentId: string;
    };
}
export interface UnregisterViewportAction extends Action {
    type: typeof UNREGISTER_VIEWPORT;
    payload: {
        documentId: string;
    };
}
export interface SetActiveViewportDocumentAction extends Action {
    type: typeof SET_ACTIVE_VIEWPORT_DOCUMENT;
    payload: string | null;
}
export interface SetViewportMetricsAction extends Action {
    type: typeof SET_VIEWPORT_METRICS;
    payload: {
        documentId: string;
        metrics: ViewportInputMetrics;
    };
}
export interface SetViewportScrollMetricsAction extends Action {
    type: typeof SET_VIEWPORT_SCROLL_METRICS;
    payload: {
        documentId: string;
        scrollMetrics: ViewportScrollMetrics;
    };
}
export interface SetViewportGapAction extends Action {
    type: typeof SET_VIEWPORT_GAP;
    payload: number;
}
export interface SetScrollActivityAction extends Action {
    type: typeof SET_SCROLL_ACTIVITY;
    payload: {
        documentId: string;
        isScrolling: boolean;
    };
}
export interface SetSmoothScrollActivityAction extends Action {
    type: typeof SET_SMOOTH_SCROLL_ACTIVITY;
    payload: {
        documentId: string;
        isSmoothScrolling: boolean;
    };
}
export interface AddViewportGateAction extends Action {
    type: typeof ADD_VIEWPORT_GATE;
    payload: {
        documentId: string;
        key: string;
    };
}
export interface RemoveViewportGateAction extends Action {
    type: typeof REMOVE_VIEWPORT_GATE;
    payload: {
        documentId: string;
        key: string;
    };
}
export type ViewportAction = InitViewportStateAction | CleanupViewportStateAction | RegisterViewportAction | UnregisterViewportAction | SetActiveViewportDocumentAction | SetViewportMetricsAction | SetViewportScrollMetricsAction | SetViewportGapAction | SetScrollActivityAction | SetSmoothScrollActivityAction | AddViewportGateAction | RemoveViewportGateAction;
export declare function initViewportState(documentId: string): InitViewportStateAction;
export declare function cleanupViewportState(documentId: string): CleanupViewportStateAction;
export declare function registerViewport(documentId: string): RegisterViewportAction;
export declare function unregisterViewport(documentId: string): UnregisterViewportAction;
export declare function setActiveViewportDocument(documentId: string | null): SetActiveViewportDocumentAction;
export declare function setViewportGap(viewportGap: number): SetViewportGapAction;
export declare function setViewportMetrics(documentId: string, metrics: ViewportInputMetrics): SetViewportMetricsAction;
export declare function setViewportScrollMetrics(documentId: string, scrollMetrics: ViewportScrollMetrics): SetViewportScrollMetricsAction;
export declare function setScrollActivity(documentId: string, isScrolling: boolean): SetScrollActivityAction;
export declare function setSmoothScrollActivity(documentId: string, isSmoothScrolling: boolean): SetSmoothScrollActivityAction;
export declare function addViewportGate(documentId: string, key: string): AddViewportGateAction;
export declare function removeViewportGate(documentId: string, key: string): RemoveViewportGateAction;
