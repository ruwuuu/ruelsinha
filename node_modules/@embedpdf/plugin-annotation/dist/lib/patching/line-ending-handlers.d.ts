import { PdfAnnotationLineEnding, Position } from '@embedpdf/models';
/**
 * A handler that encapsulates all logic for a specific line ending type,
 * including SVG path generation, geometric vertex calculation, and rotation logic.
 * This is the single source of truth for each ending.
 */
export interface LineEndingHandler {
    /** Returns the SVG `d` attribute string for rendering. */
    getSvgPath: (strokeWidth: number) => string;
    /** Returns the vertices used for calculating the geometric bounding box. */
    getLocalPoints: (strokeWidth: number) => Position[];
    /** Returns the final rotation angle in radians based on the line segment's angle. */
    getRotation: (segmentAngle: number) => number;
    /** True if the shape should be filled, false if only stroked. */
    filled: boolean;
}
/**
 * A map containing the authoritative handler for each line ending type.
 */
export declare const LINE_ENDING_HANDLERS: Partial<Record<PdfAnnotationLineEnding, LineEndingHandler>>;
