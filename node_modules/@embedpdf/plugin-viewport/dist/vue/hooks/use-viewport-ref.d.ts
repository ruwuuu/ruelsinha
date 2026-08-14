import { MaybeRefOrGetter } from 'vue';
/**
 * Hook to get a ref for the viewport container element with automatic setup/teardown
 * @param documentId Document ID (can be ref, computed, getter, or plain value).
 */
export declare function useViewportRef(documentId: MaybeRefOrGetter<string>): import('vue').Ref<HTMLDivElement | null, HTMLDivElement | null>;
