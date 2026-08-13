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
export declare const useSearch: (documentId: string) => {
    state: SearchDocumentState;
    provides: SearchScope | null;
};
