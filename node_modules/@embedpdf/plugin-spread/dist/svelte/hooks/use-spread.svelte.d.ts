import { SpreadMode, SpreadPlugin, SpreadScope } from '../../lib/index.ts';
/**
 * Hook to get the raw spread plugin instance.
 * Useful for accessing plugin-specific properties or methods not exposed in the capability.
 */
export declare const useSpreadPlugin: () => {
    plugin: SpreadPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the spread plugin's capability API.
 * This provides methods for controlling spread mode.
 */
export declare const useSpreadCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SpreadCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseSpreadReturn {
    provides: SpreadScope | null;
    spreadMode: SpreadMode;
}
/**
 * Hook for spread state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useSpread: (getDocumentId: () => string | null) => UseSpreadReturn;
export {};
