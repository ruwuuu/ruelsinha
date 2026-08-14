/**
 * Hook that provides reactive access to a specific document's state from the core store.
 *
 * @param getDocumentId Function that returns the document ID
 * @returns The reactive DocumentState object or null if not found.
 */
export declare function useDocumentState(getDocumentId: () => string | null): {
    readonly current: import('../../lib/index.ts').DocumentState | null;
};
