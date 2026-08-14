import { PluginPackage } from '@embedpdf/core';
import { TilingAction } from './actions';
import { TilingPlugin } from './tiling-plugin';
import { TilingPluginConfig, TilingState } from './types';
export declare const TilingPluginPackage: PluginPackage<TilingPlugin, TilingPluginConfig, TilingState, TilingAction>;
export * from './tiling-plugin';
export * from './types';
export * from './manifest';
