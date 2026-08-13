import { Ref, InjectionKey } from 'vue';
export interface UIContainerContextValue {
    /** Reference to the UIRoot container element */
    containerRef: Ref<HTMLDivElement | null>;
    /** Get the container element (may be null if not mounted) */
    getContainer: () => HTMLDivElement | null;
}
export declare const UI_CONTAINER_KEY: InjectionKey<UIContainerContextValue>;
/**
 * Hook to access the UI container element.
 *
 * This provides access to the UIRoot container for:
 * - Container query based responsiveness
 * - Portaling elements to the root
 * - Measuring container dimensions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useUIContainer } from '@embedpdf/plugin-ui/vue';
 * import { onMounted, onUnmounted } from 'vue';
 *
 * const { containerRef, getContainer } = useUIContainer();
 *
 * onMounted(() => {
 *   const container = getContainer();
 *   if (!container) return;
 *
 *   const observer = new ResizeObserver(() => {
 *     console.log('Container width:', container.clientWidth);
 *   });
 *   observer.observe(container);
 *
 *   onUnmounted(() => observer.disconnect());
 * });
 * </script>
 * ```
 */
export declare function useUIContainer(): UIContainerContextValue;
