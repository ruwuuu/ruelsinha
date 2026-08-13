import { MaybeRefOrGetter, ComputedRef, Ref } from 'vue';
import { RedactionPlugin, RedactionDocumentState, RedactionScope } from '../../lib';
export declare const useRedactionPlugin: () => import('@embedpdf/core/vue').PluginState<RedactionPlugin>;
export declare const useRedactionCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib').RedactionCapability>>;
/**
 * Hook for redaction state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useRedaction: (documentId: MaybeRefOrGetter<string>) => {
    state: Readonly<Ref<RedactionDocumentState>>;
    provides: ComputedRef<RedactionScope | null>;
};
