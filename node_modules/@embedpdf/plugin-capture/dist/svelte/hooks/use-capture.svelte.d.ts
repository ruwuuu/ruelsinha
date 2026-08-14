import { CapturePlugin, CaptureDocumentState, CaptureScope } from '../../lib/index.ts';
export declare const useCaptureCapability: () => {
    provides: Readonly<import('../../lib/index.ts').CaptureCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useCapturePlugin: () => {
    plugin: CapturePlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseCaptureReturn {
    provides: CaptureScope | null;
    state: CaptureDocumentState;
}
/**
 * Hook for capture state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useCapture: (getDocumentId: () => string | null) => UseCaptureReturn;
export {};
