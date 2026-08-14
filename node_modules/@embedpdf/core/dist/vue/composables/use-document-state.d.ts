import { MaybeRefOrGetter } from 'vue';
/**
 * Hook that provides reactive access to a specific document's state from the core store.
 *
 * @param documentId The ID of the document to retrieve (can be ref, computed, getter, or plain value).
 * @returns A computed ref containing the DocumentState object or null if not found.
 */
export declare function useDocumentState(documentId: MaybeRefOrGetter<string | null>): import('vue').ComputedRef<import('../../lib/index.ts').DocumentState | null>;
