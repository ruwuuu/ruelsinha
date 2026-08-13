import { BoxedAnnotationRenderer, AnnotationRendererEntry, AnnotationRendererProps, AnnotationInteractionEvent, SelectOverrideHelpers } from './types';
import { PdfAnnotationObject } from '@embedpdf/models';
/**
 * Annotation Renderer Registry
 *
 * Allows external plugins to register custom annotation renderers
 * that integrate with the annotation layer.
 */
export interface AnnotationRendererRegistry {
    register(entries: BoxedAnnotationRenderer[]): () => void;
    getAll(): BoxedAnnotationRenderer[];
}
export declare function createRendererRegistry(): AnnotationRendererRegistry;
export declare function provideRendererRegistry(): AnnotationRendererRegistry;
export declare function getRendererRegistry(): AnnotationRendererRegistry | null;
/**
 * Factory to create a boxed renderer from a typed entry.
 */
export declare function createRenderer<T extends PdfAnnotationObject, P = never>(entry: AnnotationRendererEntry<T, P>): BoxedAnnotationRenderer;
export type { AnnotationRendererProps, AnnotationRendererEntry, BoxedAnnotationRenderer, AnnotationInteractionEvent, SelectOverrideHelpers, };
