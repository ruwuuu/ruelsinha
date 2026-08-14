import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { UISchema } from './schema';
import { StylesheetConfig } from './utils';
export * from './schema';
export interface UIPluginConfig extends BasePluginConfig {
    /** UI schema */
    schema: UISchema;
    /** Categories to disable at initialization */
    disabledCategories?: string[];
    /** Config for stylesheet generation */
    stylesheetConfig?: StylesheetConfig;
}
export interface UIState {
    documents: Record<string, UIDocumentState>;
    /** Globally disabled categories */
    disabledCategories: string[];
    /** Item IDs that are hidden (computed from disabled categories) */
    hiddenItems: string[];
}
/**
 * Toolbar slot state
 */
export interface ToolbarSlotState {
    toolbarId: string;
    isOpen: boolean;
}
/**
 * Sidebar slot state
 */
export interface SidebarSlotState {
    sidebarId: string;
    isOpen: boolean;
    props?: Record<string, unknown>;
}
/**
 * Modal slot state - supports animation lifecycle
 */
export interface ModalSlotState {
    modalId: string;
    isOpen: boolean;
    props?: Record<string, unknown>;
}
export interface UIDocumentState {
    activeToolbars: Record<string, ToolbarSlotState>;
    activeSidebars: Record<string, SidebarSlotState>;
    activeModal: ModalSlotState | null;
    openMenus: Record<string, OpenMenuState>;
    sidebarTabs: Record<string, string>;
    enabledOverlays: Record<string, boolean>;
}
/**
 * Responsive visibility rule for a single item at a specific breakpoint
 */
export interface ResponsiveVisibilityRule {
    breakpointId: string;
    minWidth?: number;
    maxWidth?: number;
    visible: boolean;
    priority: number;
}
/**
 * Computed responsive metadata for an item
 */
export interface ResponsiveItemMetadata {
    itemId: string;
    /** Always true for SSR/hydration - actual visibility controlled by CSS/styles */
    shouldRender: boolean;
    /** Ordered rules from lowest to highest breakpoint */
    visibilityRules: ResponsiveVisibilityRule[];
    /** Quick lookup: is visible at default/base size? */
    defaultVisible: boolean;
}
/**
 * Result of processing all responsive rules
 */
