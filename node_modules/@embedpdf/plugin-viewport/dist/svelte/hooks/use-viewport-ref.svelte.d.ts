/**
 * Hook to get a ref for the viewport container element with automatic setup/teardown
 * @param getDocumentId Function that returns the document ID
 */
export declare function useViewportRef(getDocumentId: () => string | null): {
    containerRef: HTMLDivElement | null;
};
