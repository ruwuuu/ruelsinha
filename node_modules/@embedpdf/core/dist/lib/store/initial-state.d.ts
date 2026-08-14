import { PdfDocumentObject, PdfErrorCode, Rotation } from '@embedpdf/models';
import { PluginRegistryConfig } from '../types/plugin';
import { PermissionConfig } from '../types/permissions';
export type DocumentStatus = 'loading' | 'loaded' | 'error';
export interface DocumentState {
    id: string;
    name?: string;
    status: DocumentStatus;
    loadingProgress?: number;
    error: string | null;
    errorCode?: PdfErrorCode;
    errorDetails?: any;
    passwordProvided?: boolean;
    document: PdfDocumentObject | null;
    scale: number;
    rotation: Rotation;
    pageRefreshVersions: Record<number, number>;
    permissions?: PermissionConfig;
    loadStartedAt: number;
    loadedAt?: number;
}
export interface CoreState {
    documents: Record<string, DocumentState>;
    documentOrder: string[];
    activeDocumentId: string | null;
    defaultScale: number;
    defaultRotation: Rotation;
    /** Global permission configuration applied to all documents unless overridden per-document */
    globalPermissions?: PermissionConfig;
}
export declare const initialCoreState: (config?: PluginRegistryConfig) => CoreState;
