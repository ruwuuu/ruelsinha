import { ZoomDocumentState, ZoomPlugin, ZoomScope } from '../../lib/index.ts';
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
interface UseZoomReturn {
    provides: ZoomScope | null;
    state: ZoomDocumentState;
}
/**
 * Hook for zoom state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useZoom: (getDocumentId: () => string | null) => UseZoomReturn;
export {};
