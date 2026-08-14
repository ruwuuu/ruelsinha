import { MaybeRefOrGetter, ComputedRef } from 'vue';
import { ScrollPlugin, ScrollScope } from '../../lib/index.ts';
export declare const useScrollPlugin: () => import('@embedpdf/core/vue').PluginState<ScrollPlugin>;
export declare const useScrollCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').ScrollCapability>>;
interface UseScrollReturn {
    provides: ComputedRef<ScrollScope | null>;
    state: ComputedRef<{
        currentPage: number;
        totalPages: number;
    }>;
}
/**
 * Hook for scroll state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare function useScroll(documentId: MaybeRefOrGetter<string>): UseScrollReturn;
export {};
