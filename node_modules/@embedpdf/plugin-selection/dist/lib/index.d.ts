import { PluginPackage } from '@embedpdf/core';
import { SelectionPluginConfig, SelectionState } from './types';
import { SelectionPlugin } from './selection-plugin';
import { SelectionAction } from './actions';
export declare const SelectionPluginPackage: PluginPackage<SelectionPlugin, SelectionPluginConfig, SelectionState, SelectionAction>;
export * from './selection-plugin';
export * from './types';
export * from './manifest';
export * from './utils';
