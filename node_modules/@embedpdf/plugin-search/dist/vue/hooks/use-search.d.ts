import { MaybeRefOrGetter, Ref, ComputedRef } from 'vue';
import { SearchPlugin, SearchDocumentState, SearchScope } from '../../lib/index.ts';
export declare const useSearchPlugin: () => import('@embedpdf/core/vue').PluginState<SearchPlugin>;
export declare const useSearchCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').SearchCapability>>;
/**
 * Hook for search state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useSearch: (documentId: MaybeRefOrGetter<string>) => {
    state: Ref<SearchDocumentState>;
    provides: ComputedRef<SearchScope | null>;
};
