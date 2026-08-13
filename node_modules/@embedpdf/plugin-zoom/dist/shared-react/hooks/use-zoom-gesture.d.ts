import { ZoomGestureOptions } from '../utils/zoom-gesture-logic';
export type { ZoomGestureOptions };
export declare function useZoomGesture(documentId: string, options?: ZoomGestureOptions): {
    elementRef: import('react').RefObject<HTMLDivElement>;
};
