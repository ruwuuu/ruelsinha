import { PluginPackage } from '@embedpdf/core';
import { PrintPluginConfig } from './types';
import { PrintPlugin } from './print-plugin';
export declare const PrintPluginPackage: PluginPackage<PrintPlugin, PrintPluginConfig>;
export * from './print-plugin';
export * from './types';
export * from './manifest';
