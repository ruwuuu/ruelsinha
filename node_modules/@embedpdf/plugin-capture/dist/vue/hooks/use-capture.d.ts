import { CapturePlugin, CaptureDocumentState } from '../../lib/index.ts';
import { MaybeRefOrGetter } from 'vue';
export declare const useCaptureCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').CaptureCapability>>;
export declare const useCapturePlugin: () => import('@embedpdf/core/vue').PluginState<CapturePlugin>;
/**
 * Hook for capture state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useCapture: (documentId: MaybeRefOrGetter<string>) => {
    state: import('vue').Ref<{
        isMarqueeCaptureActive: boolean;
    }, CaptureDocumentState | {
        isMarqueeCaptureActive: boolean;
    }>;
    provides: import('vue').ComputedRef<import('../../lib/index.ts').CaptureScope | null>;
};
