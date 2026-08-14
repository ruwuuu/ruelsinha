import { MaybeRefOrGetter } from 'vue';
import { ZoomPlugin } from '../../lib/index.ts';
export declare const useZoomCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').ZoomCapability>>;
export declare const useZoomPlugin: () => import('@embedpdf/core/vue').PluginState<ZoomPlugin>;
/**
 * Hook for zoom state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useZoom: (documentId: MaybeRefOrGetter<string>) => {
    state: Readonly<import('vue').Ref<{
        readonly zoomLevel: import('../../lib/index.ts').ZoomLevel;
        readonly currentZoomLevel: number;
        readonly isMarqueeZoomActive: boolean;
    }, {
        readonly zoomLevel: import('../../lib/index.ts').ZoomLevel;
        readonly currentZoomLevel: number;
        readonly isMarqueeZoomActive: boolean;
    }>>;
    provides: import('vue').ComputedRef<import('../../lib/index.ts').ZoomScope | null>;
};
