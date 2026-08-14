import { MaybeRefOrGetter } from 'vue';
import { AnnotationPlugin, AnnotationDocumentState } from '../../lib';
export declare const useAnnotationPlugin: () => import('@embedpdf/core/vue').PluginState<AnnotationPlugin>;
export declare const useAnnotationCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib').AnnotationCapability<import('../../lib').AnnotationToolMap>>>;
/**
 * Hook for annotation state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useAnnotation: (documentId: MaybeRefOrGetter<string>) => {
    state: import('vue').Ref<{
        pages: Record<number, string[]>;
        byUid: Record<string, import('../../lib').TrackedAnnotation>;
        selectedUids: string[];
        selectedUid: string | null;
        activeToolId: string | null;
        activeToolContext?: Record<string, unknown> | undefined;
        hasPendingChanges: boolean;
        locked: {
            type: import("@embedpdf/plugin-annotation").LockModeType.None;
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.All;
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.Include;
            categories: string[];
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.Exclude;
            categories: string[];
        };
    }, AnnotationDocumentState | {
        pages: Record<number, string[]>;
        byUid: Record<string, import('../../lib').TrackedAnnotation>;
        selectedUids: string[];
        selectedUid: string | null;
        activeToolId: string | null;
        activeToolContext?: Record<string, unknown> | undefined;
        hasPendingChanges: boolean;
        locked: {
            type: import("@embedpdf/plugin-annotation").LockModeType.None;
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.All;
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.Include;
            categories: string[];
        } | {
            type: import("@embedpdf/plugin-annotation").LockModeType.Exclude;
            categories: string[];
        };
    }>;
    provides: import('vue').ComputedRef<import('../../lib').AnnotationScope<import('../../lib').AnnotationToolMap> | null>;
};
