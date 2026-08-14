import { AnnotationPlugin, AnnotationDocumentState, AnnotationScope } from '../../lib/index.ts';
export declare const useAnnotationCapability: () => {
    provides: Readonly<import('../../lib/index.ts').AnnotationCapability<import('../../lib/index.ts').AnnotationToolMap>> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useAnnotationPlugin: () => {
    plugin: AnnotationPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseAnnotationReturn {
    provides: AnnotationScope | null;
    state: AnnotationDocumentState;
}
/**
 * Hook for annotation state for a specific document
 * @param getDocumentId Document ID getter function
 */
export declare const useAnnotation: (getDocumentId: () => string | null) => UseAnnotationReturn;
export {};