export interface ResponsiveMetadata {
    items: Map<string, ResponsiveItemMetadata>;
    breakpoints: Map<string, {
        minWidth?: number;
        maxWidth?: number;
    }>;
}
export interface ToolbarChangedData {
    placement: string;
    slot: string;
    toolbarId: string;
}
export interface ToolbarChangedEvent extends ToolbarChangedData {
    documentId: string;
}
export interface SidebarChangedData {
    placement: string;
    slot: string;
    sidebarId: string;
}
export interface SidebarChangedEvent extends SidebarChangedData {
    documentId: string;
}
export interface ModalChangedData {
    modalId: string | null;
    isOpen: boolean;
}
export interface ModalChangedEvent extends ModalChangedData {
    documentId: string;
}
export interface MenuChangedData {
    menuId: string;
    isOpen: boolean;
}
export interface MenuChangedEvent extends MenuChangedData {
    documentId: string;
}
export interface OverlayChangedData {
    overlayId: string;
    isEnabled: boolean;
}
export interface OverlayChangedEvent extends OverlayChangedData {
    documentId: string;
}
export interface OpenMenuState {
    menuId: string;
    triggeredByCommandId?: string;
    triggeredByItemId?: string;
}
export interface UIScope {
    setActiveToolbar(placement: string, slot: string, toolbarId: string): void;
    getActiveToolbar(placement: string, slot: string): string | null;
    closeToolbarSlot(placement: string, slot: string): void;
    isToolbarOpen(placement: string, slot: string, toolbarId?: string): boolean;
    setActiveSidebar(placement: string, slot: string, sidebarId: string, activeTab?: string, props?: Record<string, unknown>): void;
    getActiveSidebar(placement: string, slot: string): string | null;
    closeSidebarSlot(placement: string, slot: string): void;
    toggleSidebar(placement: string, slot: string, sidebarId: string, activeTab?: string, props?: Record<string, unknown>): void;
    setSidebarTab(sidebarId: string, tabId: string): void;
    getSidebarTab(sidebarId: string): string | null;
    isSidebarOpen(placement: string, slot: string, sidebarId?: string): boolean;
    openModal(modalId: string, props?: Record<string, unknown>): void;
    closeModal(): void;
    clearModal(): void;
    getActiveModal(): ModalSlotState | null;
    isModalOpen(): boolean;
    openMenu(menuId: string, triggeredByCommandId: string, triggeredByItemId: string): void;
    closeMenu(menuId: string): void;
    toggleMenu(menuId: string, triggeredByCommandId: string, triggeredByItemId: string): void;
    closeAllMenus(): void;
    isMenuOpen(menuId: string): boolean;
    getOpenMenus(): OpenMenuState[];
    enableOverlay(overlayId: string): void;
    disableOverlay(overlayId: string): void;
    toggleOverlay(overlayId: string): void;
    isOverlayEnabled(overlayId: string): boolean;
    getEnabledOverlays(): string[];
    getSchema(): UISchema;
    getState(): UIDocumentState;
    onToolbarChanged: EventHook<{
        placement: string;
        slot: string;
        toolbarId: string;
    }>;
    onSidebarChanged: EventHook<{
        placement: string;
        slot: string;
        sidebarId: string;
    }>;
    onModalChanged: EventHook<{
        modalId: string | null;
        isOpen: boolean;
    }>;
    onMenuChanged: EventHook<{
        menuId: string;
        isOpen: boolean;
    }>;
    onOverlayChanged: EventHook<{
        overlayId: string;
        isEnabled: boolean;
    }>;
}
export interface UICapability {
    setActiveToolbar(placement: string, slot: string, toolbarId: string, documentId?: string): void;
    setActiveSidebar(placement: string, slot: string, sidebarId: string, documentId?: string, activeTab?: string, props?: Record<string, unknown>): void;
    toggleSidebar(placement: string, slot: string, sidebarId: string, documentId?: string, activeTab?: string, props?: Record<string, unknown>): void;
    openModal(modalId: string, props?: Record<string, unknown>, documentId?: string): void;
    openMenu(menuId: string, triggeredByCommandId: string, triggeredByItemId: string, documentId?: string): void;
    toggleMenu(menuId: string, triggeredByCommandId: string, triggeredByItemId: string, documentId?: string): void;
    enableOverlay(overlayId: string, documentId?: string): void;
    disableOverlay(overlayId: string, documentId?: string): void;
    toggleOverlay(overlayId: string, documentId?: string): void;
    forDocument(documentId: string): UIScope;
    getSchema(): UISchema;
    mergeSchema(partial: Partial<UISchema>): void;
    disableCategory(category: string): void;
    enableCategory(category: string): void;
    toggleCategory(category: string): void;
    setDisabledCategories(categories: string[]): void;
    getDisabledCategories(): string[];
    isCategoryDisabled(category: string): boolean;
    getHiddenItems(): string[];
    onToolbarChanged: EventHook<{
        documentId: string;
        placement: string;
        slot: string;
        toolbarId: string;
    }>;
    onSidebarChanged: EventHook<{
        documentId: string;
        placement: string;
        slot: string;
        sidebarId: string;
    }>;
    onModalChanged: EventHook<{
        documentId: string;
        modalId: string | null;
        isOpen: boolean;
    }>;
    onMenuChanged: EventHook<{
        documentId: string;
        menuId: string;
        isOpen: boolean;
    }>;
    onOverlayChanged: EventHook<{
        documentId: string;
        overlayId: string;
        isEnabled: boolean;
    }>;
    onCategoryChanged: EventHook<{
        disabledCategories: string[];
        hiddenItems: string[];
    }>;
}
