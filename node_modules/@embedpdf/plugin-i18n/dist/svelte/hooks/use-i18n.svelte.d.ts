import { I18nPlugin } from '../../lib/index.ts';
export declare const useI18nCapability: () => {
    provides: Readonly<import('../../lib/index.ts').I18nCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useI18nPlugin: () => {
    plugin: I18nPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get a translate function for a component
 * Automatically updates all translations on locale or param changes
 *
 * @param getDocumentId - Function that returns the document ID for document-scoped translations
 * @returns translate function and current locale
 *
 * @example
 * const { translate, locale } = useTranslations(() => documentId);
 * // In template:
 * {translate('page.title')}
 * {translate('page.count', { params: { count: 5 } })}
 * {translate('unknown.key', { fallback: 'Default Text' })}
 */
export declare const useTranslations: (getDocumentId?: () => string | undefined) => {
    translate: (key: string, options?: {
        params?: Record<string, string | number>;
        fallback?: string;
    }) => string;
    readonly locale: string;
};
export declare const useTranslation: (getKey: () => string, getOptions?: () => {
    params?: Record<string, string | number>;
    fallback?: string;
} | undefined, getDocumentId?: () => string | undefined) => {
    readonly current: string;
};
export declare const useLocale: () => {
    readonly current: string;
};
