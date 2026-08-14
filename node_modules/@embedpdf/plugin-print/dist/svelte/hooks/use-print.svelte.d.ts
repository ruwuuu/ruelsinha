import { PrintPlugin, PrintScope } from '../../lib/index.ts';
/**
 * Hook to get the raw print plugin instance.
 * Useful for accessing plugin-specific properties or methods not exposed in the capability.
 */
export declare const usePrintPlugin: () => {
    plugin: PrintPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the print plugin's capability API.
 * This provides methods for initiating print operations.
 */
export declare const usePrintCapability: () => {
    provides: Readonly<import('../../lib/index.ts').PrintCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UsePrintReturn {
    provides: PrintScope | null;
}
/**
 * Hook for print capability for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const usePrint: (getDocumentId: () => string | null) => UsePrintReturn;
export {};
