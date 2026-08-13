import { ViewportCapability } from '@embedpdf/plugin-viewport';
import { ZoomCapability } from '../../index.ts';
export interface ZoomGestureOptions {
    /** Enable pinch-to-zoom gesture (default: true) */
    enablePinch?: boolean;
    /** Enable wheel zoom with ctrl/cmd key (default: true) */
    enableWheel?: boolean;
}
export interface ZoomGestureDeps {
    element: HTMLDivElement;
    /** Optional viewport container element for attaching events (from context) */
    container?: HTMLElement;
    documentId: string;
    viewportProvides: ViewportCapability;
    zoomProvides: ZoomCapability;
    options?: ZoomGestureOptions;
}
export declare function setupZoomGestures({ element, container, documentId, viewportProvides, zoomProvides, options, }: ZoomGestureDeps): () => void;
