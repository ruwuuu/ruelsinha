import { AnnotationPlugin, AnnotationDocumentState } from '../../lib/index.ts';
export declare const useAnnotationPlugin: () => {
    plugin: AnnotationPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useAnnotationCapability: () => {
    provides: Readonly<import('../../lib/index.ts').AnnotationCapability<import('../../lib/index.ts').AnnotationToolMap>> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for annotation state for a specific document
 * @param documentId Document ID
 */
export declare const useAnnotation: (documentId: string) => {
    state: AnnotationDocumentState;
    provides: import('../../lib/index.ts').AnnotationScope<import('../../lib/index.ts').AnnotationToolMap> | null;
};
