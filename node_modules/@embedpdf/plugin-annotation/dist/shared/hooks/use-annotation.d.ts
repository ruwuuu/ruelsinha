import { AnnotationPlugin, AnnotationDocumentState } from '../../index.ts';
export declare const useAnnotationPlugin: () => {
    plugin: AnnotationPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useAnnotationCapability: () => {
    provides: Readonly<import('../../index.ts').AnnotationCapability<import('../../index.ts').AnnotationToolMap>> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for annotation state for a specific document
 * @param documentId Document ID
 */
export declare const useAnnotation: (documentId: string) => {
    state: AnnotationDocumentState;
    provides: import('../../index.ts').AnnotationScope<import('../../index.ts').AnnotationToolMap> | null;
};
