import { BasePlugin, createBehaviorEmitter, createEmitter, createScopedEmitter } from "@embedpdf/core";
const UI_PLUGIN_ID = "ui";
const manifest = {
  id: UI_PLUGIN_ID,
  name: "UI Plugin",
  version: "1.0.0",
  provides: ["ui"],
  requires: [],
  optional: ["i18n"],
  defaultConfig: {
    schema: {
      id: "empty",
      version: "1.0.0",
      toolbars: {},
      menus: {},
      sidebars: {},
      modals: {},
      selectionMenus: {}
    }
  }
};
const INIT_UI_STATE = "UI/INIT_STATE";
const CLEANUP_UI_STATE = "UI/CLEANUP_STATE";
const SET_ACTIVE_TOOLBAR = "UI/SET_ACTIVE_TOOLBAR";
const CLOSE_TOOLBAR_SLOT = "UI/CLOSE_TOOLBAR_SLOT";
const SET_ACTIVE_SIDEBAR = "UI/SET_ACTIVE_SIDEBAR";
const CLOSE_SIDEBAR_SLOT = "UI/CLOSE_SIDEBAR_SLOT";
const SET_SIDEBAR_TAB = "UI/SET_SIDEBAR_TAB";
const OPEN_MODAL = "UI/OPEN_MODAL";
const CLOSE_MODAL = "UI/CLOSE_MODAL";
const CLEAR_MODAL = "UI/CLEAR_MODAL";
const OPEN_MENU = "UI/OPEN_MENU";
const CLOSE_MENU = "UI/CLOSE_MENU";
const CLOSE_ALL_MENUS = "UI/CLOSE_ALL_MENUS";
const SET_OVERLAY_ENABLED = "UI/SET_OVERLAY_ENABLED";
const SET_DISABLED_CATEGORIES = "UI/SET_DISABLED_CATEGORIES";
const SET_HIDDEN_ITEMS = "UI/SET_HIDDEN_ITEMS";
const initUIState = (documentId, schema) => ({
  type: INIT_UI_STATE,
  payload: { documentId, schema }
});
const cleanupUIState = (documentId) => ({
  type: CLEANUP_UI_STATE,
  payload: { documentId }
});
const setActiveToolbar = (documentId, placement, slot, toolbarId) => ({
  type: SET_ACTIVE_TOOLBAR,
  payload: { documentId, placement, slot, toolbarId }
});
const closeToolbarSlot = (documentId, placement, slot) => ({
  type: CLOSE_TOOLBAR_SLOT,
  payload: { documentId, placement, slot }
});
const setActiveSidebar = (documentId, placement, slot, sidebarId, activeTab, props) => ({
  type: SET_ACTIVE_SIDEBAR,
  payload: { documentId, placement, slot, sidebarId, activeTab, props }
});
const closeSidebarSlot = (documentId, placement, slot) => ({
  type: CLOSE_SIDEBAR_SLOT,
  payload: { documentId, placement, slot }
});
const setSidebarTab = (documentId, sidebarId, tabId) => ({
  type: SET_SIDEBAR_TAB,
  payload: { documentId, sidebarId, tabId }
});
const openModal = (documentId, modalId, props) => ({
  type: OPEN_MODAL,
  payload: { documentId, modalId, props }
});
const closeModal = (documentId) => ({
  type: CLOSE_MODAL,
  payload: { documentId }
});
const clearModal = (documentId) => ({
  type: CLEAR_MODAL,
  payload: { documentId }
});
const openMenu = (documentId, menuState) => ({
  type: OPEN_MENU,
  payload: { documentId, menuState }
});
const closeMenu = (documentId, menuId) => ({
  type: CLOSE_MENU,
  payload: { documentId, menuId }
});
const closeAllMenus = (documentId) => ({
  type: CLOSE_ALL_MENUS,
  payload: { documentId }
});
const setOverlayEnabled = (documentId, overlayId, enabled) => ({
  type: SET_OVERLAY_ENABLED,
  payload: { documentId, overlayId, enabled }
});
const setDisabledCategories = (categories) => ({
  type: SET_DISABLED_CATEGORIES,
  payload: { categories }
});
const setHiddenItems = (hiddenItems) => ({
  type: SET_HIDDEN_ITEMS,
  payload: { hiddenItems }
});
function mergeUISchema(base, override) {
  return {
    ...base,
    ...override,
    toolbars: mergeToolbars(base.toolbars, override.toolbars),
    menus: mergeMenus(base.menus, override.menus),
    sidebars: mergeSidebars(base.sidebars, override.sidebars)
  };
}
function mergeToolbars(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const [id, toolbar] of Object.entries(override)) {
    if (result[id]) {
      result[id] = {
        ...result[id],
        ...toolbar,
        items: toolbar.items ?? result[id].items,
        responsive: toolbar.responsive ?? result[id].responsive
      };
    } else {
      result[id] = toolbar;
    }
  }
  return result;
}
function mergeMenus(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const [id, menu] of Object.entries(override)) {
    if (result[id]) {
      result[id] = {
        ...result[id],
        ...menu,
        items: menu.items ?? result[id].items
      };
    } else {
      result[id] = menu;
    }
  }
  return result;
}
function mergeSidebars(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const [id, panel] of Object.entries(override)) {
    if (result[id]) {
      result[id] = {
        ...result[id],
        ...panel,
        content: panel.content ?? result[id].content
      };
    } else {
      result[id] = panel;
    }
  }
  return result;
}
function removeFromSchema(schema, options) {
  const result = { ...schema };
  if (options.toolbars) {
    result.toolbars = { ...result.toolbars };
    options.toolbars.forEach((id) => delete result.toolbars[id]);
  }
  if (options.menus) {
    result.menus = { ...result.menus };
    options.menus.forEach((id) => delete result.menus[id]);
  }
  if (options.sidebars) {
    result.sidebars = { ...result.sidebars };
    options.sidebars.forEach((id) => delete result.sidebars[id]);
  }
  if (options.commands) {
    result.toolbars = removeCommandsFromToolbars(result.toolbars, options.commands);
    result.menus = removeCommandsFromMenus(result.menus, options.commands);
  }
  return result;
}
function removeCommandsFromToolbars(toolbars, commandIds) {
  const result = {};
  for (const [id, toolbar] of Object.entries(toolbars)) {
    result[id] = {
      ...toolbar,
      items: toolbar.items.filter((item) => {
        if (item.type === "command-button") {
          return !commandIds.includes(item.commandId);
        }
        if (item.type === "group") {
          return item.items.some(
            (child) => child.type === "command-button" ? !commandIds.includes(child.commandId) : true
          );
        }
        if (item.type === "tab-group") {
          return item.tabs.some((tab) => !commandIds.includes(tab.commandId));
        }
        return true;
      })
    };
  }
  return result;
}
function removeCommandsFromMenus(menus, commandIds) {
  const result = {};
  for (const [id, menu] of Object.entries(menus)) {
    result[id] = {
      ...menu,
      items: menu.items.filter((item) => {
        if (item.type === "command") {
          return !commandIds.includes(item.commandId);
        }
        if (item.type === "section") {
          return item.items.some(
            (child) => child.type === "command" ? !commandIds.includes(child.commandId) : true
          );
        }
        return true;
      })
    };
  }
  return result;
}
function resolveResponsiveMetadata(schema, currentLocale) {
  var _a;
  if (!((_a = schema.responsive) == null ? void 0 : _a.breakpoints)) {
    return null;
  }
  const effectiveBreakpoints = applyLocaleOverrides(
    schema.responsive.breakpoints,
    schema.responsive.localeOverrides,
    currentLocale
  );
  const items = /* @__PURE__ */ new Map();
  const breakpoints = /* @__PURE__ */ new Map();
  for (const [breakpointId, config] of Object.entries(effectiveBreakpoints)) {
    breakpoints.set(breakpointId, {
      minWidth: config.minWidth,
      maxWidth: config.maxWidth
    });
  }
  const allItemIds = /* @__PURE__ */ new Set();
  const collectItemIds = (items2) => {
    items2.forEach((item) => {
      allItemIds.add(item.id);
      if (item.type === "group" && item.items) {
        collectItemIds(item.items);
      }
      if (item.type === "tab-group" && item.tabs) {
        collectItemIds(item.tabs);
      }
      if (item.type === "section" && item.items) {
        collectItemIds(item.items);
      }
    });
  };
  collectItemIds(schema.items);
  for (const itemId of allItemIds) {
    const rules = [];
    let defaultVisible = true;
    const sortedBreakpoints = Array.from(Object.entries(effectiveBreakpoints)).sort((a, b) => {
      const aMin = a[1].minWidth ?? 0;
      const bMin = b[1].minWidth ?? 0;
      return aMin - bMin;
    });
    sortedBreakpoints.forEach(([breakpointId, config], index) => {
      var _a2, _b;
      const isHidden = (_a2 = config.hide) == null ? void 0 : _a2.includes(itemId);
      const isShown = (_b = config.show) == null ? void 0 : _b.includes(itemId);
      if (!isHidden && !isShown) {
        return;
      }
      rules.push({
        breakpointId,
        minWidth: config.minWidth,
        maxWidth: config.maxWidth,
        visible: isShown || !isHidden,
        priority: index
      });
      if (index === 0) {
        defaultVisible = isShown || !isHidden;
      }
    });
    if (rules.length > 0) {
      items.set(itemId, {
        itemId,
        shouldRender: true,
        // Always render for SSR
        visibilityRules: rules,
        defaultVisible
      });
    }
  }
  return { items, breakpoints };
}
function applyLocaleOverrides(baseBreakpoints, localeOverrides, currentLocale) {
  if (!currentLocale || !(localeOverrides == null ? void 0 : localeOverrides.groups)) {
    return baseBreakpoints;
  }
  const matchingGroup = localeOverrides.groups.find(
    (group) => group.locales.includes(currentLocale)
  );
  if (!matchingGroup) {
    return baseBreakpoints;
  }
  const effective = {};
  for (const [breakpointId, baseRule] of Object.entries(baseBreakpoints)) {
    const override = matchingGroup.breakpoints[breakpointId];
    if (!override) {
      effective[breakpointId] = baseRule;
      continue;
    }
    effective[breakpointId] = {
      // Width constraints never change!
      minWidth: baseRule.minWidth,
      maxWidth: baseRule.maxWidth,
      // Merge hide lists (base + additional) or use replacement
      hide: override.replaceHide ? override.replaceHide : [...baseRule.hide || [], ...override.hide || []],
      // Merge show lists (base + additional) or use replacement
      show: override.replaceShow ? override.replaceShow : [...baseRule.show || [], ...override.show || []]
    };
  }
  return effective;
}
function getItemResponsiveMetadata(itemId, schema, currentLocale) {
  const metadata = resolveResponsiveMetadata(schema, currentLocale);
  return (metadata == null ? void 0 : metadata.items.get(itemId)) ?? null;
}
const UI_ATTRIBUTES = {
  /** Root element marker */
  ROOT: "data-epdf",
  /** Style element marker for deduplication */
  STYLES: "data-epdf-s",
  /** Item ID for responsive and dependency rules */
  ITEM: "data-epdf-i",
  /** Item categories for category-based hiding */
  CATEGORIES: "data-epdf-cat",
  /** Disabled categories list on root element */
  DISABLED_CATEGORIES: "data-epdf-dis",
  /** Hidden item IDs (computed from disabled categories) */
  HIDDEN_ITEMS: "data-epdf-hid"
};
const UI_SELECTORS = {
  ROOT: `[${UI_ATTRIBUTES.ROOT}]`,
  STYLES: `[${UI_ATTRIBUTES.STYLES}]`,
  ITEM: (id) => `[${UI_ATTRIBUTES.ITEM}="${id}"]`,
  CATEGORIES: (category) => `[${UI_ATTRIBUTES.CATEGORIES}~="${category}"]`,
  DISABLED_CATEGORY: (category) => `[${UI_ATTRIBUTES.DISABLED_CATEGORIES}~="${category}"]`,
  HIDDEN_ITEM: (itemId) => `[${UI_ATTRIBUTES.HIDDEN_ITEMS}~="${itemId}"]`
};
const DEFAULT_CONFIG = {
  useContainerQueries: true
};
function generateUIStylesheet(schema, options = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...options.config };
  const locale = options.locale;
  const analysis = analyzeSchema(schema, locale);
  const sections = [];
  sections.push(generateHeader(locale));
  const responsiveCSS = generateResponsiveRules(analysis, cfg);
  if (responsiveCSS) sections.push(responsiveCSS);
  const categoryCSS = generateCategoryRules(analysis);
  if (categoryCSS) sections.push(categoryCSS);
  const dependencyCSS = generateDependencyRules(analysis, cfg);
  if (dependencyCSS) sections.push(dependencyCSS);
  return sections.filter((s) => s.trim()).join("\n\n");
}
function extractCategories(schema) {
  const analysis = analyzeSchema(schema);
  return Array.from(analysis.categories).sort();
}
function extractItemCategories(schema) {
  const analysis = analyzeSchema(schema);
  return analysis.itemCategories;
}
function computeHiddenItems(itemCategories, disabledCategories) {
  const disabledSet = new Set(disabledCategories);
  const hiddenItems = [];
  itemCategories.forEach((categories, itemId) => {
    if (categories.some((cat) => disabledSet.has(cat))) {
      hiddenItems.push(itemId);
    }
  });
  return hiddenItems;
}
function getStylesheetConfig(config = {}) {
  return { ...DEFAULT_CONFIG, ...config };
}
function analyzeSchema(schema, locale) {
  const categories = /* @__PURE__ */ new Set();
  const itemCategories = /* @__PURE__ */ new Map();
  const dependencies = [];
  const menuBreakpoints = /* @__PURE__ */ new Map();
  const responsiveItems = /* @__PURE__ */ new Map();
  for (const [menuId, menu] of Object.entries(schema.menus)) {
    analyzeMenu(
      menuId,
      menu,
      categories,
      itemCategories,
      dependencies,
      menuBreakpoints,
      responsiveItems,
      locale
    );
  }
  for (const [toolbarId, toolbar] of Object.entries(schema.toolbars)) {
    analyzeToolbar(
      toolbarId,
      toolbar,
      categories,
      itemCategories,
      dependencies,
      responsiveItems,
      locale
    );
  }
  for (const [panelId, panel] of Object.entries(schema.sidebars)) {
    analyzePanel(panelId, panel, categories, itemCategories, dependencies);
  }
  for (const [selMenuId, selMenu] of Object.entries(schema.selectionMenus || {})) {
    analyzeSelectionMenu(
      selMenuId,
      selMenu,
      categories,
      itemCategories,
      dependencies,
      responsiveItems,
      locale
    );
  }
  for (const [overlayId, overlay] of Object.entries(schema.overlays || {})) {
    collectCategoriesAndDependency(
      overlayId,
      overlay.categories,
      overlay.visibilityDependsOn,
      categories,
      itemCategories,
      dependencies
    );
  }
  return { categories, itemCategories, dependencies, menuBreakpoints, responsiveItems };
}
function analyzeMenu(menuId, menu, categories, itemCategories, dependencies, menuBreakpoints, responsiveItems, locale) {
  collectCategoriesAndDependency(
    menuId,
    menu.categories,
    menu.visibilityDependsOn,
    categories,
    itemCategories,
    dependencies
  );
  analyzeMenuItems(menu.items, categories, itemCategories, dependencies);
  const metadata = resolveResponsiveMetadata(menu, locale);
  if (metadata) {
    metadata.items.forEach((itemMeta, itemId) => {
      responsiveItems.set(itemId, itemMeta);
    });
  }
  const breakpointVisibilities = computeMenuBreakpointVisibilities(menu, itemCategories, locale);
  menuBreakpoints.set(menuId, breakpointVisibilities);
}
function analyzeMenuItems(items, categories, itemCategories, dependencies) {
  for (const item of items) {
    collectCategoriesAndDependency(
      item.id,
      item.categories,
      item.visibilityDependsOn,
      categories,
      itemCategories,
      dependencies
    );
    if (item.type === "section") {
      analyzeMenuItems(item.items, categories, itemCategories, dependencies);
    }
  }
}
function computeMenuBreakpointVisibilities(menu, itemCategories, locale) {
  var _a;
  const breakpointVisibilities = [];
  const metadata = resolveResponsiveMetadata(menu, locale);
  if (((_a = menu.responsive) == null ? void 0 : _a.breakpoints) && metadata) {
    const sortedBreakpoints = Array.from(metadata.breakpoints.entries()).sort(
      (a, b) => (a[1].minWidth ?? 0) - (b[1].minWidth ?? 0)
    );
    for (const [_bpId, bp] of sortedBreakpoints) {
      const visibleItems = computeVisibleItemsAtBreakpoint(metadata, bp);
      const visibleCats = /* @__PURE__ */ new Set();
      for (const itemId of visibleItems) {
        const cats = itemCategories.get(itemId);
        if (cats) cats.forEach((c) => visibleCats.add(c));
      }
      breakpointVisibilities.push({
        minWidth: bp.minWidth,
        maxWidth: bp.maxWidth,
        visibleItemIds: visibleItems,
        visibleCategories: visibleCats
      });
    }
  } else {
    const allItemIds = [];
    const allCats = /* @__PURE__ */ new Set();
    collectAllMenuItemInfo(menu.items, itemCategories, allItemIds, allCats);
    breakpointVisibilities.push({ visibleItemIds: allItemIds, visibleCategories: allCats });
  }
  return breakpointVisibilities;
}
function collectAllMenuItemInfo(items, itemCategories, resultIds, resultCats) {
  for (const item of items) {
    resultIds.push(item.id);
    const cats = itemCategories.get(item.id);
    if (cats) cats.forEach((c) => resultCats.add(c));
    if (item.type === "section") {
      collectAllMenuItemInfo(item.items, itemCategories, resultIds, resultCats);
    }
  }
}
function computeVisibleItemsAtBreakpoint(metadata, targetBp) {
  const visible = [];
  metadata.items.forEach((itemMeta, itemId) => {
    let isVisible = itemMeta.defaultVisible;
    for (const rule of itemMeta.visibilityRules) {
      const ruleApplies = (rule.minWidth === void 0 || targetBp.minWidth !== void 0 && targetBp.minWidth >= rule.minWidth) && (rule.maxWidth === void 0 || targetBp.maxWidth !== void 0 && targetBp.maxWidth <= rule.maxWidth);
      if (ruleApplies) {
        isVisible = rule.visible;
      }
    }
    if (isVisible) {
      visible.push(itemId);
    }
  });
  return visible;
}
function analyzeToolbar(toolbarId, toolbar, categories, itemCategories, dependencies, responsiveItems, locale) {
  collectCategoriesAndDependency(
    toolbarId,
    toolbar.categories,
    toolbar.visibilityDependsOn,
    categories,
    itemCategories,
    dependencies
  );
  const metadata = resolveResponsiveMetadata(toolbar, locale);
  if (metadata) {
    metadata.items.forEach((itemMeta, itemId) => {
      responsiveItems.set(itemId, itemMeta);
    });
  }
  analyzeToolbarItems(toolbar.items, categories, itemCategories, dependencies);
}
function analyzeToolbarItems(items, categories, itemCategories, dependencies) {
  for (const item of items) {
    collectCategoriesAndDependency(
      item.id,
      item.categories,
      item.visibilityDependsOn,
      categories,
      itemCategories,
      dependencies
    );
    if (item.type === "group" && item.items) {
      analyzeToolbarItems(item.items, categories, itemCategories, dependencies);
    }
    if (item.type === "tab-group" && item.tabs) {
      analyzeTabItems(item.tabs, categories, itemCategories, dependencies);
    }
  }
}
function analyzeTabItems(tabs, categories, itemCategories, dependencies) {
  for (const tab of tabs) {
    collectCategoriesAndDependency(
      tab.id,
      tab.categories,
      tab.visibilityDependsOn,
      categories,
      itemCategories,
      dependencies
    );
  }
}
function analyzePanel(panelId, panel, categories, itemCategories, dependencies) {
  collectCategoriesAndDependency(
    panelId,
    panel.categories,
    panel.visibilityDependsOn,
    categories,
    itemCategories,
    dependencies
  );
  if (panel.content.type === "tabs") {
    for (const tab of panel.content.tabs) {
      collectCategoriesAndDependency(
        tab.id,
        tab.categories,
        tab.visibilityDependsOn,
        categories,
        itemCategories,
        dependencies
      );
    }
  }
}
function analyzeSelectionMenu(selMenuId, selMenu, categories, itemCategories, dependencies, responsiveItems, locale) {
  collectCategoriesAndDependency(
    selMenuId,
    selMenu.categories,
    selMenu.visibilityDependsOn,
    categories,
    itemCategories,
    dependencies
  );
  if (selMenu.responsive) {
    const metadata = resolveResponsiveMetadata(selMenu, locale);
    if (metadata) {
      metadata.items.forEach((itemMeta, itemId) => {
        responsiveItems.set(itemId, itemMeta);
      });
    }
  }
  analyzeSelectionMenuItems(selMenu.items, categories, itemCategories, dependencies);
}
function analyzeSelectionMenuItems(items, categories, itemCategories, dependencies) {
  for (const item of items) {
    collectCategoriesAndDependency(
      item.id,
      item.categories,
      item.visibilityDependsOn,
      categories,
      itemCategories,
      dependencies
    );
    if (item.type === "group" && item.items) {
      analyzeSelectionMenuItems(item.items, categories, itemCategories, dependencies);
    }
  }
}
function collectCategoriesAndDependency(itemId, itemCats, visibilityDep, categories, itemCategories, dependencies) {
  var _a;
  if (itemCats == null ? void 0 : itemCats.length) {
    itemCats.forEach((c) => categories.add(c));
    itemCategories.set(itemId, itemCats);
  }
  if (visibilityDep && (visibilityDep.menuId || ((_a = visibilityDep.itemIds) == null ? void 0 : _a.length))) {
    dependencies.push({
      itemId,
      dependsOnMenuId: visibilityDep.menuId,
      dependsOnItemIds: visibilityDep.itemIds
    });
  }
}
function generateHeader(locale) {
  const localeInfo = locale ? ` (locale: ${locale})` : "";
  return `/* ═══════════════════════════════════════════════════════════════════════════ */
/* EmbedPDF UI Stylesheet - Auto-generated${localeInfo}                         */
/* DO NOT EDIT MANUALLY - This file is generated from your UI schema            */
/* ═══════════════════════════════════════════════════════════════════════════ */`;
}
function generateResponsiveRules(analysis, cfg) {
  const rules = [];
  const queryType = cfg.useContainerQueries ? "@container" : "@media";
  const processedItems = /* @__PURE__ */ new Set();
  analysis.responsiveItems.forEach((itemMeta, itemId) => {
    if (processedItems.has(itemId)) return;
    processedItems.add(itemId);
    const itemRules = generateItemResponsiveRules(itemId, itemMeta, queryType);
    if (itemRules) rules.push(itemRules);
  });
  if (rules.length === 0) return "";
  return `/* ─── Responsive Visibility Rules ─── */
/* Items show/hide based on container width */

${rules.join("\n\n")}`;
}
function generateItemResponsiveRules(itemId, metadata, queryType, cfg) {
  if (metadata.visibilityRules.length === 0) return null;
  const rules = [];
  const selector = UI_SELECTORS.ITEM(itemId);
  if (!metadata.defaultVisible) {
    rules.push(`${selector} { display: none; }`);
  }
  for (const rule of metadata.visibilityRules) {
    const conditions = [];
    if (rule.minWidth !== void 0) {
      conditions.push(`(min-width: ${rule.minWidth}px)`);
    }
    if (rule.maxWidth !== void 0) {
      conditions.push(`(max-width: ${rule.maxWidth}px)`);
    }
    if (conditions.length > 0) {
      const display = rule.visible ? "flex" : "none";
      rules.push(`${queryType} ${conditions.join(" and ")} {
  ${selector} { display: ${display}; }
}`);
    }
  }
  return rules.length > 0 ? rules.join("\n") : null;
}
function generateCategoryRules(analysis, cfg) {
  if (analysis.categories.size === 0) return "";
  const rules = [];
  const sortedCategories = Array.from(analysis.categories).sort();
  for (const category of sortedCategories) {
    rules.push(
      `${UI_SELECTORS.ROOT}[${UI_ATTRIBUTES.DISABLED_CATEGORIES}~="${category}"] [${UI_ATTRIBUTES.CATEGORIES}~="${category}"] {
  display: none !important;
}`
    );
  }
  return `/* ─── Category Visibility Rules ─── */
/* Items hide when ANY of their categories is disabled */
/* Use: data-disabled-categories="category1 category2" on root element */

${rules.join("\n\n")}`;
}
function generateDependencyRules(analysis, cfg) {
  if (analysis.dependencies.length === 0) return "";
  const rules = [];
  const queryType = cfg.useContainerQueries ? "@container" : "@media";
  for (const dep of analysis.dependencies) {
    const depRules = generateSingleDependencyRules(dep, analysis, queryType);
    if (depRules.length > 0) {
      rules.push(...depRules);
    }
  }
  if (rules.length === 0) return "";
  return `/* ─── Dependency Visibility Rules ─── */
/* Container elements hide when all their dependencies are hidden */

${rules.join("\n\n")}`;
}
function generateSingleDependencyRules(dep, analysis, queryType, cfg) {
  var _a;
  const rules = [];
  if (dep.dependsOnMenuId) {
    const breakpoints = analysis.menuBreakpoints.get(dep.dependsOnMenuId);
    if (breakpoints && breakpoints.length > 0) {
      rules.push(`/* "${dep.itemId}" depends on menu "${dep.dependsOnMenuId}" */`);
      for (const bp of breakpoints) {
        if (bp.visibleItemIds.length === 0) continue;
        const hiddenItemSelectors = bp.visibleItemIds.sort().map((id) => UI_SELECTORS.HIDDEN_ITEM(id)).join("");
        const cssRule = `${UI_SELECTORS.ROOT}${hiddenItemSelectors} ${UI_SELECTORS.ITEM(dep.itemId)} {
  display: none !important;
}`;
        const conditions = [];
        if (bp.minWidth !== void 0) conditions.push(`(min-width: ${bp.minWidth}px)`);
        if (bp.maxWidth !== void 0) conditions.push(`(max-width: ${bp.maxWidth}px)`);
        if (conditions.length > 0) {
          rules.push(`${queryType} ${conditions.join(" and ")} {
  ${cssRule}
}`);
        } else {
          rules.push(cssRule);
        }
      }
    }
  }
  if ((_a = dep.dependsOnItemIds) == null ? void 0 : _a.length) {
    rules.push(`/* "${dep.itemId}" depends on items: ${dep.dependsOnItemIds.join(", ")} */`);
    const hiddenItemSelectors = dep.dependsOnItemIds.sort().map((id) => UI_SELECTORS.HIDDEN_ITEM(id)).join("");
    rules.push(`${UI_SELECTORS.ROOT}${hiddenItemSelectors} ${UI_SELECTORS.ITEM(dep.itemId)} {
  display: none !important;
}`);
  }
  return rules;
}
function getUIItemProps(item, extra) {
  var _a;
  const props = {
    [UI_ATTRIBUTES.ITEM]: item.id,
    [UI_ATTRIBUTES.CATEGORIES]: ((_a = item.categories) == null ? void 0 : _a.join(" ")) || void 0,
    ...extra
  };
  return props;
}
const _UIPlugin = class _UIPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b;
    super(id, registry);
    this.cachedStylesheet = null;
    this.cachedLocale = null;
    this.i18n = null;
    this.i18nCleanup = null;
    this.categoryChanged$ = createBehaviorEmitter();
    this.stylesheetInvalidated$ = createEmitter();
    this.toolbarChanged$ = createScopedEmitter((documentId, data) => ({ documentId, ...data }), { cache: false });
    this.sidebarChanged$ = createScopedEmitter((documentId, data) => ({ documentId, ...data }), { cache: false });
    this.modalChanged$ = createScopedEmitter(
      (documentId, data) => ({ documentId, ...data }),
      { cache: false }
    );
    this.menuChanged$ = createScopedEmitter(
      (documentId, data) => ({ documentId, ...data }),
      { cache: false }
    );
    this.overlayChanged$ = createScopedEmitter((documentId, data) => ({ documentId, ...data }), { cache: false });
    this.schema = config.schema;
    this.stylesheetConfig = config.stylesheetConfig || {};
    this.itemCategories = extractItemCategories(this.schema);
    if ((_a = config.disabledCategories) == null ? void 0 : _a.length) {
      this.dispatch(setDisabledCategories(config.disabledCategories));
      const hiddenItems = computeHiddenItems(this.itemCategories, config.disabledCategories);
      this.dispatch(setHiddenItems(hiddenItems));
    }
    this.i18n = ((_b = registry.getPlugin("i18n")) == null ? void 0 : _b.provides()) ?? null;
    if (this.i18n) {
      this.i18nCleanup = this.i18n.onLocaleChange(({ currentLocale }) => {
        this.handleLocaleChange(currentLocale);
      });
      this.cachedLocale = this.i18n.getLocale();
    }
  }
  async initialize() {
    this.logger.info("UIPlugin", "Initialize", "UI plugin initialized");
  }
  async destroy() {
    if (this.i18nCleanup) {
      this.i18nCleanup();
      this.i18nCleanup = null;
    }
    this.toolbarChanged$.clear();
    this.sidebarChanged$.clear();
    this.modalChanged$.clear();
    this.menuChanged$.clear();
    this.overlayChanged$.clear();
    this.stylesheetInvalidated$.clear();
    super.destroy();
  }
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initUIState(documentId, this.schema));
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupUIState(documentId));
    this.toolbarChanged$.clearScope(documentId);
    this.sidebarChanged$.clearScope(documentId);
    this.modalChanged$.clearScope(documentId);
    this.menuChanged$.clearScope(documentId);
    this.overlayChanged$.clearScope(documentId);
  }
  /**
   * Handle locale changes from i18n plugin.
   * Invalidates stylesheet and emits change event.
   */
  handleLocaleChange(newLocale) {
    if (this.cachedLocale === newLocale) return;
    this.logger.debug(
      "UIPlugin",
      "LocaleChange",
      `Locale changed: ${this.cachedLocale} -> ${newLocale}`
    );
    this.cachedLocale = newLocale;
    this.invalidateStylesheet();
    this.stylesheetInvalidated$.emit();
  }
  /**
   * Get the generated CSS stylesheet.
   * Automatically regenerates if locale has changed.
   * This is pure logic - DOM injection is handled by framework layer.
   */
  getStylesheet() {
    var _a;
    const currentLocale = ((_a = this.i18n) == null ? void 0 : _a.getLocale()) ?? null;
    if (this.cachedStylesheet && this.cachedLocale === currentLocale) {
      return this.cachedStylesheet;
    }
    this.cachedStylesheet = generateUIStylesheet(this.schema, {
      config: this.stylesheetConfig,
      locale: currentLocale ?? void 0
    });
    this.cachedLocale = currentLocale;
    return this.cachedStylesheet;
  }
  /**
   * Get the current locale (if i18n is available)
   */
  getLocale() {
    var _a;
    return ((_a = this.i18n) == null ? void 0 : _a.getLocale()) ?? null;
  }
  /**
   * Regenerate stylesheet (call after schema changes)
   */
  invalidateStylesheet() {
    this.cachedStylesheet = null;
  }
  onStylesheetInvalidated(listener) {
    return this.stylesheetInvalidated$.on(listener);
  }
  // ─────────────────────────────────────────────────────────
  // Category Management
  // ─────────────────────────────────────────────────────────
  disableCategoryImpl(category) {
    const current = new Set(this.state.disabledCategories);
    if (!current.has(category)) {
      current.add(category);
      const categories = Array.from(current);
      this.dispatch(setDisabledCategories(categories));
      const hiddenItems = computeHiddenItems(this.itemCategories, categories);
      this.dispatch(setHiddenItems(hiddenItems));
      this.categoryChanged$.emit({ disabledCategories: categories, hiddenItems });
    }
  }
  enableCategoryImpl(category) {
    const current = new Set(this.state.disabledCategories);
    if (current.has(category)) {
      current.delete(category);
      const categories = Array.from(current);
      this.dispatch(setDisabledCategories(categories));
      const hiddenItems = computeHiddenItems(this.itemCategories, categories);
      this.dispatch(setHiddenItems(hiddenItems));
      this.categoryChanged$.emit({ disabledCategories: categories, hiddenItems });
    }
  }
  toggleCategoryImpl(category) {
    if (this.state.disabledCategories.includes(category)) {
      this.enableCategoryImpl(category);
    } else {
      this.disableCategoryImpl(category);
    }
  }
  setDisabledCategoriesImpl(categories) {
    this.dispatch(setDisabledCategories(categories));
    const hiddenItems = computeHiddenItems(this.itemCategories, categories);
    this.dispatch(setHiddenItems(hiddenItems));
    this.categoryChanged$.emit({ disabledCategories: categories, hiddenItems });
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      setActiveToolbar: (placement, slot, toolbarId, documentId) => this.setToolbarForDocument(placement, slot, toolbarId, documentId),
      setActiveSidebar: (placement, slot, sidebarId, documentId, activeTab, props) => this.setSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props),
      toggleSidebar: (placement, slot, sidebarId, documentId, activeTab, props) => this.toggleSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props),
      openModal: (modalId, props, documentId) => this.openModalForDocument(modalId, props, documentId),
      openMenu: (menuId, triggeredByCommandId, triggeredByItemId, documentId) => this.openMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId),
      toggleMenu: (menuId, triggeredByCommandId, triggeredByItemId, documentId) => this.toggleMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId),
      // Overlay operations
      enableOverlay: (overlayId, documentId) => this.enableOverlayForDocument(overlayId, documentId),
      disableOverlay: (overlayId, documentId) => this.disableOverlayForDocument(overlayId, documentId),
      toggleOverlay: (overlayId, documentId) => this.toggleOverlayForDocument(overlayId, documentId),
      // Document-scoped operations
      forDocument: (documentId) => this.createUIScope(documentId),
      // Schema
      getSchema: () => this.schema,
      mergeSchema: (partial) => {
        this.schema = mergeUISchema(this.schema, partial);
      },
      // Category management
      disableCategory: (category) => this.disableCategoryImpl(category),
      enableCategory: (category) => this.enableCategoryImpl(category),
      toggleCategory: (category) => this.toggleCategoryImpl(category),
      setDisabledCategories: (categories) => this.setDisabledCategoriesImpl(categories),
      getDisabledCategories: () => this.state.disabledCategories,
      isCategoryDisabled: (category) => this.state.disabledCategories.includes(category),
      getHiddenItems: () => this.state.hiddenItems,
      // Events
      onToolbarChanged: this.toolbarChanged$.onGlobal,
      onSidebarChanged: this.sidebarChanged$.onGlobal,
      onModalChanged: this.modalChanged$.onGlobal,
      onMenuChanged: this.menuChanged$.onGlobal,
      onOverlayChanged: this.overlayChanged$.onGlobal,
      onCategoryChanged: this.categoryChanged$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createUIScope(documentId) {
    return {
      // ───── Toolbars ─────
      setActiveToolbar: (placement, slot, toolbarId) => this.setToolbarForDocument(placement, slot, toolbarId, documentId),
      getActiveToolbar: (placement, slot) => this.getToolbarForDocument(placement, slot, documentId),
      closeToolbarSlot: (placement, slot) => this.closeToolbarForDocument(placement, slot, documentId),
      isToolbarOpen: (placement, slot, toolbarId) => this.isToolbarOpenForDocument(placement, slot, toolbarId, documentId),
      // ───── Sidebars ─────
      setActiveSidebar: (placement, slot, sidebarId, activeTab, props) => this.setSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props),
      getActiveSidebar: (placement, slot) => this.getSidebarForDocument(placement, slot, documentId),
      closeSidebarSlot: (placement, slot) => this.closeSidebarForDocument(placement, slot, documentId),
      toggleSidebar: (placement, slot, sidebarId, activeTab, props) => this.toggleSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props),
      isSidebarOpen: (placement, slot, sidebarId) => this.isSidebarOpenForDocument(placement, slot, sidebarId, documentId),
      // ───── Sidebar tabs ─────
      setSidebarTab: (sidebarId, tabId) => this.setSidebarTabForDocument(sidebarId, tabId, documentId),
      getSidebarTab: (sidebarId) => this.getSidebarTabForDocument(sidebarId, documentId),
      // ───── Modals (with animation lifecycle) ─────
      openModal: (modalId, props) => this.openModalForDocument(modalId, props, documentId),
      closeModal: () => this.closeModalForDocument(documentId),
      clearModal: () => this.clearModalForDocument(documentId),
      getActiveModal: () => this.getActiveModalForDocument(documentId),
      isModalOpen: () => this.isModalOpenForDocument(documentId),
      // ───── Menus ─────
      openMenu: (menuId, triggeredByCommandId, triggeredByItemId) => this.openMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId),
      closeMenu: (menuId) => this.closeMenuForDocument(menuId, documentId),
      toggleMenu: (menuId, triggeredByCommandId, triggeredByItemId) => this.toggleMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId),
      closeAllMenus: () => this.closeAllMenusForDocument(documentId),
      isMenuOpen: (menuId) => this.isMenuOpenForDocument(menuId, documentId),
      getOpenMenus: () => this.getOpenMenusForDocument(documentId),
      // ───── Overlays ─────
      enableOverlay: (overlayId) => this.enableOverlayForDocument(overlayId, documentId),
      disableOverlay: (overlayId) => this.disableOverlayForDocument(overlayId, documentId),
      toggleOverlay: (overlayId) => this.toggleOverlayForDocument(overlayId, documentId),
      isOverlayEnabled: (overlayId) => this.isOverlayEnabledForDocument(overlayId, documentId),
      getEnabledOverlays: () => this.getEnabledOverlaysForDocument(documentId),
      // ───── Schema & state ─────
      getSchema: () => this.schema,
      getState: () => this.getDocumentStateOrThrow(documentId),
      // ───── Scoped events ─────
      onToolbarChanged: this.toolbarChanged$.forScope(documentId),
      onSidebarChanged: this.sidebarChanged$.forScope(documentId),
      onModalChanged: this.modalChanged$.forScope(documentId),
      onMenuChanged: this.menuChanged$.forScope(documentId),
      onOverlayChanged: this.overlayChanged$.forScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // State Helpers
  // ─────────────────────────────────────────────────────────
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? null;
  }
  getDocumentStateOrThrow(documentId) {
    const state = this.getDocumentState(documentId);
    if (!state) {
      throw new Error(`UI state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Toolbars
  // ─────────────────────────────────────────────────────────
  setToolbarForDocument(placement, slot, toolbarId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(setActiveToolbar(id, placement, slot, toolbarId));
    this.toolbarChanged$.emit(id, { placement, slot, toolbarId });
  }
  getToolbarForDocument(placement, slot, documentId) {
    const slotKey = `${placement}-${slot}`;
    const toolbarSlot = this.getDocumentStateOrThrow(documentId).activeToolbars[slotKey];
    return (toolbarSlot == null ? void 0 : toolbarSlot.isOpen) ? toolbarSlot.toolbarId : null;
  }
  closeToolbarForDocument(placement, slot, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(closeToolbarSlot(id, placement, slot));
    this.toolbarChanged$.emit(id, { placement, slot, toolbarId: "" });
  }
  isToolbarOpenForDocument(placement, slot, toolbarId, documentId) {
    const slotKey = `${placement}-${slot}`;
    const toolbarSlot = this.getDocumentStateOrThrow(documentId).activeToolbars[slotKey];
    if (!toolbarSlot || !toolbarSlot.isOpen) return false;
    return toolbarId ? toolbarSlot.toolbarId === toolbarId : true;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Sidebars
  // ─────────────────────────────────────────────────────────
  setSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(setActiveSidebar(id, placement, slot, sidebarId, activeTab, props));
    this.sidebarChanged$.emit(id, { placement, slot, sidebarId });
  }
  getSidebarForDocument(placement, slot, documentId) {
    const slotKey = `${placement}-${slot}`;
    const sidebarSlot = this.getDocumentStateOrThrow(documentId).activeSidebars[slotKey];
    return (sidebarSlot == null ? void 0 : sidebarSlot.isOpen) ? sidebarSlot.sidebarId : null;
  }
  closeSidebarForDocument(placement, slot, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(closeSidebarSlot(id, placement, slot));
    this.sidebarChanged$.emit(id, { placement, slot, sidebarId: "" });
  }
  toggleSidebarForDocument(placement, slot, sidebarId, documentId, activeTab, props) {
    const id = documentId ?? this.getActiveDocumentId();
    const slotKey = `${placement}-${slot}`;
    const sidebarSlot = this.getDocumentStateOrThrow(id).activeSidebars[slotKey];
    if ((sidebarSlot == null ? void 0 : sidebarSlot.sidebarId) === sidebarId && (sidebarSlot == null ? void 0 : sidebarSlot.isOpen)) {
      this.dispatch(closeSidebarSlot(id, placement, slot));
      this.sidebarChanged$.emit(id, { placement, slot, sidebarId: "" });
    } else {
      this.dispatch(setActiveSidebar(id, placement, slot, sidebarId, activeTab, props));
      this.sidebarChanged$.emit(id, { placement, slot, sidebarId });
    }
  }
  isSidebarOpenForDocument(placement, slot, sidebarId, documentId) {
    const slotKey = `${placement}-${slot}`;
    const sidebarSlot = this.getDocumentStateOrThrow(documentId).activeSidebars[slotKey];
    if (!sidebarSlot || !sidebarSlot.isOpen) return false;
    return sidebarId ? sidebarSlot.sidebarId === sidebarId : true;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Sidebar Tabs
  // ─────────────────────────────────────────────────────────
  setSidebarTabForDocument(sidebarId, tabId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(setSidebarTab(id, sidebarId, tabId));
  }
  getSidebarTabForDocument(sidebarId, documentId) {
    return this.getDocumentStateOrThrow(documentId).sidebarTabs[sidebarId] ?? null;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Modals (with animation lifecycle)
  // ─────────────────────────────────────────────────────────
  openModalForDocument(modalId, props, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(openModal(id, modalId, props));
    this.modalChanged$.emit(id, { modalId, isOpen: true });
  }
  closeModalForDocument(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const currentModal = this.getDocumentStateOrThrow(id).activeModal;
    this.dispatch(closeModal(id));
    this.modalChanged$.emit(id, { modalId: (currentModal == null ? void 0 : currentModal.modalId) ?? null, isOpen: false });
  }
  clearModalForDocument(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(clearModal(id));
  }
  getActiveModalForDocument(documentId) {
    return this.getDocumentStateOrThrow(documentId).activeModal;
  }
  isModalOpenForDocument(documentId) {
    const modal = this.getDocumentStateOrThrow(documentId).activeModal;
    return (modal == null ? void 0 : modal.isOpen) ?? false;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Menus
  // ─────────────────────────────────────────────────────────
  openMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(openMenu(id, { menuId, triggeredByCommandId, triggeredByItemId }));
    this.menuChanged$.emit(id, { menuId, isOpen: true });
  }
  closeMenuForDocument(menuId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(closeMenu(id, menuId));
    this.menuChanged$.emit(id, { menuId, isOpen: false });
  }
  toggleMenuForDocument(menuId, triggeredByCommandId, triggeredByItemId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const isOpen = !!this.getDocumentStateOrThrow(id).openMenus[menuId];
    if (isOpen) {
      this.dispatch(closeMenu(id, menuId));
      this.menuChanged$.emit(id, { menuId, isOpen: false });
    } else {
      this.dispatch(openMenu(id, { menuId, triggeredByCommandId, triggeredByItemId }));
      this.menuChanged$.emit(id, { menuId, isOpen: true });
    }
  }
  closeAllMenusForDocument(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(closeAllMenus(id));
  }
  isMenuOpenForDocument(menuId, documentId) {
    return !!this.getDocumentStateOrThrow(documentId).openMenus[menuId];
  }
  getOpenMenusForDocument(documentId) {
    return Object.values(this.getDocumentStateOrThrow(documentId).openMenus);
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations - Overlays
  // ─────────────────────────────────────────────────────────
  enableOverlayForDocument(overlayId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(setOverlayEnabled(id, overlayId, true));
    this.overlayChanged$.emit(id, { overlayId, isEnabled: true });
  }
  disableOverlayForDocument(overlayId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.dispatch(setOverlayEnabled(id, overlayId, false));
    this.overlayChanged$.emit(id, { overlayId, isEnabled: false });
  }
  toggleOverlayForDocument(overlayId, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const isEnabled = this.isOverlayEnabledForDocument(overlayId, id);
    if (isEnabled) {
      this.disableOverlayForDocument(overlayId, id);
    } else {
      this.enableOverlayForDocument(overlayId, id);
    }
  }
  isOverlayEnabledForDocument(overlayId, documentId) {
    const enabledOverlays = this.getDocumentStateOrThrow(documentId).enabledOverlays;
    return enabledOverlays[overlayId] ?? true;
  }
  getEnabledOverlaysForDocument(documentId) {
    const enabledOverlays = this.getDocumentStateOrThrow(documentId).enabledOverlays;
    return Object.entries(enabledOverlays).filter(([, enabled]) => enabled).map(([overlayId]) => overlayId);
  }
};
_UIPlugin.id = "ui";
let UIPlugin = _UIPlugin;
const initialDocumentState = {
  activeToolbars: {},
  activeSidebars: {},
  activeModal: null,
  openMenus: {},
  sidebarTabs: {},
  enabledOverlays: {}
};
const initialState = {
  documents: {},
  disabledCategories: [],
  hiddenItems: []
};
const uiReducer = (state = initialState, action) => {
  var _a;
  switch (action.type) {
    case INIT_UI_STATE: {
      const { documentId, schema } = action.payload;
      const activeToolbars = {};
      Object.values(schema.toolbars).forEach((toolbar) => {
        if (toolbar.permanent && toolbar.position) {
          const slotKey = `${toolbar.position.placement}-${toolbar.position.slot}`;
          activeToolbars[slotKey] = {
            toolbarId: toolbar.id,
            isOpen: true
            // Permanent toolbars are always open
          };
        }
      });
      const enabledOverlays = {};
      if (schema.overlays) {
        Object.values(schema.overlays).forEach((overlay) => {
          enabledOverlays[overlay.id] = overlay.defaultEnabled ?? true;
        });
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...initialDocumentState,
            activeToolbars,
            // Initialize with permanent toolbars
            enabledOverlays
            // Initialize with overlay enabled states
          }
        }
      };
    }
    case CLEANUP_UI_STATE: {
      const { documentId } = action.payload;
      const { [documentId]: removed, ...remaining } = state.documents;
      return {
        ...state,
        documents: remaining
      };
    }
    case SET_ACTIVE_TOOLBAR: {
      const { documentId, placement, slot, toolbarId } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      const slotKey = `${placement}-${slot}`;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeToolbars: {
              ...docState.activeToolbars,
              [slotKey]: {
                toolbarId,
                isOpen: true
              }
            }
          }
        }
      };
    }
    case CLOSE_TOOLBAR_SLOT: {
      const { documentId, placement, slot } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const slotKey = `${placement}-${slot}`;
      const toolbarSlot = docState.activeToolbars[slotKey];
      if (!toolbarSlot) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeToolbars: {
              ...docState.activeToolbars,
              [slotKey]: {
                ...toolbarSlot,
                isOpen: false
                // Keep toolbar, just close it
              }
            }
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Sidebar Actions
    // ─────────────────────────────────────────────────────────
    case SET_ACTIVE_SIDEBAR: {
      const { documentId, placement, slot, sidebarId, activeTab, props } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      const slotKey = `${placement}-${slot}`;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeSidebars: {
              ...docState.activeSidebars,
              [slotKey]: {
                sidebarId,
                isOpen: true,
                props
              }
            },
            ...activeTab && {
              sidebarTabs: {
                ...docState.sidebarTabs,
                [sidebarId]: activeTab
              }
            }
          }
        }
      };
    }
    case CLOSE_SIDEBAR_SLOT: {
      const { documentId, placement, slot } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const slotKey = `${placement}-${slot}`;
      const sidebarSlot = docState.activeSidebars[slotKey];
      if (!sidebarSlot) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeSidebars: {
              ...docState.activeSidebars,
              [slotKey]: {
                ...sidebarSlot,
                isOpen: false
                // Keep sidebar, just close it
              }
            }
          }
        }
      };
    }
    case SET_SIDEBAR_TAB: {
      const { documentId, sidebarId, tabId } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            sidebarTabs: {
              ...docState.sidebarTabs,
              [sidebarId]: tabId
            }
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Modal Actions (with animation lifecycle)
    // ─────────────────────────────────────────────────────────
    case OPEN_MODAL: {
      const { documentId, modalId, props } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeModal: {
              modalId,
              isOpen: true,
              props
            },
            openMenus: {}
            // Close all menus when opening modal
          }
        }
      };
    }
    case CLOSE_MODAL: {
      const { documentId } = action.payload;
      const docState = state.documents[documentId];
      if (!(docState == null ? void 0 : docState.activeModal)) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeModal: {
              ...docState.activeModal,
              isOpen: false
              // Keep modal for exit animation
            }
          }
        }
      };
    }
    case CLEAR_MODAL: {
      const { documentId } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      if ((_a = docState.activeModal) == null ? void 0 : _a.isOpen) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            activeModal: null
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Menu Actions
    // ─────────────────────────────────────────────────────────
    case OPEN_MENU: {
      const { documentId, menuState } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            openMenus: {
              // Close other menus, open this one
              [menuState.menuId]: menuState
            }
          }
        }
      };
    }
    case CLOSE_MENU: {
      const { documentId, menuId } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const { [menuId]: removed, ...remainingMenus } = docState.openMenus;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            openMenus: remainingMenus
          }
        }
      };
    }
    case CLOSE_ALL_MENUS: {
      const { documentId } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            openMenus: {}
          }
        }
      };
    }
    // ─────────────────────────────────────────────────────────
    // Overlay Actions
    // ─────────────────────────────────────────────────────────
    case SET_OVERLAY_ENABLED: {
      const { documentId, overlayId, enabled } = action.payload;
      const docState = state.documents[documentId] || initialDocumentState;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            enabledOverlays: {
              ...docState.enabledOverlays,
              [overlayId]: enabled
            }
          }
        }
      };
    }
    case SET_DISABLED_CATEGORIES: {
      return {
        ...state,
        disabledCategories: action.payload.categories
      };
    }
    case SET_HIDDEN_ITEMS: {
      return {
        ...state,
        hiddenItems: action.payload.hiddenItems
      };
    }
    default:
      return state;
  }
};
function selectUIState(plugins) {
  return plugins["ui"] ?? null;
}
function selectUIDocumentState(plugins, documentId) {
  const ui = selectUIState(plugins);
  return (ui == null ? void 0 : ui.documents[documentId]) ?? null;
}
function makeSlotKey(placement, slot) {
  return `${placement}-${slot}`;
}
function selectToolbarSlot(plugins, documentId, placement, slot) {
  const doc = selectUIDocumentState(plugins, documentId);
  if (!doc) return null;
  return doc.activeToolbars[makeSlotKey(placement, slot)] ?? null;
}
function isToolbarOpen(plugins, documentId, placement, slot, toolbarId) {
  const slotState = selectToolbarSlot(plugins, documentId, placement, slot);
  if (!slotState || !slotState.isOpen) return false;
  return toolbarId ? slotState.toolbarId === toolbarId : true;
}
function selectSidebarSlot(plugins, documentId, placement, slot) {
  const doc = selectUIDocumentState(plugins, documentId);
  if (!doc) return null;
  return doc.activeSidebars[makeSlotKey(placement, slot)] ?? null;
}
function isSidebarOpen(plugins, documentId, placement, slot, sidebarId) {
  const slotState = selectSidebarSlot(plugins, documentId, placement, slot);
  if (!slotState || !slotState.isOpen) return false;
  return sidebarId ? slotState.sidebarId === sidebarId : true;
}
const UIPluginPackage = {
  manifest,
  create: (registry, config) => new UIPlugin(UI_PLUGIN_ID, registry, config),
  reducer: uiReducer,
  initialState
};
export {
  CLEANUP_UI_STATE,
  CLEAR_MODAL,
  CLOSE_ALL_MENUS,
  CLOSE_MENU,
  CLOSE_MODAL,
  CLOSE_SIDEBAR_SLOT,
  CLOSE_TOOLBAR_SLOT,
  INIT_UI_STATE,
  OPEN_MENU,
  OPEN_MODAL,
  SET_ACTIVE_SIDEBAR,
  SET_ACTIVE_TOOLBAR,
  SET_DISABLED_CATEGORIES,
  SET_HIDDEN_ITEMS,
  SET_OVERLAY_ENABLED,
  SET_SIDEBAR_TAB,
  UIPlugin,
  UIPluginPackage,
  UI_ATTRIBUTES,
  UI_PLUGIN_ID,
  UI_SELECTORS,
  cleanupUIState,
  clearModal,
  closeAllMenus,
  closeMenu,
  closeModal,
  closeSidebarSlot,
  closeToolbarSlot,
  computeHiddenItems,
  extractCategories,
  extractItemCategories,
  generateUIStylesheet,
  getItemResponsiveMetadata,
  getStylesheetConfig,
  getUIItemProps,
  initUIState,
  isSidebarOpen,
  isToolbarOpen,
  manifest,
  mergeUISchema,
  openMenu,
  openModal,
  removeFromSchema,
  resolveResponsiveMetadata,
  selectSidebarSlot,
  selectToolbarSlot,
  selectUIDocumentState,
  selectUIState,
  setActiveSidebar,
  setActiveToolbar,
  setDisabledCategories,
  setHiddenItems,
  setOverlayEnabled,
  setSidebarTab
};
//# sourceMappingURL=index.js.map
