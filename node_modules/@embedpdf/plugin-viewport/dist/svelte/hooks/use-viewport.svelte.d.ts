import { ScrollActivity, ViewportPlugin } from '../../lib/index.ts';
export declare const useViewportPlugin: () => {
    plugin: ViewportPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useViewportCapability: () => {
    provides: Readonly<import('../../lib/index.ts').ViewportCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the gated state of the viewport for a specific document.
 * The viewport children are not rendered when gated.
 * @param getDocumentId Function that returns the document ID
 */
export declare const useIsViewportGated: (getDocumentId: () => string | null) => {
    readonly current: boolean;
};
/**
 * Hook to get scroll activity for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useViewportScrollActivity: (getDocumentId: () => string | null) => {
    readonly current: ScrollActivity;
};
