import { ReactNode } from '../../preact/adapter.ts';
interface TranslateProps {
    k: string;
    params?: Record<string, string | number>;
    fallback?: string;
    documentId?: string;
    children?: (translation: string) => ReactNode;
}
/**
 * Component for inline translation
 *
 * @example
 * // Global translation
 * <Translate k="loading.viewer" />
 *
 * @example
 * // With explicit params
 * <Translate k="zoom.level" params={{ level: 150 }} />
 *
 * @example
 * // With fallback
 * <Translate k="unknown.key" fallback="Default Text" />
 *
 * @example
 * // Document-scoped (uses param resolvers)
 * <Translate k="page.current" documentId={documentId} />
 *
 * @example
 * // With render prop
 * <Translate k="zoom.level" params={{ level: 150 }}>
 *   {(text) => <span className="font-bold">{text}</span>}
 * </Translate>
 */
export declare function Translate({ k, params, fallback, documentId, children }: TranslateProps): ReactNode;
export {};
