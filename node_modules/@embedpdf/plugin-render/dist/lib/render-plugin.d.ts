import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { RenderCapability, RenderPluginConfig } from './types';
/**
 * Render Plugin - Simplified version that relies on core state for refresh tracking
 *
 * Key insight: Page refresh tracking is in DocumentState.pageRefreshVersions
 * This allows ANY plugin to observe page refreshes, not just the render plugin.
 */
export declare class RenderPlugin extends BasePlugin<RenderPluginConfig, RenderCapability> {
    static readonly id: "render";
    private config;
    constructor(id: string, registry: PluginRegistry, config: RenderPluginConfig);
    protected buildCapability(): RenderCapability;
    private createRenderScope;
    private renderPage;
    private renderPageRect;
    private renderPageRaw;
    private renderPageRectRaw;
    initialize(_config: RenderPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
