/**
 * Helper utilities for building renderers
 */
export declare function useItemRenderer(): {
    /**
     * Get a custom component by ID
     *
     * @param componentId - Component ID from schema
     * @returns Component constructor or undefined if not found
     *
     * @example
     * ```svelte
     * <script lang="ts">
     *   const { getCustomComponent } = useItemRenderer();
     *   const MyComponent = getCustomComponent('my-component-id');
     * </script>
     *
     * {#if MyComponent}
     *   <MyComponent {documentId} {...props} />
     * {/if}
     * ```
     */
    getCustomComponent: (componentId: string) => import('svelte').Component<import('..').BaseComponentProps, {}, string> | undefined;
};
