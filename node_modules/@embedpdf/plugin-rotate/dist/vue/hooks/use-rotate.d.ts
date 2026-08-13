import { MaybeRefOrGetter } from 'vue';
import { RotatePlugin } from '../../lib/index.ts';
import { Rotation } from '@embedpdf/models';
/**
 * Hook to get the raw rotate plugin instance.
 */
export declare const useRotatePlugin: () => import('@embedpdf/core/vue').PluginState<RotatePlugin>;
/**
 * Hook to get the rotate plugin's capability API.
 * This provides methods for rotating the document.
 */
export declare const useRotateCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').RotateCapability>>;
/**
 * Hook that provides reactive rotation state and methods for a specific document.
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useRotate: (documentId: MaybeRefOrGetter<string>) => {
    rotation: Readonly<import('vue').Ref<Rotation, Rotation>>;
    provides: import('vue').ComputedRef<import('../../lib/index.ts').RotateScope | null>;
};
