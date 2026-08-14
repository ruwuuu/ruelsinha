import { SelectionMenuRenderFn } from '../../react/utils.ts';
/**
 * Creates a render function for a selection menu from the schema
 *
 * @param menuId - The selection menu ID from schema
 * @param documentId - Document ID
 * @returns A render function compatible with layer selectionMenu props
 */
export declare function useSelectionMenu<TContext extends {
    type: string;
}>(menuId: string, documentId: string): SelectionMenuRenderFn<TContext> | undefined;
