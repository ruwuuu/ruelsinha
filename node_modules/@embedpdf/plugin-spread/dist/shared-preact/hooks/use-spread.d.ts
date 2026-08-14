import { SpreadMode, SpreadPlugin } from '../../lib/index.ts';
export declare const useSpreadPlugin: () => {
    plugin: SpreadPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSpreadCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SpreadCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for spread state for a specific document
 * @param documentId Document ID
 */
export declare const useSpread: (documentId: string) => {
    spreadMode: SpreadMode;
    provides: import('../../lib/index.ts').SpreadScope | null;
};
