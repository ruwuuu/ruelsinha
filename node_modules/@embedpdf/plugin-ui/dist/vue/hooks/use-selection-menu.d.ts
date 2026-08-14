import { MaybeRefOrGetter } from 'vue';
import { SelectionMenuRenderFn } from '@embedpdf/utils/vue';
/**
 * Creates a render function for a selection menu from the schema
 *
 * @param menuId - The selection menu ID from schema
 * @param documentId - Document ID (can be ref, computed, getter, or plain value)
 * @returns A computed ref containing the render function or undefined
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const annotationMenu = useSelectionMenu('annotation', () => props.documentId);
 * </script>
 *
 * <template>
 *   <AnnotationLayer
 *     :documentId="documentId"
 *     :selectionMenu="annotationMenu"
 *   />
 * </template>
 * ```
 */
export declare function useSelectionMenu<TContext extends {
    type: string;
} = {
    type: string;
}>(menuId: MaybeRefOrGetter<string>, documentId: MaybeRefOrGetter<string>): import('vue').ComputedRef<SelectionMenuRenderFn<TContext> | undefined>;
