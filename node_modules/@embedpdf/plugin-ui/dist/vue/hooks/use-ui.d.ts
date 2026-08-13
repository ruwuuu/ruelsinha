import { MaybeRefOrGetter } from 'vue';
import { UIPlugin } from '../../lib';
export declare const useUIPlugin: () => import('@embedpdf/core/vue').PluginState<UIPlugin>;
export declare const useUICapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib').UICapability>>;
/**
 * Hook for UI state for a specific document
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useUIState: (documentId: MaybeRefOrGetter<string>) => {
    provides: import('vue').ComputedRef<import('../../lib').UIScope | null>;
    state: Readonly<import('vue').Ref<{
        readonly activeToolbars: {
            readonly [x: string]: {
                readonly toolbarId: string;
                readonly isOpen: boolean;
            };
        };
        readonly activeSidebars: {
            readonly [x: string]: {
                readonly sidebarId: string;
                readonly isOpen: boolean;
                readonly props?: {
                    readonly [x: string]: Readonly<unknown>;
                } | undefined;
            };
        };
        readonly activeModal: {
            readonly modalId: string;
            readonly isOpen: boolean;
            readonly props?: {
                readonly [x: string]: Readonly<unknown>;
            } | undefined;
        } | null;
        readonly openMenus: {
            readonly [x: string]: {
                readonly menuId: string;
                readonly triggeredByCommandId?: string | undefined;
                readonly triggeredByItemId?: string | undefined;
            };
        };
        readonly sidebarTabs: {
            readonly [x: string]: string;
        };
        readonly enabledOverlays: {
            readonly [x: string]: boolean;
        };
    } | null, {
        readonly activeToolbars: {
            readonly [x: string]: {
                readonly toolbarId: string;
                readonly isOpen: boolean;
            };
        };
        readonly activeSidebars: {
            readonly [x: string]: {
                readonly sidebarId: string;
                readonly isOpen: boolean;
                readonly props?: {
                    readonly [x: string]: Readonly<unknown>;
                } | undefined;
            };
        };
        readonly activeModal: {
            readonly modalId: string;
            readonly isOpen: boolean;
            readonly props?: {
                readonly [x: string]: Readonly<unknown>;
            } | undefined;
        } | null;
        readonly openMenus: {
            readonly [x: string]: {
                readonly menuId: string;
                readonly triggeredByCommandId?: string | undefined;
                readonly triggeredByItemId?: string | undefined;
            };
        };
        readonly sidebarTabs: {
            readonly [x: string]: string;
        };
        readonly enabledOverlays: {
            readonly [x: string]: boolean;
        };
    } | null>>;
};
/**
 * Hook to get UI schema
 */
