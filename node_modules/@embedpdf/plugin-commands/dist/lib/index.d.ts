import { PluginPackage } from '@embedpdf/core';
import { CommandsPluginConfig, CommandsState } from './types';
import { CommandsPlugin } from './commands-plugin';
import { CommandsAction } from './actions';
export declare const CommandsPluginPackage: PluginPackage<CommandsPlugin, CommandsPluginConfig, CommandsState, CommandsAction>;
export * from './commands-plugin';
export * from './types';
export * from './manifest';
