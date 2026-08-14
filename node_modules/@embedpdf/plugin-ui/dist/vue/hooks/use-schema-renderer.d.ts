import { VNode, MaybeRefOrGetter } from 'vue';
/**
 * High-level composable for rendering UI from schema
 *
 * Provides simple functions to render toolbars, sidebars, and modals.
 * Always passes isOpen state to renderers so they can control animations.
 *
 * Automatically subscribes to UI state changes for the given document.
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare function useSchemaRenderer(documentId: MaybeRefOrGetter<string>): {
    /**
     * Render a toolbar by placement and slot
     *
     * Always renders with isOpen state when toolbar exists in slot.
     *
     * @param placement - 'top' | 'bottom' | 'left' | 'right'
     * @param slot - Slot name (e.g. 'main', 'secondary')
     *
     * @example
     * ```vue
     * <component :is="renderToolbar('top', 'main')" />
     * <component :is="renderToolbar('top', 'secondary')" />
     * ```
     */
    renderToolbar: (placement: "top" | "bottom" | "left" | "right", slot: string) => VNode | null;
    /**
     * Render a sidebar by placement and slot
     *
     * ALWAYS renders (when sidebar exists in slot) with isOpen state.
     * Your renderer controls whether to display or animate.
     *
     * @param placement - 'left' | 'right' | 'top' | 'bottom'
     * @param slot - Slot name (e.g. 'main', 'secondary', 'inspector')
     *
     * @example
     * ```vue
     * <component :is="renderSidebar('left', 'main')" />
     * <component :is="renderSidebar('right', 'main')" />
     * ```
     */
    renderSidebar: (placement: "left" | "right" | "top" | "bottom", slot: string) => VNode | null;
    /**
     * Render the active modal (if any)
     *
     * Only one modal can be active at a time.
     * Modals are defined in schema.modals.
     *
     * Supports animation lifecycle:
     * - isOpen: true = visible
     * - isOpen: false = animate out (modal still rendered)
     * - onExited called after animation → modal removed
     *
     * @example
     * ```vue
     * <component :is="renderModal()" />
     * ```
     */
    renderModal: () => VNode | null;
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
     * Render all enabled overlays
     *
     * Overlays are floating components positioned over the document content.
     * Unlike modals, multiple overlays can be visible and they don't block interaction.
     * Overlay visibility is controlled by the enabledOverlays state.
     *
     * @example
     * ```vue
     * <div class="relative">
     *   <slot />
     *   <component :is="renderOverlays()" />
     * </div>
     * ```
     */
    renderOverlays: () => VNode[] | null;
};
