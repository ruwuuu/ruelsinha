import { RefObject } from '../../preact/adapter.ts';
/**
 * Context to share the viewport DOM element reference with child components.
 * This allows child components (like ZoomGestureWrapper) to access the viewport
 * container element without DOM traversal.
 */
export declare const ViewportElementContext: import('preact').Context<RefObject<HTMLDivElement> | null>;
