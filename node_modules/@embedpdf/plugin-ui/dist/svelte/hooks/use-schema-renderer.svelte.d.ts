/**
 * High-level hook for rendering UI from schema
 *
 * Provides information about active toolbars, sidebars, and modals.
 * Always includes isOpen state so renderers can control animations.
 *
 * Use with Svelte's component binding to render toolbars and sidebars.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const { getToolbarInfo, getSidebarInfo, getModalInfo } = useSchemaRenderer(() => documentId);
 *
 *   const topMainToolbar = $derived(getToolbarInfo('top', 'main'));
 *   const leftMainSidebar = $derived(getSidebarInfo('left', 'main'));
 *   const modal = $derived(getModalInfo());
 * </script>
 *
 * {#if topMainToolbar}
 *   {@const ToolbarRenderer = topMainToolbar.renderer}
 *   <ToolbarRenderer
 *     schema={topMainToolbar.schema}
 *     documentId={topMainToolbar.documentId}
 *     isOpen={topMainToolbar.isOpen}
 *     onClose={topMainToolbar.onClose}
 *   />
 * {/if}
 * ```
 */
export declare function useSchemaRenderer(getDocumentId: () => string | null): {
    /**
     * Get toolbar information by placement and slot
     *
     * @param placement - 'top' | 'bottom' | 'left' | 'right'
     * @param slot - Slot name (e.g. 'main', 'secondary')
     * @returns Toolbar info or null if no toolbar in slot
     */
    getToolbarInfo: (placement: "top" | "bottom" | "left" | "right", slot: string) => {
        renderer: import('..').ToolbarRenderer;
        schema: import('../../lib').ToolbarSchema;
        documentId: string;
        isOpen: boolean;
        onClose: (() => void) | undefined;
    } | null;
    /**
     * Get sidebar information by placement and slot
     *
     * @param placement - 'left' | 'right' | 'top' | 'bottom'
     * @param slot - Slot name (e.g. 'main', 'secondary', 'inspector')
     * @returns Sidebar info or null if no sidebar in slot
     */
    getSidebarInfo: (placement: "left" | "right" | "top" | "bottom", slot: string) => {
        renderer: import('..').SidebarRenderer;
        schema: import('../../lib').SidebarSchema;
        documentId: string;
        isOpen: boolean;
        onClose: () => void;
        sidebarProps: Record<string, unknown> | undefined;
    } | null;
    /**
     * Get modal information (if active)
     *
     * Supports animation lifecycle:
     * - isOpen: true = visible
     * - isOpen: false = animate out (modal still rendered)
     * - onExited called after animation → modal removed
     *
     * @returns Modal info or null if no modal active
     */
    getModalInfo: () => {
        renderer: import('..').ModalRenderer;
        schema: import('../../lib').ModalSchema;
        documentId: string;
        isOpen: boolean;
        onClose: () => void;
        onExited: () => void;
        modalProps: Record<string, unknown> | undefined;
    } | null;
    /**
     * Helper: Get all active toolbars for this document
     * Useful for batch rendering or debugging
     */
    getActiveToolbars: () => {
        placement: string;
        slot: string;
        toolbarId: string;
        isOpen: boolean;
    }[];
    /**
     * Helper: Get all active sidebars for this document
     * Useful for batch rendering or debugging
     */
    getActiveSidebars: () => {
        placement: string;
        slot: string;
        sidebarId: string;
        isOpen: boolean;
    }[];
    /**
     * Get overlay information for all enabled overlays
     *
     * Overlays are floating components positioned over the document content.
     * Unlike modals, multiple overlays can be visible and they don't block interaction.
     * Overlay visibility is controlled by the enabledOverlays state.
     *
     * @example
     * ```svelte
     * <script lang="ts">
     *   const { getOverlaysInfo } = useSchemaRenderer(() => documentId);
     *   const overlays = $derived(getOverlaysInfo());
     * </script>
     *
     * {#each overlays as overlay (overlay.schema.id)}
     *   {@const OverlayRenderer = overlay.renderer}
     *   <OverlayRenderer schema={overlay.schema} documentId={overlay.documentId} />
     * {/each}
     * ```
     */
    getOverlaysInfo: () => {
        renderer: import('..').OverlayRenderer;
        schema: import('../../lib').OverlaySchema;
        documentId: string;
    }[];
};
