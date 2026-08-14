import { DocumentManagerPlugin } from '../../index.ts';
import { DocumentState } from '@embedpdf/core';
export declare const useDocumentManagerPlugin: () => {
    plugin: DocumentManagerPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useDocumentManagerCapability: () => {
    provides: Readonly<import('../../index.ts').DocumentManagerCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for active document state
 */
export declare const useActiveDocument: () => {
    activeDocumentId: string | null;
    activeDocument: DocumentState | null;
};
/**
 * Hook for all open documents (in order)
 */
export declare const useOpenDocuments: (documentIds?: string[]) => DocumentState[];
