import { Rotation } from '@embedpdf/models';
import { TrackedAnnotation } from '../index.ts';
export interface ScreenBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/**
 * Compute the screen-space bounding box of an annotation, correctly accounting
 * for `noZoom` (constant pixel size regardless of zoom) and `noRotate`
 * (visually upright regardless of page rotation) annotation flags.
 */
export declare function getAnnotationScreenBounds(annotation: TrackedAnnotation, scale: number, rotation: Rotation): ScreenBounds;
