import { Position, Rect } from '@embedpdf/models';
import { ResizeHandle } from './drag-resize-controller';
/** Anchor describes which edges stay fixed when resizing. */
export type Anchor = {
    x: 'left' | 'right' | 'center';
    y: 'top' | 'bottom' | 'center';
};
/**
 * Derive anchor from handle.
 * - 'e' means we're dragging east → left edge is anchored
 * - 'nw' means we're dragging north-west → bottom-right corner is anchored
 */
export declare function getAnchor(handle: ResizeHandle): Anchor;
/** Get the anchor point (the visually fixed point) in page space for a given rect and anchor. */
export declare function getAnchorPoint(rect: Rect, anchor: Anchor): Position;
export interface ResizeConstraints {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    boundingBox?: {
        width: number;
        height: number;
    };
}
/**
 * Apply the mouse delta to produce a raw (unconstrained) resized rect.
 */
export declare function applyResizeDelta(startRect: Rect, delta: Position, anchor: Anchor): Rect;
/**
 * Enforce aspect ratio while respecting the anchor.
 * For edge handles (center anchor on one axis), the rect expands symmetrically on that axis.
 * For corner handles, the anchor corner stays fixed.
 */
export declare function enforceAspectRatio(rect: Rect, startRect: Rect, anchor: Anchor, aspectRatio: number): Rect;
/**
 * Clamp rect to bounding box while respecting anchor.
 */
export declare function clampToBounds(rect: Rect, startRect: Rect, anchor: Anchor, bbox: {
    width: number;
    height: number;
} | undefined, maintainAspectRatio: boolean): Rect;
/**
 * Reposition rect from current size so the start-gesture anchor remains fixed.
 * This prevents translation drift when constraints clamp width/height.
 */
export declare function reanchorRect(rect: Rect, startRect: Rect, anchor: Anchor): Rect;
/**
 * Apply min/max constraints. Also used by the drag pipeline for position clamping.
 */
export declare function applyConstraints(position: Rect, constraints: ResizeConstraints | undefined, maintainAspectRatio: boolean, skipBoundingClamp?: boolean): Rect;
/**
 * Check if a rect, when rotated, fits within the given page bounds.
 */
export declare function isRectWithinRotatedBounds(rect: Rect, angleDegrees: number, bbox: {
    width: number;
    height: number;
}): boolean;
export interface ResizeConfig {
    startRect: Rect;
    maintainAspectRatio?: boolean;
    annotationRotation?: number;
    constraints?: ResizeConstraints;
}
/**
 * Calculate the new rect after a resize operation.
 *
 * For non-rotated annotations, runs the pipeline once with local bound clamping.
 * For rotated annotations, uses a binary search to find the largest delta that
 * keeps the visual AABB within page bounds.
 */
export declare function computeResizedRect(delta: Position, handle: ResizeHandle, config: ResizeConfig): Rect;
