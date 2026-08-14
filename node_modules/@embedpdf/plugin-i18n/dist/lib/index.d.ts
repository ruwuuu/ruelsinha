import { PluginPackage } from '@embedpdf/core';
import { I18nPluginConfig, I18nState } from './types';
import { I18nPlugin } from './i18n-plugin';
import { I18nAction } from './actions';
export declare const I18nPluginPackage: PluginPackage<I18nPlugin, I18nPluginConfig, I18nState, I18nAction>;
export * from './i18n-plugin';
export * from './types';
export * from './manifest';
export * from './locales';
