/**
 * Register a DOM element as an anchor for menus
 *
 * @param getDocumentId - Function returning document ID
 * @param getItemId - Function returning item ID (typically matches the toolbar/menu item ID)
 * @returns Function to attach to the element via use:action
 *
 * @example
 *
 * <script lang="ts">
 *   const registerAnchor = useRegisterAnchor(() => documentId, () => 'zoom-button');
 * </script>
 *
 * <button use:registerAnchor>Zoom</button>
 *  */
export declare function useRegisterAnchor(getDocumentId: () => string | null, getItemId: () => string): (element: HTMLElement) => {
    destroy(): void;
};
