import { Action } from '@embedpdf/core';
import { PdfAnnotationObject } from '@embedpdf/models';
import { AnnotationTool } from './tools/types';
import { AnnotationDocumentState, LockMode } from './types';
export declare const INIT_ANNOTATION_STATE = "ANNOTATION/INIT_STATE";
export declare const CLEANUP_ANNOTATION_STATE = "ANNOTATION/CLEANUP_STATE";
export declare const SET_ACTIVE_DOCUMENT = "ANNOTATION/SET_ACTIVE_DOCUMENT";
export declare const SET_ANNOTATIONS = "ANNOTATION/SET_ANNOTATIONS";
export declare const SELECT_ANNOTATION = "ANNOTATION/SELECT_ANNOTATION";
export declare const DESELECT_ANNOTATION = "ANNOTATION/DESELECT_ANNOTATION";
export declare const ADD_TO_SELECTION = "ANNOTATION/ADD_TO_SELECTION";
export declare const REMOVE_FROM_SELECTION = "ANNOTATION/REMOVE_FROM_SELECTION";
export declare const SET_SELECTION = "ANNOTATION/SET_SELECTION";
export declare const SET_ACTIVE_TOOL_ID = "ANNOTATION/SET_ACTIVE_TOOL_ID";
export declare const CREATE_ANNOTATION = "ANNOTATION/CREATE_ANNOTATION";
export declare const PATCH_ANNOTATION = "ANNOTATION/PATCH_ANNOTATION";
export declare const MOVE_ANNOTATION = "ANNOTATION/MOVE_ANNOTATION";
export declare const DELETE_ANNOTATION = "ANNOTATION/DELETE_ANNOTATION";
export declare const COMMIT_PENDING_CHANGES = "ANNOTATION/COMMIT";
export declare const PURGE_ANNOTATION = "ANNOTATION/PURGE_ANNOTATION";
export declare const SET_LOCKED = "ANNOTATION/SET_LOCKED";
export declare const SYNC_ANNOTATION_OBJECT = "ANNOTATION/SYNC_OBJECT";
export declare const ADD_COLOR_PRESET = "ANNOTATION/ADD_COLOR_PRESET";
export declare const SET_TOOL_DEFAULTS = "ANNOTATION/SET_TOOL_DEFAULTS";
export declare const ADD_TOOL = "ANNOTATION/ADD_TOOL";
export interface InitAnnotationStateAction extends Action {
    type: typeof INIT_ANNOTATION_STATE;
    payload: {
        documentId: string;
        state: AnnotationDocumentState;
    };
}
export interface CleanupAnnotationStateAction extends Action {
    type: typeof CLEANUP_ANNOTATION_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface SetAnnotationsAction extends Action {
    type: typeof SET_ANNOTATIONS;
    payload: {
        documentId: string;
        annotations: Record<number, PdfAnnotationObject[]>;
    };
}
export interface SelectAnnotationAction extends Action {
    type: typeof SELECT_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        id: string;
    };
}
export interface DeselectAnnotationAction extends Action {
    type: typeof DESELECT_ANNOTATION;
    payload: {
        documentId: string;
    };
}
export interface AddToSelectionAction extends Action {
    type: typeof ADD_TO_SELECTION;
    payload: {
        documentId: string;
        pageIndex: number;
        id: string;
    };
}
export interface RemoveFromSelectionAction extends Action {
    type: typeof REMOVE_FROM_SELECTION;
    payload: {
        documentId: string;
        id: string;
    };
}
export interface SetSelectionAction extends Action {
    type: typeof SET_SELECTION;
    payload: {
        documentId: string;
        ids: string[];
    };
}
export interface SetActiveToolIdAction extends Action {
    type: typeof SET_ACTIVE_TOOL_ID;
    payload: {
        documentId: string;
        toolId: string | null;
        context?: Record<string, unknown>;
    };
}
export interface CreateAnnotationAction extends Action {
    type: typeof CREATE_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        annotation: PdfAnnotationObject;
    };
}
export interface PatchAnnotationAction extends Action {
    type: typeof PATCH_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        id: string;
        patch: Partial<PdfAnnotationObject>;
    };
}
export interface MoveAnnotationAction extends Action {
    type: typeof MOVE_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        id: string;
        patch: Partial<PdfAnnotationObject>;
    };
}
export interface DeleteAnnotationAction extends Action {
    type: typeof DELETE_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        id: string;
    };
}
export interface CommitAction extends Action {
    type: typeof COMMIT_PENDING_CHANGES;
    payload: {
        documentId: string;
        committedUids: string[];
    };
}
export interface PurgeAnnotationAction extends Action {
    type: typeof PURGE_ANNOTATION;
    payload: {
        documentId: string;
        pageIndex: number;
        uid: string;
    };
}
export interface SetLockedAction extends Action {
    type: typeof SET_LOCKED;
    payload: {
        documentId: string;
        mode: LockMode;
    };
}
export interface SyncAnnotationObjectAction extends Action {
    type: typeof SYNC_ANNOTATION_OBJECT;
    payload: {
        documentId: string;
        id: string;
        patch: Partial<PdfAnnotationObject>;
    };
}
export interface AddColorPresetAction extends Action {
    type: typeof ADD_COLOR_PRESET;
    payload: string;
}
export interface SetToolDefaultsAction extends Action {
    type: typeof SET_TOOL_DEFAULTS;
    payload: {
        toolId: string;
        patch: Partial<PdfAnnotationObject> & Record<string, unknown>;
    };
}
export interface AddToolAction extends Action {
    type: typeof ADD_TOOL;
    payload: AnnotationTool<any>;
}
export type AnnotationAction = InitAnnotationStateAction | CleanupAnnotationStateAction | SetActiveDocumentAction | SetAnnotationsAction | SelectAnnotationAction | DeselectAnnotationAction | AddToSelectionAction | RemoveFromSelectionAction | SetSelectionAction | SetActiveToolIdAction | CreateAnnotationAction | PatchAnnotationAction | MoveAnnotationAction | DeleteAnnotationAction | CommitAction | PurgeAnnotationAction | SetLockedAction | SyncAnnotationObjectAction | AddColorPresetAction | SetToolDefaultsAction | AddToolAction;
export declare function initAnnotationState(documentId: string, state: AnnotationDocumentState): InitAnnotationStateAction;
export declare function cleanupAnnotationState(documentId: string): CleanupAnnotationStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare const setAnnotations: (documentId: string, annotations: Record<number, PdfAnnotationObject[]>) => SetAnnotationsAction;
export declare const selectAnnotation: (documentId: string, pageIndex: number, id: string) => SelectAnnotationAction;
export declare const deselectAnnotation: (documentId: string) => DeselectAnnotationAction;
export declare const addToSelection: (documentId: string, pageIndex: number, id: string) => AddToSelectionAction;
export declare const removeFromSelection: (documentId: string, id: string) => RemoveFromSelectionAction;
export declare const setSelection: (documentId: string, ids: string[]) => SetSelectionAction;
export declare const setActiveToolId: (documentId: string, toolId: string | null, context?: Record<string, unknown>) => SetActiveToolIdAction;
export declare const createAnnotation: (documentId: string, pageIndex: number, annotation: PdfAnnotationObject) => CreateAnnotationAction;
export declare const patchAnnotation: (documentId: string, pageIndex: number, id: string, patch: Partial<PdfAnnotationObject>) => PatchAnnotationAction;
export declare const moveAnnotation: (documentId: string, pageIndex: number, id: string, patch: Partial<PdfAnnotationObject>) => MoveAnnotationAction;
export declare const deleteAnnotation: (documentId: string, pageIndex: number, id: string) => DeleteAnnotationAction;
export declare const commitPendingChanges: (documentId: string, committedUids: string[]) => CommitAction;
export declare const purgeAnnotation: (documentId: string, pageIndex: number, uid: string) => PurgeAnnotationAction;
export declare const setLockedAction: (documentId: string, mode: LockMode) => SetLockedAction;
export declare const syncAnnotationObject: (documentId: string, id: string, patch: Partial<PdfAnnotationObject>) => SyncAnnotationObjectAction;
export declare const addColorPreset: (c: string) => AddColorPresetAction;
export declare const setToolDefaults: (toolId: string, patch: Partial<PdfAnnotationObject> & Record<string, unknown>) => SetToolDefaultsAction;
export declare const addTool: (tool: AnnotationTool<any>) => AddToolAction;
