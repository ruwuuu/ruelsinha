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
export declare function useRendererRegistry(): AnnotationRendererRegistry | null;
/**
 * Composable for plugins to register renderers.
 * Automatically cleans up on unmount.
 */
export declare function useRegisterRenderers(entries: BoxedAnnotationRenderer[]): void;
/**
 * Factory to create a boxed renderer from a typed entry.
 * Wraps component in markRaw to prevent reactivity overhead.
 */
export declare function createRenderer<T extends PdfAnnotationObject, P = never>(entry: AnnotationRendererEntry<T, P>): BoxedAnnotationRenderer;
export type { AnnotationRendererProps, AnnotationRendererEntry, BoxedAnnotationRenderer, AnnotationInteractionEvent, SelectOverrideHelpers, };
