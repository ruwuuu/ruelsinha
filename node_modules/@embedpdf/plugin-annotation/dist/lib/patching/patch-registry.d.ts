import { PdfAnnotationObject, PdfAnnotationSubtype } from '@embedpdf/models';
export interface TransformContext<T extends PdfAnnotationObject = PdfAnnotationObject> {
    /** The type of transformation being applied */
    type: 'move' | 'resize' | 'vertex-edit' | 'rotate' | 'property-update';
    /** The changes being applied - can be any properties of the annotation */
    changes: Partial<T>;
    /** Optional metadata about the transformation */
    metadata?: {
        maintainAspectRatio?: boolean;
        /** Rotation angle in degrees (for 'rotate' transform type) */
        rotationAngle?: number;
        /** Delta from the initial rotation angle in degrees */
        rotationDelta?: number;
        /** Center point for rotation (defaults to rect center) */
        rotationCenter?: {
            x: number;
            y: number;
        };
        /** Whether the rotation input is currently snapped */
        isSnapped?: boolean;
        /** Snap target angle when isSnapped is true */
        snappedAngle?: number;
        [key: string]: any;
    };
}
export type PatchFunction<T extends PdfAnnotationObject> = (original: T, context: TransformContext<T>) => Partial<T>;
/**
 * Registry for annotation-specific patch functions.
 * Each patch function knows how to transform its annotation type.
 */
export declare class PatchRegistry {
    private patches;
    register<T extends PdfAnnotationObject>(type: PdfAnnotationSubtype, patchFn: PatchFunction<T>): void;
    /**
     * Transform an annotation based on the context.
     * Returns the transformed properties or just the changes if no patch function exists.
     */
    transform<T extends PdfAnnotationObject>(annotation: T, context: TransformContext<T>): Partial<T>;
}
export declare const patchRegistry: PatchRegistry;
