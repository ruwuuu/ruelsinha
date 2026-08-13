import { MaybeRefOrGetter } from 'vue';
import { ExportPlugin } from '../../lib/index.ts';
export declare const useExportPlugin: () => import('@embedpdf/core/vue').PluginState<ExportPlugin>;
export declare const useExportCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').ExportCapability>>;
/**
 * Hook for export capability for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useExport: (documentId: MaybeRefOrGetter<string>) => {
    provides: import('vue').ComputedRef<import('../../lib/index.ts').ExportScope | null>;
};