export declare const useUISchema: () => Readonly<import('vue').Ref<{
    readonly id: string;
    readonly version: string;
    readonly toolbars: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly placement: "top" | "bottom" | "left" | "right";
                readonly slot?: string | undefined;
                readonly order?: number | undefined;
            };
            readonly permanent?: boolean | undefined;
            readonly items: readonly ({
                readonly type: "custom";
                readonly id: string;
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "command-button";
                readonly id: string;
                readonly commandId: string;
                readonly variant?: "icon" | "text" | "icon-text" | "tab" | undefined;
                readonly size?: "sm" | "md" | "lg" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "tab-group";
                readonly id: string;
                readonly tabs: readonly {
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
                readonly variant?: "pills" | "underline" | "enclosed" | undefined;
                readonly alignment?: "start" | "center" | "end" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly orientation?: "vertical" | "horizontal" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "spacer";
                readonly id: string;
                readonly flex?: boolean | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "group";
                readonly id: string;
                readonly items: readonly ({
                    readonly type: "custom";
                    readonly id: string;
                    readonly componentId: string;
                    readonly props?: {
                        readonly [x: string]: any;
                    } | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "command-button";
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | "tab" | undefined;
                    readonly size?: "sm" | "md" | "lg" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "tab-group";
                    readonly id: string;
                    readonly tabs: readonly {
                        readonly id: string;
                        readonly commandId: string;
                        readonly variant?: "icon" | "text" | "icon-text" | undefined;
                        readonly categories?: readonly string[] | undefined;
                        readonly visibilityDependsOn?: {
                            readonly menuId?: string | undefined;
                            readonly itemIds?: readonly string[] | undefined;
                        } | undefined;
                    }[];
                    readonly defaultTab?: string | undefined;
                    readonly variant?: "pills" | "underline" | "enclosed" | undefined;
                    readonly alignment?: "start" | "center" | "end" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly orientation?: "vertical" | "horizontal" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "spacer";
                    readonly id: string;
                    readonly flex?: boolean | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any)[];
                readonly gap?: number | undefined;
                readonly alignment?: "start" | "center" | "end" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly menus: {
        readonly [x: string]: {
            readonly id: string;
            readonly items: readonly ({
                readonly type: "command";
                readonly id: string;
                readonly commandId: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "section";
                readonly id: string;
                readonly labelKey?: string | undefined;
                readonly label?: string | undefined;
                readonly items: readonly ({
                    readonly type: "command";
                    readonly id: string;
                    readonly commandId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any | {
                    readonly type: "submenu";
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly menuId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "custom";
                    readonly id: string;
                    readonly componentId: string;
                    readonly props?: {
                        readonly [x: string]: any;
                    } | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                })[];
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "submenu";
                readonly id: string;
                readonly labelKey?: string | undefined;
                readonly label?: string | undefined;
                readonly icon?: string | undefined;
                readonly menuId: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "custom";
                readonly id: string;
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly sidebars: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly placement: "left" | "right" | "top" | "bottom";
                readonly slot: string;
                readonly order?: number | undefined;
            };
            readonly content: {
                readonly type: "tabs";
                readonly tabs: readonly {
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly componentId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
            } | {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly collapsible?: boolean | undefined;
            readonly defaultOpen?: boolean | undefined;
            readonly width?: string | undefined;
            readonly height?: string | undefined;
            readonly minWidth?: string | undefined;
            readonly minHeight?: string | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly modals: {
        readonly [x: string]: {
            readonly id: string;
            readonly content: {
                readonly type: "tabs";
                readonly tabs: readonly {
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly componentId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
            } | {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly closeOnClickOutside?: boolean | undefined;
            readonly closeOnEscape?: boolean | undefined;
            readonly width?: string | undefined;
            readonly height?: string | undefined;
            readonly maxWidth?: string | undefined;
            readonly maxHeight?: string | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly overlays?: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly anchor: import('../../lib').OverlayAnchor;
                readonly offset?: {
                    readonly top?: string | undefined;
                    readonly right?: string | undefined;
                    readonly bottom?: string | undefined;
                    readonly left?: string | undefined;
                } | undefined;
            };
            readonly content: {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly defaultEnabled?: boolean | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    } | undefined;
    readonly selectionMenus: {
        readonly [x: string]: {
            readonly id: string;
            readonly items: readonly ({
                readonly type: "command-button";
                readonly id: string;
                readonly commandId: string;
                readonly variant?: "icon" | "text" | "icon-text" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "group";
                readonly id: string;
                readonly items: readonly ({
                    readonly type: "command-button";
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any)[];
                readonly gap?: number | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
        };
    };
} | null, {
    readonly id: string;
    readonly version: string;
    readonly toolbars: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly placement: "top" | "bottom" | "left" | "right";
                readonly slot?: string | undefined;
                readonly order?: number | undefined;
            };
            readonly permanent?: boolean | undefined;
            readonly items: readonly ({
                readonly type: "custom";
                readonly id: string;
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "command-button";
                readonly id: string;
                readonly commandId: string;
                readonly variant?: "icon" | "text" | "icon-text" | "tab" | undefined;
                readonly size?: "sm" | "md" | "lg" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "tab-group";
                readonly id: string;
                readonly tabs: readonly {
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
                readonly variant?: "pills" | "underline" | "enclosed" | undefined;
                readonly alignment?: "start" | "center" | "end" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly orientation?: "vertical" | "horizontal" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "spacer";
                readonly id: string;
                readonly flex?: boolean | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "group";
                readonly id: string;
                readonly items: readonly ({
                    readonly type: "custom";
                    readonly id: string;
                    readonly componentId: string;
                    readonly props?: {
                        readonly [x: string]: any;
                    } | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "command-button";
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | "tab" | undefined;
                    readonly size?: "sm" | "md" | "lg" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "tab-group";
                    readonly id: string;
                    readonly tabs: readonly {
                        readonly id: string;
                        readonly commandId: string;
                        readonly variant?: "icon" | "text" | "icon-text" | undefined;
                        readonly categories?: readonly string[] | undefined;
                        readonly visibilityDependsOn?: {
                            readonly menuId?: string | undefined;
                            readonly itemIds?: readonly string[] | undefined;
                        } | undefined;
                    }[];
                    readonly defaultTab?: string | undefined;
                    readonly variant?: "pills" | "underline" | "enclosed" | undefined;
                    readonly alignment?: "start" | "center" | "end" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly orientation?: "vertical" | "horizontal" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "spacer";
                    readonly id: string;
                    readonly flex?: boolean | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any)[];
                readonly gap?: number | undefined;
                readonly alignment?: "start" | "center" | "end" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly menus: {
        readonly [x: string]: {
            readonly id: string;
            readonly items: readonly ({
                readonly type: "command";
                readonly id: string;
                readonly commandId: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "section";
                readonly id: string;
                readonly labelKey?: string | undefined;
                readonly label?: string | undefined;
                readonly items: readonly ({
                    readonly type: "command";
                    readonly id: string;
                    readonly commandId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any | {
                    readonly type: "submenu";
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly menuId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "custom";
                    readonly id: string;
                    readonly componentId: string;
                    readonly props?: {
                        readonly [x: string]: any;
                    } | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                })[];
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "submenu";
                readonly id: string;
                readonly labelKey?: string | undefined;
                readonly label?: string | undefined;
                readonly icon?: string | undefined;
                readonly menuId: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "custom";
                readonly id: string;
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly sidebars: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly placement: "left" | "right" | "top" | "bottom";
                readonly slot: string;
                readonly order?: number | undefined;
            };
            readonly content: {
                readonly type: "tabs";
                readonly tabs: readonly {
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly componentId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
            } | {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly collapsible?: boolean | undefined;
            readonly defaultOpen?: boolean | undefined;
            readonly width?: string | undefined;
            readonly height?: string | undefined;
            readonly minWidth?: string | undefined;
            readonly minHeight?: string | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly modals: {
        readonly [x: string]: {
            readonly id: string;
            readonly content: {
                readonly type: "tabs";
                readonly tabs: readonly {
                    readonly id: string;
                    readonly labelKey?: string | undefined;
                    readonly label?: string | undefined;
                    readonly icon?: string | undefined;
                    readonly componentId: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                }[];
                readonly defaultTab?: string | undefined;
            } | {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly closeOnClickOutside?: boolean | undefined;
            readonly closeOnEscape?: boolean | undefined;
            readonly width?: string | undefined;
            readonly height?: string | undefined;
            readonly maxWidth?: string | undefined;
            readonly maxHeight?: string | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    };
    readonly overlays?: {
        readonly [x: string]: {
            readonly id: string;
            readonly position: {
                readonly anchor: import('../../lib').OverlayAnchor;
                readonly offset?: {
                    readonly top?: string | undefined;
                    readonly right?: string | undefined;
                    readonly bottom?: string | undefined;
                    readonly left?: string | undefined;
                } | undefined;
            };
            readonly content: {
                readonly type: "component";
                readonly componentId: string;
                readonly props?: {
                    readonly [x: string]: any;
                } | undefined;
            };
            readonly defaultEnabled?: boolean | undefined;
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
        };
    } | undefined;
    readonly selectionMenus: {
        readonly [x: string]: {
            readonly id: string;
            readonly items: readonly ({
                readonly type: "command-button";
                readonly id: string;
                readonly commandId: string;
                readonly variant?: "icon" | "text" | "icon-text" | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "divider";
                readonly id: string;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            } | {
                readonly type: "group";
                readonly id: string;
                readonly items: readonly ({
                    readonly type: "command-button";
                    readonly id: string;
                    readonly commandId: string;
                    readonly variant?: "icon" | "text" | "icon-text" | undefined;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | {
                    readonly type: "divider";
                    readonly id: string;
                    readonly categories?: readonly string[] | undefined;
                    readonly visibilityDependsOn?: {
                        readonly menuId?: string | undefined;
                        readonly itemIds?: readonly string[] | undefined;
                    } | undefined;
                } | /*elided*/ any)[];
                readonly gap?: number | undefined;
                readonly categories?: readonly string[] | undefined;
                readonly visibilityDependsOn?: {
                    readonly menuId?: string | undefined;
                    readonly itemIds?: readonly string[] | undefined;
                } | undefined;
            })[];
            readonly categories?: readonly string[] | undefined;
            readonly visibilityDependsOn?: {
                readonly menuId?: string | undefined;
                readonly itemIds?: readonly string[] | undefined;
            } | undefined;
            readonly responsive?: {
                readonly breakpoints: {
                    readonly [x: string]: {
                        readonly minWidth?: number | undefined;
                        readonly maxWidth?: number | undefined;
                        readonly hide?: readonly string[] | undefined;
                        readonly show?: readonly string[] | undefined;
                    };
                };
                readonly localeOverrides?: {
                    readonly groups: readonly {
                        readonly id: string;
                        readonly locales: readonly string[];
                        readonly description?: string | undefined;
                        readonly breakpoints: {
                            readonly [x: string]: {
                                readonly hide?: readonly string[] | undefined;
                                readonly show?: readonly string[] | undefined;
                                readonly replaceHide?: readonly string[] | undefined;
                                readonly replaceShow?: readonly string[] | undefined;
                            };
                        };
                    }[];
                } | undefined;
            } | undefined;
        };
    };
} | null>>;
