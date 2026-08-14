import { ComponentType } from '../react/adapter.ts';
import { ToolbarSchema, SidebarSchema, ModalSchema, OverlaySchema, MenuSchema, SelectionMenuSchema } from '../lib/index.ts';
import { SelectionMenuPropsBase } from '../react/utils.ts';
export type { SelectionMenuPropsBase };
export type UIComponents = Record<string, ComponentType<BaseComponentProps>>;
/**
 * Base props that all custom components must accept
 */
export interface BaseComponentProps {
    documentId: string;
    [key: string]: any;
}
/**
 * Props for toolbar renderer
 * The app provides a component matching this contract
 */
export interface ToolbarRendererProps {
    schema: ToolbarSchema;
    documentId: string;
    isOpen: boolean;
    onClose?: () => void;
    className?: string;
}
export type ToolbarRenderer = ComponentType<ToolbarRendererProps>;
/**
 * Props for sidebar renderer
 * The app provides a component matching this contract
 */
export interface SidebarRendererProps {
    schema: SidebarSchema;
    documentId: string;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    sidebarProps?: Record<string, unknown>;
}
export type SidebarRenderer = ComponentType<SidebarRendererProps>;
/**
 * Props for modal renderer (with animation lifecycle support)
 * The app provides a component matching this contract
 */
export interface ModalRendererProps {
    schema: ModalSchema;
    documentId: string;
    isOpen: boolean;
    onClose: () => void;
    onExited: () => void;
    className?: string;
    modalProps?: Record<string, unknown>;
}
export type ModalRenderer = ComponentType<ModalRendererProps>;
/**
 * Props for overlay renderer
 * The app provides a component matching this contract
 */
export interface OverlayRendererProps {
    schema: OverlaySchema;
    documentId: string;
    className?: string;
}
export type OverlayRenderer = ComponentType<OverlayRendererProps>;
/**
 * Props for menu renderer
 * The app provides a component matching this contract
 */
export interface MenuRendererProps {
    schema: MenuSchema;
    documentId: string;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    container?: HTMLElement | null;
}
export type MenuRenderer = ComponentType<MenuRendererProps>;
/**
 * Props for the selection menu renderer component
 */
export interface SelectionMenuRendererProps {
    schema: SelectionMenuSchema;
    documentId: string;
    /** Full props from the layer including context */
    props: SelectionMenuPropsBase;
}
export type SelectionMenuRenderer = ComponentType<SelectionMenuRendererProps>;
/**
 * All renderers the app must provide
 */
export interface UIRenderers {
    toolbar: ToolbarRenderer;
    sidebar: SidebarRenderer;
    modal?: ModalRenderer;
    overlay?: OverlayRenderer;
    menu: MenuRenderer;
    selectionMenu: SelectionMenuRenderer;
}
