import { Rect } from '@embedpdf/models';
/**
 * Re-export rotation geometry utilities from @embedpdf/models.
 *
 * These functions used to live here but have been promoted to the shared models
 * package so that both @embedpdf/utils (DragResizeController) and
 * @embedpdf/plugin-annotation (patches) can import from the same source.
 *
 * Existing imports from this module continue to work unchanged.
 */
export { rotatePointAround as rotatePointAroundCenter, rotateVertices, getRectCenter, calculateRotatedRectAABBAroundPoint, calculateRotatedRectAABB, inferRotationCenterFromRects, } from '@embedpdf/models';
/**
 * Convert an AABB-space rect to unrotated space.
 *
 * During group resize the pipeline works in AABB space (axis-aligned bounding
 * box), but `baseResizeScaling` expects the incoming rect in unrotated space.
 *
 * The AABB of a rect rotated by θ around its center is:
 *   AABB_w = w·|cosθ| + h·|sinθ|
 *   AABB_h = w·|sinθ| + h·|cosθ|
 *
 * This function inverts that system to recover (w, h) from the new AABB size.
 * Near 45° the system is degenerate (the AABB is always square), so we fall
 * back to uniform scaling based on the area ratio.
 *
 * @param newAABBRect - the proportionally scaled AABB rect from the group resize
 * @param originalAABBRect - the original AABB rect captured at resize start
 * @param originalUnrotatedRect - the original unrotated rect captured at resize start
 * @param rotationDegrees - the annotation's rotation in degrees
 * @returns the equivalent rect in unrotated space
 */
export declare function convertAABBRectToUnrotatedSpace(newAABBRect: Rect, originalAABBRect: Rect, originalUnrotatedRect: Rect, rotationDegrees: number): Rect;
