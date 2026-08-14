import { MaybeRefOrGetter } from 'vue';
import { PanPlugin } from '../../lib/index.ts';
export declare const usePanPlugin: () => import('@embedpdf/core/vue').PluginState<PanPlugin>;
export declare const usePanCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').PanCapability>>;
/**
 * Hook for pan state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const usePan: (documentId: MaybeRefOrGetter<string>) => {
    provides: import('vue').ComputedRef<import('../../lib/index.ts').PanScope | null>;
    isPanning: Readonly<import('vue').Ref<boolean, boolean>>;
};
