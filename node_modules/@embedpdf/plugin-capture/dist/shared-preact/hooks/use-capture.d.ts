import { CapturePlugin, CaptureDocumentState } from '../../lib/index.ts';
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
/**
 * Hook for capture state for a specific document
 * @param documentId Document ID
 */
export declare const useCapture: (documentId: string) => {
    state: CaptureDocumentState;
    provides: import('../../lib/index.ts').CaptureScope | null;
};
