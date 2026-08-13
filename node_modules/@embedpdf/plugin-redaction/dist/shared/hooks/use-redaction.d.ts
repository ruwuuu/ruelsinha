import { RedactionPlugin, RedactionDocumentState, RedactionScope } from '../../index.ts';
export declare const useRedactionPlugin: () => {
    plugin: RedactionPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRedactionCapability: () => {
    provides: Readonly<import('../../index.ts').RedactionCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRedaction: (documentId: string) => {
    state: RedactionDocumentState;
    provides: RedactionScope | null;
};
