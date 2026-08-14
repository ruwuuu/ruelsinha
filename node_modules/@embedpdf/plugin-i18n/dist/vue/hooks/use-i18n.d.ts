import { MaybeRefOrGetter } from 'vue';
import { I18nPlugin } from '../../lib/index.ts';
export declare const useI18nCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').I18nCapability>>;
export declare const useI18nPlugin: () => import('@embedpdf/core/vue').PluginState<I18nPlugin>;
/**
 * Hook to get a translate function for a component
 * Automatically updates all translations on locale or param changes
 *
 * @param documentId - Optional document ID for document-scoped translations (can be ref, computed, getter, or plain value)
 * @returns translate function and current locale
 *
 * @example
 * const { translate, locale } = useTranslations(documentId);
 * // In template:
 * {{ translate('page.title') }}
 * {{ translate('page.count', { params: { count: 5 } }) }}
 * {{ translate('unknown.key', { fallback: 'Default Text' }) }}
 */
export declare const useTranslations: (documentId?: MaybeRefOrGetter<string | undefined>) => {
    translate: (key: string, options?: {
        params?: Record<string, string | number>;
        fallback?: string;
    }) => string;
    locale: Readonly<import('vue').Ref<string, string>>;
};
export declare const useTranslation: (key: string, options?: {
    params?: Record<string, string | number>;
    fallback?: string;
}, documentId?: MaybeRefOrGetter<string | undefined>) => import('vue').ComputedRef<string>;
export declare const useLocale: () => import('vue').Ref<string, string>;
