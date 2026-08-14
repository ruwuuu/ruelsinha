import { PluginPackage } from '@embedpdf/core';
import { InteractionManagerPlugin } from './interaction-manager-plugin';
import { InteractionManagerPluginConfig, InteractionManagerState } from './types';
import { InteractionManagerAction } from './actions';
export declare const InteractionManagerPluginPackage: PluginPackage<InteractionManagerPlugin, InteractionManagerPluginConfig, InteractionManagerState, InteractionManagerAction>;
export * from './interaction-manager-plugin';
export * from './types';
export * from './manifest';
export * from './reducer';
