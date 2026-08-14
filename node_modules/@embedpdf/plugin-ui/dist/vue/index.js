import { ref, watch, toValue, computed, readonly, inject, provide, onBeforeUnmount, h, defineComponent, openBlock, createBlock, resolveDynamicComponent, createCommentVNode, useAttrs, onMounted, onUnmounted, createElementBlock, mergeProps, unref, renderSlot, normalizeProps, guardReactiveProps, withCtx, createVNode } from "vue";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { UIPlugin, UI_ATTRIBUTES, UI_SELECTORS } from "@embedpdf/plugin-ui";
export * from "@embedpdf/plugin-ui";
const useUIPlugin = () => usePlugin(UIPlugin.id);
const useUICapability = () => useCapability(UIPlugin.id);
const useUIState = (documentId) => {
  const { provides } = useUICapability();
  const state = ref(null);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        state.value = null;
        return;
      }
      const scope = providesValue.forDocument(docId);
      state.value = scope.getState();
      const unsubToolbar = scope.onToolbarChanged(() => {
        state.value = scope.getState();
      });
      const unsubSidebar = scope.onSidebarChanged(() => {
        state.value = scope.getState();
      });
      const unsubModal = scope.onModalChanged(() => {
        state.value = scope.getState();
      });
      const unsubMenu = scope.onMenuChanged(() => {
        state.value = scope.getState();
      });
      const unsubOverlay = scope.onOverlayChanged(() => {
        state.value = scope.getState();
      });
      onCleanup(() => {
        unsubToolbar();
        unsubSidebar();
        unsubModal();
        unsubMenu();
        unsubOverlay();
      });
    },
    { immediate: true }
  );
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    provides: scopedProvides,
    state: readonly(state)
  };
};
const useUISchema = () => {
  const { provides } = useUICapability();
  const schema = computed(() => {
    var _a;
    return ((_a = provides.value) == null ? void 0 : _a.getSchema()) ?? null;
  });
  return readonly(schema);
};
const UI_CONTAINER_KEY = Symbol("ui-container");
function useUIContainer() {
  const context = inject(UI_CONTAINER_KEY);
  if (!context) {
    throw new Error("useUIContainer must be used within a UIProvider");
  }
  return context;
}
const AnchorRegistryKey = Symbol("AnchorRegistry");
function createAnchorRegistry() {
  const anchors = ref(/* @__PURE__ */ new Map());
  return {
    register(documentId, itemId, element) {
      const key = `${documentId}:${itemId}`;
      anchors.value.set(key, element);
    },
    unregister(documentId, itemId) {
      const key = `${documentId}:${itemId}`;
      anchors.value.delete(key);
    },
    getAnchor(documentId, itemId) {
      const key = `${documentId}:${itemId}`;
      return anchors.value.get(key) || null;
    }
  };
}
function provideAnchorRegistry() {
  const registry = createAnchorRegistry();
  provide(AnchorRegistryKey, registry);
  return registry;
}
function useAnchorRegistry() {
  const registry = inject(AnchorRegistryKey);
  if (!registry) {
    throw new Error("useAnchorRegistry must be used within UIProvider");
  }
  return registry;
}
function useRegisterAnchor(documentId, itemId) {
  const registry = useAnchorRegistry();
  const elementRef = ref(null);
  watch(
    [() => toValue(documentId), () => toValue(itemId)],
    ([newDocId, newItemId], [oldDocId, oldItemId]) => {
      if (oldDocId && oldItemId && (oldDocId !== newDocId || oldItemId !== newItemId)) {
        registry.unregister(oldDocId, oldItemId);
      }
      if (elementRef.value && newDocId && newItemId) {
        registry.register(newDocId, newItemId, elementRef.value);
      }
    }
  );
  const setRef = (el) => {
    const element = (el == null ? void 0 : el.$el) || el;
    const docId = toValue(documentId);
    const item = toValue(itemId);
    if (elementRef.value && elementRef.value !== element) {
      registry.unregister(docId, item);
    }
    elementRef.value = element;
    if (element) {
      registry.register(docId, item, element);
    }
  };
  onBeforeUnmount(() => {
    if (elementRef.value) {
      registry.unregister(toValue(documentId), toValue(itemId));
    }
  });
  return setRef;
}
const ComponentRegistryKey = Symbol("ComponentRegistry");
function createComponentRegistry(initialComponents = {}) {
  const components = ref(
    new Map(Object.entries(initialComponents))
  );
  return {
    register(id, component) {
      components.value.set(id, component);
    },
    unregister(id) {
      components.value.delete(id);
    },
    get(id) {
      return components.value.get(id);
    },
    has(id) {
      return components.value.has(id);
    },
    getRegisteredIds() {
      return Array.from(components.value.keys());
    }
  };
}
function provideComponentRegistry(initialComponents = {}) {
  const registry = createComponentRegistry(initialComponents);
  provide(ComponentRegistryKey, registry);
  return registry;
}
function useComponentRegistry() {
  const registry = inject(ComponentRegistryKey);
  if (!registry) {
    throw new Error("useComponentRegistry must be used within UIProvider");
  }
  return registry;
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
      return h(Component, { documentId, ...props || {} });
    }
  };
}
const RenderersKey = Symbol("Renderers");
function provideRenderers(renderers) {
  provide(RenderersKey, renderers);
}
function useRenderers() {
  const renderers = inject(RenderersKey);
  if (!renderers) {
    throw new Error("useRenderers must be used within UIProvider");
  }
  return renderers;
}
function useSchemaRenderer(documentId) {
  const renderers = useRenderers();
  const { provides } = useUICapability();
  const { state: uiState } = useUIState(documentId);
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
     * ```vue
     * <component :is="renderToolbar('top', 'main')" />
     * <component :is="renderToolbar('top', 'secondary')" />
     * ```
     */
    renderToolbar: (placement, slot) => {
      var _a;
      const schema = (_a = provides.value) == null ? void 0 : _a.getSchema();
      if (!schema || !provides.value || !uiState.value) return null;
      const slotKey = `${placement}-${slot}`;
      const toolbarSlot = uiState.value.activeToolbars[slotKey];
      if (!toolbarSlot) return null;
      const toolbarSchema = schema.toolbars[toolbarSlot.toolbarId];
      if (!toolbarSchema) {
        console.warn(`Toolbar "${toolbarSlot.toolbarId}" not found in schema`);
        return null;
      }
      const isClosable = !toolbarSchema.permanent;
      const handleClose = isClosable ? () => {
        var _a2;
        (_a2 = provides.value) == null ? void 0 : _a2.forDocument(toValue(documentId)).closeToolbarSlot(placement, slot);
      } : void 0;
      const ToolbarRenderer = renderers.toolbar;
      return h(ToolbarRenderer, {
        key: toolbarSlot.toolbarId,
        schema: toolbarSchema,
        documentId: toValue(documentId),
        isOpen: toolbarSlot.isOpen,
        onClose: handleClose
      });
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
     * ```vue
     * <component :is="renderSidebar('left', 'main')" />
     * <component :is="renderSidebar('right', 'main')" />
     * ```
     */
    renderSidebar: (placement, slot) => {
      var _a, _b;
      const schema = (_a = provides.value) == null ? void 0 : _a.getSchema();
      if (!schema || !provides.value || !uiState.value) return null;
      const slotKey = `${placement}-${slot}`;
      const sidebarSlot = uiState.value.activeSidebars[slotKey];
      if (!sidebarSlot) return null;
      const sidebarSchema = (_b = schema.sidebars) == null ? void 0 : _b[sidebarSlot.sidebarId];
      if (!sidebarSchema) {
        console.warn(`Sidebar "${sidebarSlot.sidebarId}" not found in schema`);
        return null;
      }
      const handleClose = () => {
        var _a2;
        (_a2 = provides.value) == null ? void 0 : _a2.forDocument(toValue(documentId)).closeSidebarSlot(placement, slot);
      };
      const SidebarRenderer = renderers.sidebar;
      return h(SidebarRenderer, {
        key: sidebarSlot.sidebarId,
        schema: sidebarSchema,
        documentId: toValue(documentId),
        isOpen: sidebarSlot.isOpen,
        onClose: handleClose,
        sidebarProps: sidebarSlot.props
      });
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
     * ```vue
     * <component :is="renderModal()" />
     * ```
     */
    renderModal: () => {
      var _a, _b, _c;
      const schema = (_a = provides.value) == null ? void 0 : _a.getSchema();
      if (!schema || !provides.value || !((_b = uiState.value) == null ? void 0 : _b.activeModal)) return null;
      const { modalId, isOpen } = uiState.value.activeModal;
      const modalSchema = (_c = schema.modals) == null ? void 0 : _c[modalId];
      if (!modalSchema) {
        console.warn(`Modal "${modalId}" not found in schema`);
        return null;
      }
      const handleClose = () => {
        var _a2;
        (_a2 = provides.value) == null ? void 0 : _a2.forDocument(toValue(documentId)).closeModal();
      };
      const handleExited = () => {
        var _a2;
        (_a2 = provides.value) == null ? void 0 : _a2.forDocument(toValue(documentId)).clearModal();
      };
      const ModalRenderer = renderers.modal;
      if (!ModalRenderer) {
        console.warn("No modal renderer registered");
        return null;
      }
      return h(ModalRenderer, {
        key: modalId,
        schema: modalSchema,
        documentId: toValue(documentId),
        isOpen,
        onClose: handleClose,
        onExited: handleExited,
        modalProps: uiState.value.activeModal.props
      });
    },
    /**
     * Helper: Get all active toolbars for this document
     * Useful for batch rendering or debugging
     */
    getActiveToolbars: () => {
      if (!uiState.value) return [];
      return Object.entries(uiState.value.activeToolbars).map(([slotKey, toolbarSlot]) => {
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
      if (!uiState.value) return [];
      return Object.entries(uiState.value.activeSidebars).map(([slotKey, sidebarSlot]) => {
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
     * ```vue
     * <div class="relative">
     *   <slot />
     *   <component :is="renderOverlays()" />
     * </div>
     * ```
     */
    renderOverlays: () => {
      var _a;
      const schema = (_a = provides.value) == null ? void 0 : _a.getSchema();
      if (!(schema == null ? void 0 : schema.overlays) || !provides.value || !uiState.value) return null;
      const OverlayRenderer = renderers.overlay;
      if (!OverlayRenderer) {
        return null;
      }
      const overlays = Object.values(schema.overlays);
      if (overlays.length === 0) return null;
      const enabledOverlays = overlays.filter(
        (overlay) => uiState.value.enabledOverlays[overlay.id] !== false
      );
      return enabledOverlays.map(
        (overlaySchema) => h(OverlayRenderer, {
          key: overlaySchema.id,
          schema: overlaySchema,
          documentId: toValue(documentId)
        })
      );
    }
  };
}
function useSelectionMenu(menuId, documentId) {
  const { provides } = useUICapability();
  const renderers = useRenderers();
  const schema = computed(() => {
    var _a;
    return (_a = provides.value) == null ? void 0 : _a.getSchema();
  });
  const menuSchema = computed(() => {
    var _a, _b;
    return (_b = (_a = schema.value) == null ? void 0 : _a.selectionMenus) == null ? void 0 : _b[toValue(menuId)];
  });
  const renderFn = computed(() => {
    if (!menuSchema.value) {
      return void 0;
    }
    const currentMenuSchema = menuSchema.value;
    const currentDocumentId = toValue(documentId);
    const SelectionMenuRenderer = renderers.selectionMenu;
    return (props) => {
      if (!props.selected) {
        return null;
      }
      return h(SelectionMenuRenderer, {
        schema: currentMenuSchema,
        documentId: currentDocumentId,
        props
      });
    };
  });
  return renderFn;
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "auto-menu-renderer",
  props: {
    documentId: {},
    container: {}
  },
  setup(__props) {
    const props = __props;
    const { state: uiState } = useUIState(() => props.documentId);
    const { provides } = useUICapability();
    const anchorRegistry = useAnchorRegistry();
    const renderers = useRenderers();
    const activeMenu = ref(null);
    const openMenus = computed(() => {
      var _a;
      return ((_a = uiState.value) == null ? void 0 : _a.openMenus) || {};
    });
    const schema = computed(() => {
      var _a;
      return (_a = provides.value) == null ? void 0 : _a.getSchema();
    });
    watch(
      openMenus,
      (menus) => {
        const openMenuIds = Object.keys(menus);
        if (openMenuIds.length > 0) {
          const menuId = openMenuIds[0];
          if (!menuId) {
            activeMenu.value = null;
            return;
          }
          const menuState = menus[menuId];
          if (menuState && menuState.triggeredByItemId) {
            const anchor = anchorRegistry.getAnchor(props.documentId, menuState.triggeredByItemId);
            activeMenu.value = { menuId, anchorEl: anchor };
          } else {
            activeMenu.value = null;
          }
        } else {
          activeMenu.value = null;
        }
      },
      { immediate: true }
    );
    const menuSchema = computed(() => {
      if (!activeMenu.value || !schema.value) return null;
      const menuSchemaValue = schema.value.menus[activeMenu.value.menuId];
      if (!menuSchemaValue) {
        console.warn(`Menu "${activeMenu.value.menuId}" not found in schema`);
        return null;
      }
      return menuSchemaValue;
    });
    const handleClose = () => {
      var _a;
      if (activeMenu.value) {
        (_a = provides.value) == null ? void 0 : _a.forDocument(props.documentId).closeMenu(activeMenu.value.menuId);
      }
    };
    const MenuRenderer = computed(() => renderers.menu);
    return (_ctx, _cache) => {
      return activeMenu.value && menuSchema.value && MenuRenderer.value ? (openBlock(), createBlock(resolveDynamicComponent(MenuRenderer.value), {
        key: 0,
        schema: menuSchema.value,
        documentId: __props.documentId,
        anchorEl: activeMenu.value.anchorEl,
        onClose: handleClose,
        container: __props.container
      }, null, 40, ["schema", "documentId", "anchorEl", "container"])) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "root",
  setup(__props) {
    const attrs = useAttrs();
    const { plugin } = useUIPlugin();
    const { provides } = useUICapability();
    const disabledCategories = ref([]);
    const hiddenItems = ref([]);
    const rootRef = ref(null);
    const containerContext = {
      containerRef: rootRef,
      getContainer: () => rootRef.value
    };
    provide(UI_CONTAINER_KEY, containerContext);
    let styleEl = null;
    let styleTarget = null;
    function getStyleTarget(element) {
      const root = element.getRootNode();
      if (root instanceof ShadowRoot) {
        return root;
      }
      return document.head;
    }
    function injectStyles() {
      if (!rootRef.value || !plugin.value) {
        return;
      }
      styleTarget = getStyleTarget(rootRef.value);
      const existingStyle = styleTarget.querySelector(UI_SELECTORS.STYLES);
      if (existingStyle) {
        styleEl = existingStyle;
        existingStyle.textContent = plugin.value.getStylesheet();
        return;
      }
      const stylesheet = plugin.value.getStylesheet();
      const newStyleEl = document.createElement("style");
      newStyleEl.setAttribute(UI_ATTRIBUTES.STYLES, "");
      newStyleEl.textContent = stylesheet;
      if (styleTarget instanceof ShadowRoot) {
        styleTarget.insertBefore(newStyleEl, styleTarget.firstChild);
      } else {
        styleTarget.appendChild(newStyleEl);
      }
      styleEl = newStyleEl;
    }
    function cleanupStyles() {
      if (styleEl == null ? void 0 : styleEl.parentNode) {
        styleEl.remove();
      }
      styleEl = null;
      styleTarget = null;
    }
    const rootAttrs = computed(() => {
      const result = {
        [UI_ATTRIBUTES.ROOT]: ""
      };
      if (disabledCategories.value.length > 0) {
        result[UI_ATTRIBUTES.DISABLED_CATEGORIES] = disabledCategories.value.join(" ");
      }
      if (hiddenItems.value.length > 0) {
        result[UI_ATTRIBUTES.HIDDEN_ITEMS] = hiddenItems.value.join(" ");
      }
      return result;
    });
    let stylesheetCleanup = null;
    let categoryCleanup = null;
    onMounted(() => {
      injectStyles();
      if (plugin.value) {
        stylesheetCleanup = plugin.value.onStylesheetInvalidated(() => {
          if (styleEl && plugin.value) {
            styleEl.textContent = plugin.value.getStylesheet();
          }
        });
      }
      if (provides.value) {
        disabledCategories.value = provides.value.getDisabledCategories();
        hiddenItems.value = provides.value.getHiddenItems();
        categoryCleanup = provides.value.onCategoryChanged((event) => {
          disabledCategories.value = event.disabledCategories;
          hiddenItems.value = event.hiddenItems;
        });
      }
    });
    onUnmounted(() => {
      cleanupStyles();
      stylesheetCleanup == null ? void 0 : stylesheetCleanup();
      categoryCleanup == null ? void 0 : categoryCleanup();
    });
    watch(plugin, () => {
      if (rootRef.value && plugin.value) {
        injectStyles();
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "rootRef",
        ref: rootRef
      }, { ...unref(attrs), ...rootAttrs.value }, { style: { containerType: "inline-size" } }), [
        renderSlot(_ctx.$slots, "default")
      ], 16);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "provider",
  props: {
    documentId: {},
    components: { default: () => ({}) },
    renderers: {},
    menuContainer: { default: null }
  },
  setup(__props) {
    const attrs = useAttrs();
    const props = __props;
    provideAnchorRegistry();
    provideComponentRegistry(props.components);
    provideRenderers(props.renderers);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, normalizeProps(guardReactiveProps(unref(attrs))), {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default"),
          createVNode(_sfc_main$2, {
            documentId: __props.documentId,
            container: __props.menuContainer
          }, null, 8, ["documentId", "container"])
        ]),
        _: 3
      }, 16);
    };
  }
});
export {
  _sfc_main$2 as AutoMenuRenderer,
  _sfc_main as UIProvider,
  UI_CONTAINER_KEY,
  createAnchorRegistry,
  createComponentRegistry,
  provideAnchorRegistry,
  provideComponentRegistry,
  provideRenderers,
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
