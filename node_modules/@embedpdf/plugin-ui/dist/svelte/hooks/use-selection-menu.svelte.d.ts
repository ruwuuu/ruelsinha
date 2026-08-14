import { SelectionMenuRenderFn } from '@embedpdf/utils/svelte';
/**
 * Hook for schema-driven selection menus
 */
export declare function useSelectionMenu<TContext extends {
    type: string;
}>(menuId: string | (() => string), getDocumentId: () => string): {
    readonly renderFn: SelectionMenuRenderFn<TContext> | undefined;
};
