import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { FullscreenCapability, FullscreenPluginConfig, FullscreenState } from './types';
import { FullscreenAction } from './actions';
export declare class FullscreenPlugin extends BasePlugin<FullscreenPluginConfig, FullscreenCapability, FullscreenState, FullscreenAction> {
    static readonly id: "fullscreen";
    private readonly onStateChange$;
    private readonly fullscreenRequest$;
    private config;
    private currentTargetElement?;
    constructor(id: string, registry: PluginRegistry, config: FullscreenPluginConfig);
    initialize(_: FullscreenPluginConfig): Promise<void>;
    protected buildCapability(): FullscreenCapability;
    getTargetSelector(): string | undefined;
    private toggleFullscreen;
    private enableFullscreen;
    private exitFullscreen;
    onStoreUpdated(_: FullscreenState, newState: FullscreenState): void;
    setFullscreenState(isFullscreen: boolean): void;
    destroy(): Promise<void>;
}
