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
export declare const useRedaction: (documentId: string) => {
    state: RedactionDocumentState;
    provides: RedactionScope | null;
};
