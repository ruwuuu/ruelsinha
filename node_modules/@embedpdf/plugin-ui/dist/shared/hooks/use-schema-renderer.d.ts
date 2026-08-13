/**
 * High-level hook for rendering UI from schema
 *
 * Provides simple functions to render toolbars, sidebars, and modals.
 * Always passes isOpen state to renderers so they can control animations.
 *
 * Automatically subscribes to UI state changes for the given document.
 */
export declare function useSchemaRenderer(documentId: string): {
    /**
     * Render a toolbar by placement and slot
     *
     * Always renders with isOpen state when toolbar exists in slot.
     *
     * @param placement - 'top' | 'bottom' | 'left' | 'right'
     * @param slot - Slot name (e.g. 'main', 'secondary')
     *
     * @example
     * ```tsx
     * {renderToolbar('top', 'main')}
     * {renderToolbar('top', 'secondary')}
     * ```
     */
    renderToolbar: (placement: "top" | "bottom" | "left" | "right", slot: string) => import("react/jsx-runtime").JSX.Element | null;
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
     * ```tsx
     * {renderSidebar('left', 'main')}
     * {renderSidebar('right', 'main')}
     * ```
     */
    renderSidebar: (placement: "left" | "right" | "top" | "bottom", slot: string) => import("react/jsx-runtime").JSX.Element | null;
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
     * ```tsx
     * {renderModal()}
     * ```
     */
    renderModal: () => import("react/jsx-runtime").JSX.Element | null;
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
     * ```tsx
     * <div className="relative">
     *   {children}
     *   {renderOverlays()}
     * </div>
     * ```
     */
    renderOverlays: () => import("react/jsx-runtime").JSX.Element | null;
};
