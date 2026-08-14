type DoublePressOptions = {
    delay?: number;
    tolerancePx?: number;
};
type DoubleHandler = ((e: PointerEvent | MouseEvent) => void) | undefined;
type DoubleProps = {
    onDblclick?: (e: MouseEvent) => void;
    onPointerupCapture?: (e: PointerEvent) => void;
};
/**
 * Vue composable for handling double-press/double-tap interactions.
 *
 * @param onDouble - Callback to invoke on double press/tap
 * @param options - Configuration for delay and spatial tolerance
 * @returns Event handler props to be spread on an element with v-bind
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDoublePressProps } from '@embedpdf/utils/vue';
 *
 * const handleDoubleClick = (e) => {
 *   console.log('Double clicked!');
 * };
 *
 * const doubleProps = useDoublePressProps(handleDoubleClick);
 * </script>
 *
 * <template>
 *   <div v-bind="doubleProps">
 *     Double click/tap me
 *   </div>
 * </template>
 * ```
 */
export declare function useDoublePressProps(onDouble?: DoubleHandler, { delay, tolerancePx }?: DoublePressOptions): DoubleProps;
export {};
