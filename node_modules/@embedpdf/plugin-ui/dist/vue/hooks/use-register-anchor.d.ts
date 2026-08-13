import { MaybeRefOrGetter } from 'vue';
/**
 * Register a DOM element as an anchor for menus
 *
 * @param documentId - Document ID (can be ref, computed, getter, or plain value)
 * @param itemId - Item ID (can be ref, computed, getter, or plain value)
 * @returns Ref callback to attach to the element (use with :ref="anchorRef")
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const anchorRef = useRegisterAnchor(() => props.documentId, () => props.itemId);
 * </script>
 *
 * <template>
 *   <button :ref="anchorRef">Zoom</button>
 * </template>
 * ```
 */
export declare function useRegisterAnchor(documentId: MaybeRefOrGetter<string>, itemId: MaybeRefOrGetter<string>): (el: any) => void;
