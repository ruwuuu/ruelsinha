import { BasePlugin, Listener, PluginRegistry, Unsubscribe } from '@embedpdf/core';
import { UICapability, UIPluginConfig, UIState } from './types';
import { UIAction } from './actions';
export declare class UIPlugin extends BasePlugin<UIPluginConfig, UICapability, UIState, UIAction> {
    static readonly id: "ui";
    private schema;
    private stylesheetConfig;
    private itemCategories;
    private cachedStylesheet;
    private cachedLocale;
    private i18n;
    private i18nCleanup;
    private readonly categoryChanged$;
    private readonly stylesheetInvalidated$;
    private readonly toolbarChanged$;
    private readonly sidebarChanged$;
    private readonly modalChanged$;
    private readonly menuChanged$;
    private readonly overlayChanged$;
    constructor(id: string, registry: PluginRegistry, config: UIPluginConfig);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    /**
     * Handle locale changes from i18n plugin.
     * Invalidates stylesheet and emits change event.
     */
    private handleLocaleChange;
    /**
     * Get the generated CSS stylesheet.
     * Automatically regenerates if locale has changed.
     * This is pure logic - DOM injection is handled by framework layer.
     */
    getStylesheet(): string;
    /**
     * Get the current locale (if i18n is available)
     */
    getLocale(): string | null;
    /**
     * Regenerate stylesheet (call after schema changes)
     */
    invalidateStylesheet(): void;
    onStylesheetInvalidated(listener: Listener<void>): Unsubscribe;
    private disableCategoryImpl;
    private enableCategoryImpl;
    private toggleCategoryImpl;
    private setDisabledCategoriesImpl;
    protected buildCapability(): UICapability;
    private createUIScope;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private setToolbarForDocument;
    private getToolbarForDocument;
    private closeToolbarForDocument;
    private isToolbarOpenForDocument;
    private setSidebarForDocument;
    private getSidebarForDocument;
    private closeSidebarForDocument;
    private toggleSidebarForDocument;
    private isSidebarOpenForDocument;
    private setSidebarTabForDocument;
    private getSidebarTabForDocument;
    private openModalForDocument;
    private closeModalForDocument;
    private clearModalForDocument;
    private getActiveModalForDocument;
    private isModalOpenForDocument;
    private openMenuForDocument;
    private closeMenuForDocument;
    private toggleMenuForDocument;
    private closeAllMenusForDocument;
    private isMenuOpenForDocument;
    private getOpenMenusForDocument;
    private enableOverlayForDocument;
    private disableOverlayForDocument;
    private toggleOverlayForDocument;
    private isOverlayEnabledForDocument;
    private getEnabledOverlaysForDocument;
}
