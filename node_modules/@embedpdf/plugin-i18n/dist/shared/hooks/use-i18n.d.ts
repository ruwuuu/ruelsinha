import { I18nPlugin } from '../../index.ts';
export declare const useI18nCapability: () => {
    provides: Readonly<import('../../index.ts').I18nCapability> | null;
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
 * @param documentId - Optional document ID for document-scoped translations
 * @returns translate function and current locale
 *
 * @example
 * const { translate } = useTranslations(documentId);
 * return (
 *   <div>
 *     <h1>{translate('page.title')}</h1>
 *     <p>{translate('page.count', { params: { count: 5 } })}</p>
 *     <p>{translate('unknown.key', { fallback: 'Default Text' })}</p>
 *   </div>
 * );
 */
export declare const useTranslations: (documentId?: string) => {
    translate: (key: string, options?: {
        params?: Record<string, string | number>;
        fallback?: string;
    }) => string;
    locale: string;
};
export declare const useTranslation: (key: string, options?: {
    params?: Record<string, string | number>;
    fallback?: string;
}, documentId?: string) => string;
/**
 * Hook to get current locale
 */
export declare const useLocale: () => string;
