import { DocumentManagerPlugin } from '../../lib/index.ts';
import { DocumentState } from '@embedpdf/core';
export declare const useDocumentManagerPlugin: () => {
    plugin: DocumentManagerPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useDocumentManagerCapability: () => {
    provides: Readonly<import('../../lib/index.ts').DocumentManagerCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for active document state
 */
export declare function useActiveDocument(): {
    readonly activeDocumentId: string | null;
    readonly activeDocument: DocumentState | null;
};
/**
 * Hook for all open documents (in order)
 * @param getDocumentIds Optional getter function for specific document IDs to filter/order by
 */
export declare function useOpenDocuments(getDocumentIds?: () => string[] | undefined): {
    readonly current: DocumentState[];
};
