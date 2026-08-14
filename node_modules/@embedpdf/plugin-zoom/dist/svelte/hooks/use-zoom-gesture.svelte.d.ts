import { ZoomGestureOptions } from '../../shared-svelte/utils/zoom-gesture-logic';
export type { ZoomGestureOptions };
export interface UseZoomGestureOptions {
    /** Enable pinch-to-zoom gesture (default: true) */
    enablePinch?: () => boolean;
    /** Enable wheel zoom with ctrl/cmd key (default: true) */
    enableWheel?: () => boolean;
}
/**
 * Hook for setting up zoom gesture functionality (pinch and wheel zoom) on an element
 * @param getDocumentId Function that returns the document ID
 * @param options Optional configuration for enabling/disabling gestures
 */
export declare function useZoomGesture(getDocumentId: () => string | null, options?: UseZoomGestureOptions): {
    elementRef: HTMLDivElement | null;
};
