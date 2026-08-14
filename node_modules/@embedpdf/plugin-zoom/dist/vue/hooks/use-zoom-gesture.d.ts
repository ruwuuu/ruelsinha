import { MaybeRefOrGetter, Ref } from 'vue';
import { ZoomGestureOptions } from '../../shared-vue/utils/zoom-gesture-logic';
export type { ZoomGestureOptions };
export interface UseZoomGestureOptions {
    /** Enable pinch-to-zoom gesture (default: true) */
    enablePinch?: MaybeRefOrGetter<boolean>;
    /** Enable wheel zoom with ctrl/cmd key (default: true) */
    enableWheel?: MaybeRefOrGetter<boolean>;
}
/**
 * Hook for setting up zoom gesture functionality (pinch and wheel zoom) on an element
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 * @param options Optional configuration for enabling/disabling gestures
 */
export declare function useZoomGesture(documentId: MaybeRefOrGetter<string>, options?: UseZoomGestureOptions): {
    elementRef: Ref<HTMLDivElement | null, HTMLDivElement | null>;
};
