import { SignaturePlugin, SignatureEntry, ActivePlacementInfo } from '../../lib/index.ts';
export declare const useSignaturePlugin: () => {
    plugin: SignaturePlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSignatureCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SignatureCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSignatureEntries: () => {
    entries: SignatureEntry[];
    provides: Readonly<import('../../lib/index.ts').SignatureCapability> | null;
};
export declare const useActivePlacement: (documentId: string) => ActivePlacementInfo | null;
