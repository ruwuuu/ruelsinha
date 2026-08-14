import { Rect } from '@embedpdf/models';
import { TransformContext } from './patch-registry';
/**
 * Minimal shape required by the shared patch helpers.
 * All annotation objects satisfy this through PdfAnnotationObject.
 */
export interface RotatableAnnotation {
    rect: Rect;
    unrotatedRect?: Rect;
    rotation?: number;
}
/**
 * Shared rotate logic.
 * Returns the full patch (rect, unrotatedRect, rotation) or `null` when the
 * context doesn't carry a rotationAngle (in which case the caller should
 * fall through to `ctx.changes`).
 */
export declare function baseRotateChanges(orig: RotatableAnnotation, ctx: TransformContext<any>): Partial<{
    rect: Rect;
    unrotatedRect: Rect;
    rotation: number;
}> | null;
/**
 * Shared property-update rotation logic.
 * Recomputes rect and unrotatedRect for a new rotation angle, preserving
 * the annotation's rotation center. Works for all annotation types since
 * it only touches rect/unrotatedRect/rotation.
 */
export declare function basePropertyRotationChanges(orig: RotatableAnnotation, newRotation: number): {
    rotation: number;
    rect: Rect;
    unrotatedRect: Rect;
};
/**
 * Shared move logic: computes dx/dy and translates rect + unrotatedRect.
 * Callers use the returned `dx`/`dy` to translate their own type-specific
 * data (vertices, linePoints, inkList, etc.).
 */
export declare function baseMoveChanges(orig: RotatableAnnotation, newRect: Rect): {
    dx: number;
    dy: number;
    rects: {
        rect: Rect;
        unrotatedRect?: Rect;
    };
};
export interface ResizeScalingResult {
    /** Horizontal scale factor */
    scaleX: number;
    /** Vertical scale factor */
    scaleY: number;
    /** The old rect used as the scaling reference (unrotatedRect ?? rect) */
    oldRect: Rect;
    /** The adjusted new rect after min-size and aspect-ratio enforcement */
    resolvedRect: Rect;
    /** The final rect + unrotatedRect patches to spread into the result */
    rects: {
        rect: Rect;
        unrotatedRect?: Rect;
    };
}
/**
 * Shared resize scaling logic:
 * 1. Determines scale factors from oldRect → newRect
 * 2. Enforces a minimum size of 10
 * 3. Optionally maintains aspect ratio
 * 4. Resolves rect vs unrotatedRect for rotated annotations
 *
 * Callers use `scaleX`, `scaleY`, `oldRect`, and `resolvedRect` to scale
 * their own type-specific data (vertices, linePoints, etc.), then spread
 * `rects` into their result.
 */
export declare function baseResizeScaling(orig: RotatableAnnotation, newRect: Rect, metadata?: {
    maintainAspectRatio?: boolean;
}): ResizeScalingResult;
/**
 * Compute the orbit translation (dx/dy) from a rotation result.
 * Point-based annotations (line, polyline, polygon, ink) use this to
 * translate their vertices/points alongside the rect orbit during
 * group rotation. For single-annotation rotation the delta is zero.
 */
export declare function rotateOrbitDelta(orig: RotatableAnnotation, rotateResult: {
    unrotatedRect?: Rect;
}): {
    dx: number;
    dy: number;
};
