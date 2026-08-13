import { MaybeRefOrGetter } from 'vue';
import { SpreadMode, SpreadPlugin } from '../../lib/index.ts';
export declare const useSpreadPlugin: () => import('@embedpdf/core/vue').PluginState<SpreadPlugin>;
export declare const useSpreadCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').SpreadCapability>>;
/**
 * Hook for spread state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useSpread: (documentId: MaybeRefOrGetter<string>) => {
    provides: import('vue').ComputedRef<import('../../lib/index.ts').SpreadScope | null>;
    spreadMode: Readonly<import('vue').Ref<SpreadMode, SpreadMode>>;
};
