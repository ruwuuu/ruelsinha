import { ZoomDocumentState, ZoomPlugin } from '../../lib/index.ts';
export declare const useZoomCapability: () => {
    provides: Readonly<import('../../lib/index.ts').ZoomCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useZoomPlugin: () => {
    plugin: ZoomPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for zoom state for a specific document
 * @param documentId Document ID
 */
export declare const useZoom: (documentId: string) => {
    state: ZoomDocumentState;
    provides: import('../../lib/index.ts').ZoomScope | null;
};
