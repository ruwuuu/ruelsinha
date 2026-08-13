/**
 * Helper utilities for building renderers
 */
export declare function useItemRenderer(): {
    /**
     * Render a custom component by ID
     *
     * @param componentId - Component ID from schema
     * @param documentId - Document ID
     * @param props - Additional props to pass to component
     * @returns Rendered component or null if not found
     */
    renderCustomComponent: (componentId: string, documentId: string, props?: any) => import("preact").JSX.Element | null;
};
