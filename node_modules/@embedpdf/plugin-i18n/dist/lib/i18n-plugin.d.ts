import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { I18nCapability, I18nPluginConfig, I18nState } from './types';
import { I18nAction } from './actions';
export declare class I18nPlugin extends BasePlugin<I18nPluginConfig, I18nCapability, I18nState, I18nAction> {
    static readonly id: "i18n";
    private config;
    private locales;
    private paramResolvers;
    private paramsCache;
    private readonly localeChange$;
    private readonly paramsChanged$;
    constructor(id: string, registry: PluginRegistry, config: I18nPluginConfig);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    protected onDocumentClosed(documentId: string): void;
    protected buildCapability(): I18nCapability;
    private createI18nScope;
    private translate;
    private resolveParams;
    private getNestedValue;
    private interpolate;
    private detectParamChanges;
    private detectDocumentParamChanges;
    private registerParamResolver;
    private unregisterParamResolver;
    private setLocale;
    private registerLocale;
}
