import { SearchPlugin, SearchDocumentState, SearchScope } from '../../lib/index.ts';
export declare const useSearchPlugin: () => {
    plugin: SearchPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSearchCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SearchCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseSearchReturn {
    provides: SearchScope | null;
    state: SearchDocumentState;
}
/**
 * Hook for search state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useSearch: (getDocumentId: () => string | null) => UseSearchReturn;
export {};
