import { PluginPackage } from '@embedpdf/core';
import { HistoryPluginConfig, HistoryState } from './types';
import { HistoryPlugin } from './history-plugin';
import { HistoryAction } from './actions';
export declare const HistoryPluginPackage: PluginPackage<HistoryPlugin, HistoryPluginConfig, HistoryState, HistoryAction>;
export * from './history-plugin';
export * from './types';
export * from './manifest';
