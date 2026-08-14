import { PanPlugin } from '../../index.ts';
export declare const usePanPlugin: () => {
    plugin: PanPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const usePanCapability: () => {
    provides: Readonly<import('../../index.ts').PanCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for pan state for a specific document
 * @param documentId Document ID
 */
export declare const usePan: (documentId: string) => {
    provides: import('../../index.ts').PanScope | null;
    isPanning: boolean;
};
