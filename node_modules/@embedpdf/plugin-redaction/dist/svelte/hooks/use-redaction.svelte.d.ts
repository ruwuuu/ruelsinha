import { RedactionPlugin, RedactionDocumentState, RedactionScope } from '../../lib/index.ts';
export declare const useRedactionPlugin: () => {
    plugin: RedactionPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRedactionCapability: () => {
    provides: Readonly<import('../../lib/index.ts').RedactionCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseRedactionReturn {
    provides: RedactionScope | null;
    state: RedactionDocumentState;
}
/**
 * Hook for redaction state for a specific document
 * @param getDocumentId Document ID getter function
 */
export declare const useRedaction: (getDocumentId: () => string | null) => UseRedactionReturn;
export {};
