import { PdfDocumentObject, PdfErrorCode, PdfPageObject, Rotation } from '@embedpdf/models';
import { PermissionConfig } from '../types/permissions';
export declare const START_LOADING_DOCUMENT = "START_LOADING_DOCUMENT";
export declare const UPDATE_DOCUMENT_LOADING_PROGRESS = "UPDATE_DOCUMENT_LOADING_PROGRESS";
export declare const SET_DOCUMENT_LOADED = "SET_DOCUMENT_LOADED";
export declare const SET_DOCUMENT_ERROR = "SET_DOCUMENT_ERROR";
export declare const RETRY_LOADING_DOCUMENT = "RETRY_LOADING_DOCUMENT";
export declare const CLOSE_DOCUMENT = "CLOSE_DOCUMENT";
export declare const SET_ACTIVE_DOCUMENT = "SET_ACTIVE_DOCUMENT";
export declare const REORDER_DOCUMENTS = "REORDER_DOCUMENTS";
export declare const MOVE_DOCUMENT = "MOVE_DOCUMENT";
export declare const UPDATE_DOCUMENT_SECURITY = "UPDATE_DOCUMENT_SECURITY";
export declare const REFRESH_DOCUMENT = "REFRESH_DOCUMENT";
export declare const REFRESH_PAGES = "REFRESH_PAGES";
export declare const SET_PAGES = "SET_PAGES";
export declare const SET_SCALE = "SET_SCALE";
export declare const SET_ROTATION = "SET_ROTATION";
export declare const SET_DEFAULT_SCALE = "SET_DEFAULT_SCALE";
export declare const SET_DEFAULT_ROTATION = "SET_DEFAULT_ROTATION";
export declare const CORE_ACTION_TYPES: readonly ["START_LOADING_DOCUMENT", "UPDATE_DOCUMENT_LOADING_PROGRESS", "SET_DOCUMENT_LOADED", "CLOSE_DOCUMENT", "SET_ACTIVE_DOCUMENT", "SET_DOCUMENT_ERROR", "RETRY_LOADING_DOCUMENT", "REFRESH_DOCUMENT", "REFRESH_PAGES", "SET_PAGES", "SET_SCALE", "SET_ROTATION", "SET_DEFAULT_SCALE", "SET_DEFAULT_ROTATION", "REORDER_DOCUMENTS", "MOVE_DOCUMENT", "UPDATE_DOCUMENT_SECURITY"];
export interface StartLoadingDocumentAction {
    type: typeof START_LOADING_DOCUMENT;
    payload: {
        documentId: string;
        name?: string;
        scale?: number;
        rotation?: Rotation;
        passwordProvided?: boolean;
        autoActivate?: boolean;
        permissions?: PermissionConfig;
    };
}
export interface UpdateDocumentLoadingProgressAction {
    type: typeof UPDATE_DOCUMENT_LOADING_PROGRESS;
    payload: {
        documentId: string;
        progress: number;
    };
}
export interface SetDocumentLoadedAction {
    type: typeof SET_DOCUMENT_LOADED;
    payload: {
        documentId: string;
        document: PdfDocumentObject;
    };
}
export interface SetDocumentErrorAction {
    type: typeof SET_DOCUMENT_ERROR;
    payload: {
        documentId: string;
        error: string;
        errorCode?: PdfErrorCode;
        errorDetails?: any;
    };
}
export interface RetryLoadingDocumentAction {
    type: typeof RETRY_LOADING_DOCUMENT;
    payload: {
        documentId: string;
        passwordProvided?: boolean;
    };
}
export interface CloseDocumentAction {
    type: typeof CLOSE_DOCUMENT;
    payload: {
        documentId: string;
        nextActiveDocumentId?: string | null;
    };
}
export interface SetActiveDocumentAction {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface ReorderDocumentsAction {
    type: typeof REORDER_DOCUMENTS;
    payload: string[];
}
export interface MoveDocumentAction {
    type: typeof MOVE_DOCUMENT;
    payload: {
        documentId: string;
        toIndex: number;
    };
}
export interface UpdateDocumentSecurityAction {
    type: typeof UPDATE_DOCUMENT_SECURITY;
    payload: {
        documentId: string;
        permissions: number;
        isOwnerUnlocked: boolean;
    };
}
export interface RefreshDocumentAction {
    type: typeof REFRESH_DOCUMENT;
    payload: {
        documentId: string;
        document: PdfDocumentObject;
    };
}
export interface RefreshPagesAction {
    type: typeof REFRESH_PAGES;
    payload: {
        documentId: string;
        pageIndexes: number[];
    };
}
export interface SetPagesAction {
    type: typeof SET_PAGES;
    payload: {
        documentId: string;
        pages: PdfPageObject[][];
    };
}
export interface SetScaleAction {
    type: typeof SET_SCALE;
    payload: {
        documentId?: string;
        scale: number;
    };
}
export interface SetRotationAction {
    type: typeof SET_ROTATION;
    payload: {
        documentId?: string;
        rotation: Rotation;
    };
}
export interface SetDefaultScaleAction {
    type: typeof SET_DEFAULT_SCALE;
    payload: number;
}
export interface SetDefaultRotationAction {
    type: typeof SET_DEFAULT_ROTATION;
    payload: Rotation;
}
export type DocumentAction = StartLoadingDocumentAction | UpdateDocumentLoadingProgressAction | SetDocumentLoadedAction | SetDocumentErrorAction | RetryLoadingDocumentAction | CloseDocumentAction | SetActiveDocumentAction | RefreshDocumentAction | RefreshPagesAction | SetPagesAction | SetScaleAction | SetRotationAction | SetDefaultScaleAction | SetDefaultRotationAction | ReorderDocumentsAction | MoveDocumentAction | UpdateDocumentSecurityAction;
export type CoreAction = DocumentAction;
export declare const startLoadingDocument: (documentId: string, name?: string, scale?: number, rotation?: Rotation, passwordProvided?: boolean, autoActivate?: boolean, permissions?: PermissionConfig) => CoreAction;
export declare const updateDocumentLoadingProgress: (documentId: string, progress: number) => CoreAction;
export declare const setDocumentLoaded: (documentId: string, document: PdfDocumentObject) => CoreAction;
export declare const setDocumentError: (documentId: string, error: string, errorCode?: PdfErrorCode, errorDetails?: any) => CoreAction;
export declare const retryLoadingDocument: (documentId: string, passwordProvided?: boolean) => CoreAction;
export declare const closeDocument: (documentId: string, nextActiveDocumentId?: string | null) => CoreAction;
export declare const setActiveDocument: (documentId: string | null) => CoreAction;
export declare const refreshDocument: (documentId: string, document: PdfDocumentObject) => CoreAction;
export declare const refreshPages: (documentId: string, pageIndexes: number[]) => CoreAction;
export declare const setPages: (documentId: string, pages: PdfPageObject[][]) => CoreAction;
export declare const setScale: (scale: number, documentId?: string) => CoreAction;
export declare const setRotation: (rotation: Rotation, documentId?: string) => CoreAction;
export declare const setDefaultScale: (scale: number) => CoreAction;
export declare const setDefaultRotation: (rotation: Rotation) => CoreAction;
export declare const reorderDocuments: (order: string[]) => CoreAction;
export declare const moveDocument: (documentId: string, toIndex: number) => CoreAction;
export declare const updateDocumentSecurity: (documentId: string, permissions: number, isOwnerUnlocked: boolean) => CoreAction;
