import { PrintPlugin } from '../../index.ts';
export declare const usePrintPlugin: () => {
    plugin: PrintPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const usePrintCapability: () => {
    provides: Readonly<import('../../index.ts').PrintCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for print capability for a specific document
 * @param documentId Document ID
 */
export declare const usePrint: (documentId: string) => {
    provides: import('../../index.ts').PrintScope | null;
};
