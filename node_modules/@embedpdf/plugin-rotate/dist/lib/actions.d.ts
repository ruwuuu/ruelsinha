import { Action } from '@embedpdf/core';
import { Rotation } from '@embedpdf/models';
import { RotateDocumentState } from './types';
export declare const INIT_ROTATE_STATE = "ROTATE/INIT_STATE";
export declare const CLEANUP_ROTATE_STATE = "ROTATE/CLEANUP_STATE";
export declare const SET_ACTIVE_ROTATE_DOCUMENT = "ROTATE/SET_ACTIVE_DOCUMENT";
export declare const SET_ROTATION = "ROTATE/SET_ROTATION";
export interface InitRotateStateAction extends Action {
    type: typeof INIT_ROTATE_STATE;
    payload: {
        documentId: string;
        state: RotateDocumentState;
    };
}
export interface CleanupRotateStateAction extends Action {
    type: typeof CLEANUP_ROTATE_STATE;
    payload: string;
}
export interface SetActiveRotateDocumentAction extends Action {
    type: typeof SET_ACTIVE_ROTATE_DOCUMENT;
    payload: string | null;
}
export interface SetRotationAction extends Action {
    type: typeof SET_ROTATION;
    payload: {
        documentId: string;
        rotation: Rotation;
    };
}
export type RotateAction = InitRotateStateAction | CleanupRotateStateAction | SetActiveRotateDocumentAction | SetRotationAction;
export declare function initRotateState(documentId: string, state: RotateDocumentState): InitRotateStateAction;
export declare function cleanupRotateState(documentId: string): CleanupRotateStateAction;
export declare function setActiveRotateDocument(documentId: string | null): SetActiveRotateDocumentAction;
export declare function setRotation(documentId: string, rotation: Rotation): SetRotationAction;
