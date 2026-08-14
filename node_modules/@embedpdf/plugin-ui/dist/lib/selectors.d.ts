import { UIState, UIDocumentState, ToolbarSlotState, SidebarSlotState } from './types';
export type PluginsSlice = Record<string, any>;
export declare function selectUIState(plugins: PluginsSlice): UIState | null;
export declare function selectUIDocumentState(plugins: PluginsSlice, documentId: string): UIDocumentState | null;
export declare function selectToolbarSlot(plugins: PluginsSlice, documentId: string, placement: string, slot: string): ToolbarSlotState | null;
/**
 * Is a toolbar open in this slot?
 * If toolbarId is provided, also matches that specific toolbar.
 */
export declare function isToolbarOpen(plugins: PluginsSlice, documentId: string, placement: string, slot: string, toolbarId?: string): boolean;
export declare function selectSidebarSlot(plugins: PluginsSlice, documentId: string, placement: string, slot: string): SidebarSlotState | null;
/**
 * Is a sidebar open in this slot?
 * If sidebarId is provided, also matches that specific sidebar.
 */
export declare function isSidebarOpen(plugins: PluginsSlice, documentId: string, placement: string, slot: string, sidebarId?: string): boolean;
