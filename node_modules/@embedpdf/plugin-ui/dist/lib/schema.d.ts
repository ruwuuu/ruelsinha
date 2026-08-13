/**
 * Top-level UI Schema
 */
export interface UISchema {
    id: string;
    version: string;
    toolbars: Record<string, ToolbarSchema>;
    menus: Record<string, MenuSchema>;
    sidebars: Record<string, SidebarSchema>;
    modals: Record<string, ModalSchema>;
    overlays?: Record<string, OverlaySchema>;
    selectionMenus: Record<string, SelectionMenuSchema>;
}
export interface ToolbarPosition {
    placement: 'top' | 'bottom' | 'left' | 'right';
    slot?: string;
    order?: number;
}
export interface VisibilityDependency {
    /** Menu whose visible items determine this element's visibility */
    menuId?: string;
    /** Direct item IDs this element depends on */
    itemIds?: string[];
}
export interface CustomComponentItem {
    type: 'custom';
    id: string;
    componentId: string;
    props?: Record<string, any>;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Toolbar item types
 */
export type ToolbarItem = CommandButtonItem | TabGroupItem | DividerItem | SpacerItem | GroupItem | CustomComponentItem;
/**
 * Toolbar definition
 */
export interface ToolbarSchema {
    id: string;
    position: ToolbarPosition;
    permanent?: boolean;
    items: ToolbarItem[];
    responsive?: ResponsiveRules;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface TabGroupItem {
    type: 'tab-group';
    id: string;
    tabs: TabItem[];
    defaultTab?: string;
    variant?: 'pills' | 'underline' | 'enclosed';
    alignment?: 'start' | 'center' | 'end';
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface TabItem {
    id: string;
    commandId: string;
    variant?: 'icon' | 'text' | 'icon-text';
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface CommandButtonItem {
    type: 'command-button';
    id: string;
    commandId: string;
    variant?: 'icon' | 'text' | 'icon-text' | 'tab';
    size?: 'sm' | 'md' | 'lg';
    /** Categories this item belongs to (hidden when ANY category is disabled) */
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface DividerItem {
    type: 'divider';
    id: string;
    orientation?: 'vertical' | 'horizontal';
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface SpacerItem {
    type: 'spacer';
    id: string;
    flex?: boolean;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface GroupItem {
    type: 'group';
    id: string;
    items: ToolbarItem[];
    gap?: number;
    alignment?: 'start' | 'center' | 'end';
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Menu definition - pure structure, no trigger info
 */
export interface MenuSchema {
    id: string;
    items: MenuItem[];
    responsive?: ResponsiveRules;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Menu item types
 */
export type MenuItem = MenuCommandItem | MenuSectionItem | MenuSubmenuItem | MenuDividerItem | MenuCustomItem;
export interface MenuCommandItem {
    type: 'command';
    id: string;
    commandId: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface MenuSectionItem {
    type: 'section';
    id: string;
    labelKey?: string;
    label?: string;
    items: MenuItem[];
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface MenuSubmenuItem {
    type: 'submenu';
    id: string;
    labelKey?: string;
    label?: string;
    icon?: string;
    menuId: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface MenuDividerItem {
    type: 'divider';
    id: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface MenuCustomItem {
    type: 'custom';
    id: string;
    componentId: string;
    props?: Record<string, any>;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Sidebar definition - positioned panels with placement/slot
 */
export interface SidebarSchema {
    id: string;
    position: SidebarPosition;
    content: PanelContent;
    collapsible?: boolean;
    defaultOpen?: boolean;
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface SidebarPosition {
    placement: 'left' | 'right' | 'top' | 'bottom';
    slot: string;
    order?: number;
}
/**
 * Modal definition - global overlays, only one at a time
 */
export interface ModalSchema {
    id: string;
    content: PanelContent;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Overlay position anchor
 */
export type OverlayAnchor = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
/**
 * Overlay position configuration
 */
export interface OverlayPosition {
    anchor: OverlayAnchor;
    offset?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
}
/**
 * Overlay definition - floating components positioned over document content
 * Unlike modals, overlays don't block interaction and multiple can be visible
 */
export interface OverlaySchema {
    id: string;
    position: OverlayPosition;
    content: ComponentPanelContent;
    defaultEnabled?: boolean;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
/**
 * Panel content types
 */
export type PanelContent = TabsPanelContent | ComponentPanelContent;
export interface TabsPanelContent {
    type: 'tabs';
    tabs: PanelTab[];
    defaultTab?: string;
}
export interface PanelTab {
    id: string;
    labelKey?: string;
    label?: string;
    icon?: string;
    componentId: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface ComponentPanelContent {
    type: 'component';
    componentId: string;
    props?: Record<string, any>;
}
export interface ResponsiveRules {
    breakpoints: Record<string, BreakpointRule>;
    localeOverrides?: LocaleOverrides;
}
export interface BreakpointRule {
    minWidth?: number;
    maxWidth?: number;
    hide?: string[];
    show?: string[];
}
/**
 * Locale-based responsive overrides
 * Allows grouping languages and adjusting show/hide rules per breakpoint
 */
export interface LocaleOverrides {
    groups: LocaleVisibilityGroup[];
}
export interface LocaleVisibilityGroup {
    id: string;
    locales: string[];
    description?: string;
    breakpoints: Record<string, LocaleBreakpointOverride>;
}
export interface LocaleBreakpointOverride {
    hide?: string[];
    show?: string[];
    replaceHide?: string[];
    replaceShow?: string[];
}
export type SelectionMenuItem = SelectionMenuCommandItem | SelectionMenuDividerItem | SelectionMenuGroupItem;
export interface SelectionMenuCommandItem {
    type: 'command-button';
    id: string;
    commandId: string;
    variant?: 'icon' | 'text' | 'icon-text';
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface SelectionMenuDividerItem {
    type: 'divider';
    id: string;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface SelectionMenuGroupItem {
    type: 'group';
    id: string;
    items: SelectionMenuItem[];
    gap?: number;
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
}
export interface SelectionMenuSchema {
    id: string;
    items: SelectionMenuItem[];
    categories?: string[];
    visibilityDependsOn?: VisibilityDependency;
    responsive?: ResponsiveRules;
}
