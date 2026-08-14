import { MaybeRefOrGetter } from 'vue';
import { ScrollActivity, ViewportPlugin } from '../../lib/index.ts';
export declare const useViewportPlugin: () => import('@embedpdf/core/vue').PluginState<ViewportPlugin>;
export declare const useViewportCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').ViewportCapability>>;
/**
 * Hook to get the gated state of the viewport for a specific document.
 * The viewport children are not rendered when gated.
 * @param documentId Document ID (can be ref, computed, getter, or plain value).
 */
export declare const useIsViewportGated: (documentId: MaybeRefOrGetter<string>) => import('vue').Ref<boolean, boolean>;
/**
 * Hook to get scroll activity for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value).
 */
export declare const useViewportScrollActivity: (documentId: MaybeRefOrGetter<string>) => import('vue').Ref<{
    isSmoothScrolling: boolean;
    isScrolling: boolean;
}, ScrollActivity | {
    isSmoothScrolling: boolean;
    isScrolling: boolean;
}>;
