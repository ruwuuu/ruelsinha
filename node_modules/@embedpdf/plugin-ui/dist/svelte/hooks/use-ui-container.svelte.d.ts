export interface UIContainerContextValue {
    /** Get the container element (may be null if not mounted) */
    getContainer: () => HTMLDivElement | null;
}
/**
 * Set up the container context (called by UIRoot)
 */
export declare function setUIContainerContext(value: UIContainerContextValue): void;
/**
 * Hook to access the UI container element.
 *
 * This provides access to the UIRoot container for:
 * - Container query based responsiveness
 * - Portaling elements to the root
 * - Measuring container dimensions
 *
 * @example
 * ```svelte
 * <script>
 *   import { useUIContainer } from '@embedpdf/plugin-ui/svelte';
 *   import { onMount, onDestroy } from 'svelte';
 *
 *   const { getContainer } = useUIContainer();
 *
 *   let observer;
 *
 *   onMount(() => {
 *     const container = getContainer();
 *     if (!container) return;
 *
 *     observer = new ResizeObserver(() => {
 *       console.log('Container width:', container.clientWidth);
 *     });
 *     observer.observe(container);
 *   });
 *
 *   onDestroy(() => observer?.disconnect());
 * </script>
 * ```
 */
export declare function useUIContainer(): UIContainerContextValue;
