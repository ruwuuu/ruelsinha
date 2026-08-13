import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { UIPlugin, UI_SELECTORS, UI_ATTRIBUTES } from "@embedpdf/plugin-ui";
export * from "@embedpdf/plugin-ui";
import { createContext, Fragment } from "preact";
import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "preact/hooks";
import { jsx, jsxs } from "preact/jsx-runtime";
const useUICapability = () => useCapability(UIPlugin.id);
const useUIPlugin = () => usePlugin(UIPlugin.id);
const useUIState = (documentId) => {
  const { provides } = useUICapability();
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setState(scope.getState());
    const unsubToolbar = scope.onToolbarChanged(() => setState(scope.getState()));
    const unsubSidebar = scope.onSidebarChanged(() => setState(scope.getState()));
    const unsubModal = scope.onModalChanged(() => setState(scope.getState()));
    const unsubMenu = scope.onMenuChanged(() => setState(scope.getState()));
    const unsubOverlay = scope.onOverlayChanged(() => setState(scope.getState()));
    return () => {
      unsubToolbar();
      unsubSidebar();
      unsubModal();
      unsubMenu();
      unsubOverlay();
    };
  }, [provides, documentId]);
  return state;
};
const useUISchema = () => {
  const { provides } = useUICapability();
  return (provides == null ? void 0 : provides.getSchema()) ?? null;
};
const UIContainerContext = createContext(null);
function useUIContainer() {
  const context = useContext(UIContainerContext);
  if (!context) {
    throw new Error("useUIContainer must be used within a UIProvider");
  }
  return context;
}
const AnchorRegistryContext = createContext(null);
function AnchorRegistryProvider({ children }) {
  const anchorsRef = useRef(/* @__PURE__ */ new Map());
  const registry = {
    register: useCallback((documentId, itemId, element) => {
      const key = `${documentId}:${itemId}`;
      anchorsRef.current.set(key, element);
    }, []),
    unregister: useCallback((documentId, itemId) => {
      const key = `${documentId}:${itemId}`;
      anchorsRef.current.delete(key);
    }, []),
    getAnchor: useCallback((documentId, itemId) => {
      const key = `${documentId}:${itemId}`;
      return anchorsRef.current.get(key) || null;
    }, [])
  };
  return /* @__PURE__ */ jsx(AnchorRegistryContext.Provider, { value: registry, children });
}
function useAnchorRegistry() {
  const context = useContext(AnchorRegistryContext);
  if (!context) {
    throw new Error("useAnchorRegistry must be used within UIProvider");
  }
  return context;
}
function useRegisterAnchor(documentId, itemId) {
  const registry = useAnchorRegistry();
  const elementRef = useRef(null);
  const documentIdRef = useRef(documentId);
  const itemIdRef = useRef(itemId);
  documentIdRef.current = documentId;
  itemIdRef.current = itemId;
  return useCallback(
    (element) => {
      const previousElement = elementRef.current;
      elementRef.current = element;
      if (element) {
        if (element !== previousElement) {
          registry.register(documentIdRef.current, itemIdRef.current, element);
        }
      } else if (previousElement) {
        registry.unregister(documentIdRef.current, itemIdRef.current);
      }
    },
    [registry]
    // Only depend on registry!
  );
}
const ComponentRegistryContext = createContext(null);
function ComponentRegistryProvider({
  children,
  initialComponents = {}
}) {
  const componentsRef = useRef(
    new Map(Object.entries(initialComponents))
  );
  const registry = {
    register: useCallback((id, component) => {
      componentsRef.current.set(id, component);
    }, []),
    unregister: useCallback((id) => {
      componentsRef.current.delete(id);
    }, []),
    get: useCallback((id) => {
      return componentsRef.current.get(id);
    }, []),
    has: useCallback((id) => {
      return componentsRef.current.has(id);
    }, []),
    getRegisteredIds: useCallback(() => {
      return Array.from(componentsRef.current.keys());
    }, [])
  };
  return /* @__PURE__ */ jsx(ComponentRegistryContext.Provider, { value: registry, children });
}
function useComponentRegistry() {
  const context = useContext(ComponentRegistryContext);
  if (!context) {
    throw new Error("useComponentRegistry must be used within UIProvider");
  }
  return context;
}
function useItemRenderer() {
  const componentRegistry = useComponentRegistry();
  return {
    /**
     * Render a custom component by ID
     *
     * @param componentId - Component ID from schema
     * @param documentId - Document ID
     * @param props - Additional props to pass to component
     * @returns Rendered component or null if not found
     */
    renderCustomComponent: (componentId, documentId, props) => {
      const Component = componentRegistry.get(componentId);
      if (!Component) {
        console.error(`Component "${componentId}" not found in registry`);
        return null;
      }
      return /* @__PURE__ */ jsx(Component, { documentId, ...props || {} });
    }
  };
}
const RenderersContext = createContext(null);
function RenderersProvider({ children, renderers }) {
  return /* @__PURE__ */ jsx(RenderersContext.Provider, { value: renderers, children });
}
function useRenderers() {
  const context = useContext(RenderersContext);
  if (!context) {
    throw new Error("useRenderers must be used within UIProvider");
  }
  return context;
}
function useSchemaRenderer(documentId) {
  const renderers = useRenderers();
  const { provides } = useUICapability();
  const schema = provides == null ? void 0 : provides.getSchema();
  const uiState = useUIState(documentId);
  return {
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
    renderToolbar: (placement, slot) => {
      const slotKey = `${placement}-${slot}`;
      if (!schema || !provides || !uiState) {
        return null;
      }
      const toolbarSlot = uiState.activeToolbars[slotKey];
      const toolbarSchema = toolbarSlot ? schema.toolbars[toolbarSlot.toolbarId] : null;
      if (toolbarSlot && !toolbarSchema) {
        console.warn(`Toolbar "${toolbarSlot.toolbarId}" not found in schema`);
      }
      const isClosable = toolbarSchema ? !toolbarSchema.permanent : false;
      const handleClose = isClosable ? () => provides.forDocument(documentId).closeToolbarSlot(placement, slot) : void 0;
      const ToolbarRenderer = renderers.toolbar;
      return /* @__PURE__ */ jsx(Fragment, { children: toolbarSlot && toolbarSchema && /* @__PURE__ */ jsx(
        ToolbarRenderer,
        {
          schema: toolbarSchema,
          documentId,
          isOpen: toolbarSlot.isOpen,
          onClose: handleClose
        }
      ) }, `toolbar-slot-${slotKey}`);
    },
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
    renderSidebar: (placement, slot) => {
      var _a;
      const slotKey = `${placement}-${slot}`;
      if (!schema || !provides || !uiState) {
        return null;
      }
      const sidebarSlot = uiState.activeSidebars[slotKey];
      const sidebarSchema = sidebarSlot ? (_a = schema.sidebars) == null ? void 0 : _a[sidebarSlot.sidebarId] : null;
      if (sidebarSlot && !sidebarSchema) {
        console.warn(`Sidebar "${sidebarSlot.sidebarId}" not found in schema`);
      }
      const handleClose = () => {
        provides.forDocument(documentId).closeSidebarSlot(placement, slot);
      };
      const SidebarRenderer = renderers.sidebar;
      return /* @__PURE__ */ jsx(Fragment, { children: sidebarSlot && sidebarSchema && /* @__PURE__ */ jsx(
        SidebarRenderer,
        {
          schema: sidebarSchema,
          documentId,
          isOpen: sidebarSlot.isOpen,
          onClose: handleClose,
          sidebarProps: sidebarSlot.props
        }
      ) }, `sidebar-slot-${slotKey}`);
    },
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
    renderModal: () => {
      var _a;
      if (!schema || !provides || !uiState) {
        return null;
      }
      const ModalRenderer = renderers.modal;
      if (!ModalRenderer) {
        return null;
      }
      const activeModal = uiState.activeModal;
      const modalSchema = activeModal ? (_a = schema.modals) == null ? void 0 : _a[activeModal.modalId] : null;
      if (activeModal && !modalSchema) {
        console.warn(`Modal "${activeModal.modalId}" not found in schema`);
      }
      const handleClose = () => {
        provides.forDocument(documentId).closeModal();
      };
      const handleExited = () => {
        provides.forDocument(documentId).clearModal();
      };
      return /* @__PURE__ */ jsx(Fragment, { children: activeModal && modalSchema && /* @__PURE__ */ jsx(
        ModalRenderer,
        {
          schema: modalSchema,
          documentId,
          isOpen: activeModal.isOpen,
          onClose: handleClose,
          onExited: handleExited,
          modalProps: activeModal.props
        }
      ) }, "modal-slot");
    },
    /**
     * Helper: Get all active toolbars for this document
     * Useful for batch rendering or debugging
     */
    getActiveToolbars: () => {
      if (!uiState) return [];
      return Object.entries(uiState.activeToolbars).map(([slotKey, toolbarSlot]) => {
        const [placement, slot] = slotKey.split("-");
        return {
          placement,
          slot,
          toolbarId: toolbarSlot.toolbarId,
          isOpen: toolbarSlot.isOpen
        };
      });
    },
    /**
     * Helper: Get all active sidebars for this document
     * Useful for batch rendering or debugging
     */
    getActiveSidebars: () => {
      if (!uiState) return [];
      return Object.entries(uiState.activeSidebars).map(([slotKey, sidebarSlot]) => {
        const [placement, slot] = slotKey.split("-");
        return {
          placement,
          slot,
          sidebarId: sidebarSlot.sidebarId,
          isOpen: sidebarSlot.isOpen
        };
      });
    },
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
    renderOverlays: () => {
      if (!schema || !provides || !uiState) {
        return null;
      }
      const OverlayRenderer = renderers.overlay;
      if (!OverlayRenderer) {
        return null;
      }
      const overlays = schema.overlays ? Object.values(schema.overlays) : [];
      const enabledOverlays = overlays.filter(
        (overlay) => uiState.enabledOverlays[overlay.id] !== false
      );
      return /* @__PURE__ */ jsx(Fragment, { children: enabledOverlays.map((overlaySchema) => /* @__PURE__ */ jsx(
        OverlayRenderer,
        {
          schema: overlaySchema,
          documentId
        },
        overlaySchema.id
      )) }, "overlays-slot");
    }
  };
}
function useSelectionMenu(menuId, documentId) {
  var _a;
  const { provides } = useUICapability();
  const renderers = useRenderers();
  const renderFn = useCallback(
    (props) => {
      var _a2;
      const schema2 = provides == null ? void 0 : provides.getSchema();
      const menuSchema = (_a2 = schema2 == null ? void 0 : schema2.selectionMenus) == null ? void 0 : _a2[menuId];
      if (!menuSchema) {
        return null;
      }
      if (!props.selected) {
        return null;
      }
      const SelectionMenuRenderer = renderers.selectionMenu;
      return /* @__PURE__ */ jsx(SelectionMenuRenderer, { schema: menuSchema, documentId, props });
    },
    [provides, renderers, menuId, documentId]
  );
  const schema = provides == null ? void 0 : provides.getSchema();
  if (!((_a = schema == null ? void 0 : schema.selectionMenus) == null ? void 0 : _a[menuId])) {
    return void 0;
  }
  return renderFn;
}
function AutoMenuRenderer({ container, documentId }) {
  const uiState = useUIState(documentId);
  const { provides } = useUICapability();
  const anchorRegistry = useAnchorRegistry();
  const renderers = useRenderers();
  const [activeMenu, setActiveMenu] = useState(null);
  const openMenus = (uiState == null ? void 0 : uiState.openMenus) || {};
  const schema = provides == null ? void 0 : provides.getSchema();
  useEffect(() => {
    const openMenuIds = Object.keys(openMenus);
    if (openMenuIds.length > 0) {
      const menuId = openMenuIds[0];
      if (!menuId) {
        setActiveMenu(null);
        return;
      }
      const menuState = openMenus[menuId];
      if (menuState && menuState.triggeredByItemId) {
        const anchor = anchorRegistry.getAnchor(documentId, menuState.triggeredByItemId);
        setActiveMenu({ menuId, anchorEl: anchor });
      } else {
        setActiveMenu(null);
      }
    } else {
      setActiveMenu(null);
    }
  }, [openMenus, anchorRegistry, documentId]);
  const handleClose = () => {
    if (activeMenu) {
      provides == null ? void 0 : provides.forDocument(documentId).closeMenu(activeMenu.menuId);
    }
  };
  if (!activeMenu || !schema) {
    return null;
  }
  const menuSchema = schema.menus[activeMenu.menuId];
  if (!menuSchema) {
    console.warn(`Menu "${activeMenu.menuId}" not found in schema`);
    return null;
  }
  const MenuRenderer = renderers.menu;
  return /* @__PURE__ */ jsx(
    MenuRenderer,
    {
      schema: menuSchema,
      documentId,
      anchorEl: activeMenu.anchorEl,
      onClose: handleClose,
      container
    }
  );
}
function getStyleTarget(element) {
  const root = element.getRootNode();
  if (root instanceof ShadowRoot) {
    return root;
  }
  return document.head;
}
function UIRoot({ children, style, ...restProps }) {
  const { plugin } = useUIPlugin();
  const { provides } = useUICapability();
  const [disabledCategories, setDisabledCategories] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const styleElRef = useRef(null);
  const styleTargetRef = useRef(null);
  const previousElementRef = useRef(null);
  const containerRef = useRef(null);
  const containerContextValue = useMemo(
    () => ({
      containerRef,
      getContainer: () => containerRef.current
    }),
    []
  );
  const rootRefCallback = useCallback(
    (element) => {
      const previousElement = previousElementRef.current;
      previousElementRef.current = element;
      containerRef.current = element;
      if (!element) {
        return;
      }
      if (element !== previousElement && plugin) {
        const styleTarget = getStyleTarget(element);
        styleTargetRef.current = styleTarget;
        const existingStyle = styleTarget.querySelector(
          UI_SELECTORS.STYLES
        );
        if (existingStyle) {
          styleElRef.current = existingStyle;
          existingStyle.textContent = plugin.getStylesheet();
          return;
        }
        const stylesheet = plugin.getStylesheet();
        const styleEl = document.createElement("style");
        styleEl.setAttribute(UI_ATTRIBUTES.STYLES, "");
        styleEl.textContent = stylesheet;
        if (styleTarget instanceof ShadowRoot) {
          styleTarget.insertBefore(styleEl, styleTarget.firstChild);
        } else {
          styleTarget.appendChild(styleEl);
        }
        styleElRef.current = styleEl;
      }
    },
    [plugin]
  );
  useEffect(() => {
    return () => {
      var _a;
      if (((_a = styleElRef.current) == null ? void 0 : _a.parentNode) && !previousElementRef.current) {
        styleElRef.current.remove();
      }
      styleElRef.current = null;
      styleTargetRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!plugin) return;
    return plugin.onStylesheetInvalidated(() => {
      if (styleElRef.current) {
        styleElRef.current.textContent = plugin.getStylesheet();
      }
    });
  }, [plugin]);
  useEffect(() => {
    if (!provides) return;
    setDisabledCategories(provides.getDisabledCategories());
    setHiddenItems(provides.getHiddenItems());
    return provides.onCategoryChanged(({ disabledCategories: disabledCategories2, hiddenItems: hiddenItems2 }) => {
      setDisabledCategories(disabledCategories2);
      setHiddenItems(hiddenItems2);
    });
  }, [provides]);
  const disabledCategoriesAttr = useMemo(
    () => disabledCategories.length > 0 ? disabledCategories.join(" ") : void 0,
    [disabledCategories]
  );
  const hiddenItemsAttr = useMemo(
    () => hiddenItems.length > 0 ? hiddenItems.join(" ") : void 0,
    [hiddenItems]
  );
  const combinedStyle = useMemo(() => {
    const base = { containerType: "inline-size" };
    if (style && typeof style === "object") {
      return { ...base, ...style };
    }
    return base;
  }, [style]);
  const rootProps = {
    [UI_ATTRIBUTES.ROOT]: "",
    [UI_ATTRIBUTES.DISABLED_CATEGORIES]: disabledCategoriesAttr,
    [UI_ATTRIBUTES.HIDDEN_ITEMS]: hiddenItemsAttr
  };
  return /* @__PURE__ */ jsx(UIContainerContext.Provider, { value: containerContextValue, children: /* @__PURE__ */ jsx("div", { ref: rootRefCallback, ...rootProps, ...restProps, style: combinedStyle, children }) });
}
function UIProvider({
  children,
  documentId,
  components = {},
  renderers,
  menuContainer,
  ...restProps
}) {
  return /* @__PURE__ */ jsx(AnchorRegistryProvider, { children: /* @__PURE__ */ jsx(ComponentRegistryProvider, { initialComponents: components, children: /* @__PURE__ */ jsx(RenderersProvider, { renderers, children: /* @__PURE__ */ jsxs(UIRoot, { ...restProps, children: [
    children,
    /* @__PURE__ */ jsx(AutoMenuRenderer, { documentId, container: menuContainer })
  ] }) }) }) });
}
export {
  AnchorRegistryProvider,
  ComponentRegistryProvider,
  RenderersProvider,
  UIContainerContext,
  UIProvider,
  useAnchorRegistry,
  useComponentRegistry,
  useItemRenderer,
  useRegisterAnchor,
  useRenderers,
  useSchemaRenderer,
  useSelectionMenu,
  useUICapability,
  useUIContainer,
  useUIPlugin,
  useUISchema,
  useUIState
};
//# sourceMappingURL=index.js.map
