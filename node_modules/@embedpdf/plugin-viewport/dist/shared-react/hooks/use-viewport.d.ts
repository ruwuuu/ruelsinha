import { RefObject } from '../../react/adapter.ts';
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
 * Hook to get the viewport DOM element ref from context.
 * Must be used within a Viewport component.
 */
export declare const useViewportElement: () => RefObject<HTMLDivElement> | null;
/**
 * Hook to get the gated state of the viewport for a specific document.
 * The viewport children are not rendered when gated.
 * @param documentId Document ID.
 */
export declare const useIsViewportGated: (documentId: string) => boolean;
/**
 * Hook to get scroll activity for a specific document
 * @param documentId Document ID.
 */
export declare const useViewportScrollActivity: (documentId: string) => ScrollActivity;
