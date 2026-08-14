import { ZoomGestureOptions } from '../utils/pinch-zoom-logic';
export type { ZoomGestureOptions };
export declare function useZoomGesture(documentId: string, options?: ZoomGestureOptions): {
    elementRef: import('react').RefObject<HTMLDivElement>;
};
