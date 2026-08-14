import { PanPlugin, PanScope } from '../../lib/index.ts';
export declare const usePanPlugin: () => {
    plugin: PanPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const usePanCapability: () => {
    provides: Readonly<import('../../lib/index.ts').PanCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UsePanReturn {
    provides: PanScope | null;
    isPanning: boolean;
}
/**
 * Hook for pan state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const usePan: (getDocumentId: () => string | null) => UsePanReturn;
export {};
