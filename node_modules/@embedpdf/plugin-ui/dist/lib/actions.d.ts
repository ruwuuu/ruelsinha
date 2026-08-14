import { Action } from '@embedpdf/core';
import { OpenMenuState, UISchema } from './types';
export declare const INIT_UI_STATE = "UI/INIT_STATE";
export declare const CLEANUP_UI_STATE = "UI/CLEANUP_STATE";
export declare const SET_ACTIVE_TOOLBAR = "UI/SET_ACTIVE_TOOLBAR";
export declare const CLOSE_TOOLBAR_SLOT = "UI/CLOSE_TOOLBAR_SLOT";
export declare const SET_ACTIVE_SIDEBAR = "UI/SET_ACTIVE_SIDEBAR";
export declare const CLOSE_SIDEBAR_SLOT = "UI/CLOSE_SIDEBAR_SLOT";
export declare const SET_SIDEBAR_TAB = "UI/SET_SIDEBAR_TAB";
export declare const OPEN_MODAL = "UI/OPEN_MODAL";
export declare const CLOSE_MODAL = "UI/CLOSE_MODAL";
export declare const CLEAR_MODAL = "UI/CLEAR_MODAL";
export declare const OPEN_MENU = "UI/OPEN_MENU";
export declare const CLOSE_MENU = "UI/CLOSE_MENU";
export declare const CLOSE_ALL_MENUS = "UI/CLOSE_ALL_MENUS";
export declare const SET_OVERLAY_ENABLED = "UI/SET_OVERLAY_ENABLED";
export declare const SET_DISABLED_CATEGORIES = "UI/SET_DISABLED_CATEGORIES";
export declare const SET_HIDDEN_ITEMS = "UI/SET_HIDDEN_ITEMS";
export interface InitUIStateAction extends Action {
    type: typeof INIT_UI_STATE;
    payload: {
        documentId: string;
        schema: UISchema;
    };
}
export interface CleanupUIStateAction extends Action {
    type: typeof CLEANUP_UI_STATE;
    payload: {
        documentId: string;
    };
}
export interface SetActiveToolbarAction extends Action {
    type: typeof SET_ACTIVE_TOOLBAR;
    payload: {
        documentId: string;
        placement: string;
        slot: string;
        toolbarId: string;
    };
}
export interface CloseToolbarSlotAction extends Action {
    type: typeof CLOSE_TOOLBAR_SLOT;
    payload: {
        documentId: string;
        placement: string;
        slot: string;
    };
}
export interface SetActiveSidebarAction extends Action {
    type: typeof SET_ACTIVE_SIDEBAR;
    payload: {
        documentId: string;
        placement: string;
        slot: string;
        sidebarId: string;
        activeTab?: string;
        props?: Record<string, unknown>;
    };
}
export interface CloseSidebarSlotAction extends Action {
    type: typeof CLOSE_SIDEBAR_SLOT;
    payload: {
        documentId: string;
        placement: string;
        slot: string;
    };
}
export interface SetSidebarTabAction extends Action {
    type: typeof SET_SIDEBAR_TAB;
    payload: {
        documentId: string;
        sidebarId: string;
        tabId: string;
    };
}
export interface OpenModalAction extends Action {
    type: typeof OPEN_MODAL;
    payload: {
        documentId: string;
        modalId: string;
        props?: Record<string, unknown>;
    };
}
export interface CloseModalAction extends Action {
    type: typeof CLOSE_MODAL;
    payload: {
        documentId: string;
    };
}
export interface ClearModalAction extends Action {
    type: typeof CLEAR_MODAL;
    payload: {
        documentId: string;
    };
}
export interface OpenMenuAction extends Action {
    type: typeof OPEN_MENU;
    payload: {
        documentId: string;
        menuState: OpenMenuState;
    };
}
export interface CloseMenuAction extends Action {
    type: typeof CLOSE_MENU;
    payload: {
        documentId: string;
        menuId: string;
    };
}
export interface CloseAllMenusAction extends Action {
    type: typeof CLOSE_ALL_MENUS;
    payload: {
        documentId: string;
    };
}
export interface SetOverlayEnabledAction extends Action {
    type: typeof SET_OVERLAY_ENABLED;
    payload: {
        documentId: string;
        overlayId: string;
        enabled: boolean;
    };
}
export interface SetDisabledCategoriesAction extends Action {
    type: typeof SET_DISABLED_CATEGORIES;
    payload: {
        categories: string[];
    };
}
export interface SetHiddenItemsAction extends Action {
    type: typeof SET_HIDDEN_ITEMS;
    payload: {
        hiddenItems: string[];
    };
}
export type UIAction = InitUIStateAction | CleanupUIStateAction | SetActiveToolbarAction | CloseToolbarSlotAction | SetActiveSidebarAction | CloseSidebarSlotAction | SetSidebarTabAction | OpenModalAction | CloseModalAction | ClearModalAction | OpenMenuAction | CloseMenuAction | CloseAllMenusAction | SetOverlayEnabledAction | SetDisabledCategoriesAction | SetHiddenItemsAction;
export declare const initUIState: (documentId: string, schema: UISchema) => InitUIStateAction;
export declare const cleanupUIState: (documentId: string) => CleanupUIStateAction;
export declare const setActiveToolbar: (documentId: string, placement: string, slot: string, toolbarId: string) => SetActiveToolbarAction;
export declare const closeToolbarSlot: (documentId: string, placement: string, slot: string) => CloseToolbarSlotAction;
export declare const setActiveSidebar: (documentId: string, placement: string, slot: string, sidebarId: string, activeTab?: string, props?: Record<string, unknown>) => SetActiveSidebarAction;
export declare const closeSidebarSlot: (documentId: string, placement: string, slot: string) => CloseSidebarSlotAction;
export declare const setSidebarTab: (documentId: string, sidebarId: string, tabId: string) => SetSidebarTabAction;
export declare const openModal: (documentId: string, modalId: string, props?: Record<string, unknown>) => OpenModalAction;
export declare const closeModal: (documentId: string) => CloseModalAction;
export declare const clearModal: (documentId: string) => ClearModalAction;
export declare const openMenu: (documentId: string, menuState: OpenMenuState) => OpenMenuAction;
export declare const closeMenu: (documentId: string, menuId: string) => CloseMenuAction;
export declare const closeAllMenus: (documentId: string) => CloseAllMenusAction;
export declare const setOverlayEnabled: (documentId: string, overlayId: string, enabled: boolean) => SetOverlayEnabledAction;
export declare const setDisabledCategories: (categories: string[]) => SetDisabledCategoriesAction;
export declare const setHiddenItems: (hiddenItems: string[]) => SetHiddenItemsAction;
