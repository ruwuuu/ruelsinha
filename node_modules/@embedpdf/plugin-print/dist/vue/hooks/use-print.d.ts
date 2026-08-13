import { PrintPlugin } from '../../lib/index.ts';
import { MaybeRefOrGetter } from 'vue';
export declare const usePrintPlugin: () => import('@embedpdf/core/vue').PluginState<PrintPlugin>;
export declare const usePrintCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').PrintCapability>>;
/**
 * Hook for print capability for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const usePrint: (documentId: MaybeRefOrGetter<string>) => {
    provides: import('vue').ComputedRef<import('../../lib/index.ts').PrintScope | null>;
};
