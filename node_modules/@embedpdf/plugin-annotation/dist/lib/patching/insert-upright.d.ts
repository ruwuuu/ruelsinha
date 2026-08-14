import { PdfAnnotationObject, Rotation, Size } from '@embedpdf/models';
/**
 * Applies a counter-rotation to make an annotation appear visually upright
 * on a rotated page. Uses `basePropertyRotationChanges` to correctly compute
 * rect, unrotatedRect, and rotation for the annotation.
 *
 * @param annotation - The annotation to transform
 * @param pageRotation - Effective page rotation as quarter-turn value (0-3)
 * @param rectWasDrawn - `true` if the rect was produced by a marquee drag
 *   (PagePointerProvider transposes dimensions on 90/270 pages),
 *   `false` if the rect was placed from config/content (click-to-place, stamp)
 * @returns The annotation with rotation, unrotatedRect, and rect set
 */
export declare function applyInsertUpright<T extends PdfAnnotationObject>(annotation: T, pageRotation: Rotation, rectWasDrawn: boolean): T;
/**
 * Clamps an annotation's rect to stay within page bounds.
 * If the annotation has an unrotatedRect, it is shifted by the same delta
 * to keep the geometry consistent.
 */
export declare function clampAnnotationToPage<T extends PdfAnnotationObject>(annotation: T, pageSize: Size): T;
