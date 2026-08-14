import { SpreadMode, SpreadPlugin } from '../../index.ts';
export declare const useSpreadPlugin: () => {
    plugin: SpreadPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSpreadCapability: () => {
    provides: Readonly<import('../../index.ts').SpreadCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for spread state for a specific document
 * @param documentId Document ID
 */
export declare const useSpread: (documentId: string) => {
    spreadMode: SpreadMode;
    provides: import('../../index.ts').SpreadScope | null;
};
