import { DocumentState } from '@embedpdf/core';
import { DocumentManagerPlugin } from '../../lib/index.ts';
import { MaybeRefOrGetter } from 'vue';
export declare const useDocumentManagerPlugin: () => import('@embedpdf/core/vue').PluginState<DocumentManagerPlugin>;
export declare const useDocumentManagerCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').DocumentManagerCapability>>;
/**
 * Hook for active document state
 */
export declare function useActiveDocument(): {
    activeDocumentId: import('vue').ComputedRef<string | null>;
    activeDocument: import('vue').ComputedRef<DocumentState | null>;
};
/**
 * Hook for all open documents (in order)
 * @param getDocumentIds Optional getter function, ref, or array of specific document IDs to filter/order by
 */
export declare function useOpenDocuments(getDocumentIds?: MaybeRefOrGetter<string[] | undefined>): import('vue').ComputedRef<DocumentState[]>;
