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
export declare function useSignatureEntries(): {
    readonly entries: SignatureEntry[];
};
export declare function useActivePlacement(getDocumentId: () => string): {
    readonly activePlacement: ActivePlacementInfo | null;
};
