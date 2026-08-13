import { Action } from '@embedpdf/core';
import { FormDocumentState } from './types';
export declare const INIT_FORM_STATE = "FORM/INIT_STATE";
export declare const CLEANUP_FORM_STATE = "FORM/CLEANUP_STATE";
export declare const SELECT_FIELD = "FORM/SELECT_FIELD";
export declare const DESELECT_FIELD = "FORM/DESELECT_FIELD";
export interface InitFormStateAction extends Action {
    type: typeof INIT_FORM_STATE;
    payload: {
        documentId: string;
        state: FormDocumentState;
    };
}
export interface CleanupFormStateAction extends Action {
    type: typeof CLEANUP_FORM_STATE;
    payload: string;
}
export interface SelectFieldAction extends Action {
    type: typeof SELECT_FIELD;
    payload: {
        documentId: string;
        annotationId: string;
    };
}
export interface DeselectFieldAction extends Action {
    type: typeof DESELECT_FIELD;
    payload: string;
}
export type FormAction = InitFormStateAction | CleanupFormStateAction | SelectFieldAction | DeselectFieldAction;
export declare function initFormState(documentId: string, state: FormDocumentState): InitFormStateAction;
export declare function cleanupFormState(documentId: string): CleanupFormStateAction;
export declare function selectField(documentId: string, annotationId: string): SelectFieldAction;
export declare function deselectField(documentId: string): DeselectFieldAction;
