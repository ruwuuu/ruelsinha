import { Rect, Position, LineEndings, PdfAnnotationLineEnding, PdfRectDifferences, PdfFreeTextAnnoObject, getRectCenter, rotatePointAround, rotateVertices, calculateRotatedRectAABB, calculateRotatedRectAABBAroundPoint } from '@embedpdf/models';
export { rotatePointAround as rotatePointAroundCenter, rotateVertices, getRectCenter, calculateRotatedRectAABB, calculateRotatedRectAABBAroundPoint, };
/**
 * Calculate the axis-aligned bounding box for rotated vertices.
 * @param vertices - The rotated vertices
 * @param padding - Optional padding to add around the bounding box
 * @returns The axis-aligned bounding box
 */
export declare function calculateAABBFromVertices(vertices: Position[], padding?: number): Rect;
/**
 * Computes the exact bounding box for a line or polyline, including its endings and stroke width.
 * This function uses the central `LINE_ENDING_HANDLERS` to ensure calculations are
 * perfectly in sync with the rendering logic.
 */
export declare function lineRectWithEndings(vertices: Position[], strokeWidth: number, endings: LineEndings | undefined): Rect;
/**
 * Build rect patches for vertex editing.
 * For rotated annotations, the tight rect is kept as unrotatedRect and the AABB is
 * computed around the new content center so rotation UI follows the edited geometry.
 */
export declare function resolveVertexEditRects(original: {
    rect: Rect;
    unrotatedRect?: Rect;
    rotation?: number;
}, tightRect: Rect): {
    rect: Rect;
    unrotatedRect?: Rect;
};
/**
 * Resolve an annotation's effective rotation center in page coordinates.
 */
export declare function resolveAnnotationRotationCenter(original: {
    rect: Rect;
    unrotatedRect?: Rect;
    rotation?: number;
}): Position;
/**
 * Build rotate patches while preserving an annotation's effective rotation center.
 * The incoming unrotated rect may already include a translation (group rotation/orbit).
 */
export declare function resolveRotateRects(original: {
    rect: Rect;
    unrotatedRect?: Rect;
    rotation?: number;
}, nextUnrotatedRect: Rect, angleDegrees: number): {
    rect: Rect;
    unrotatedRect: Rect;
};
/**
 * Compensate vertices for rotated vertex editing so the dragged point tracks the cursor
 * while the rotation center follows edited geometry.
 *
 * Without this compensation, changing the tight bounds center during a rotated vertex edit
 * applies an additional translation to all points, which appears as opposite-end drift.
 */
export declare function compensateRotatedVertexEdit(original: {
    rect: Rect;
    unrotatedRect?: Rect;
    rotation?: number;
}, vertices: Position[], tightRect: Rect): Position[];
/**
 * Derive the text box rect from the annotation's overall rect and RD inset.
 */
export declare function computeTextBoxFromRD(rect: Rect, rd: PdfRectDifferences | undefined): Rect;
/**
 * Compute the RD inset from the overall rect to the text box.
 */
export declare function computeRDFromTextBox(overallRect: Rect, textBox: Rect): PdfRectDifferences;
/**
 * Auto-compute the callout connection point on the text box edge.
 * Uses the knee's position relative to the text box center, scaled by aspect ratio,
 * to choose the nearest edge midpoint (top, right, bottom, left).
 */
export declare function computeCalloutConnectionPoint(knee: Position, textBox: Rect): Position;
/**
 * Compute the overall bounding rect for a callout FreeText, encompassing
 * the text box, callout line, and line ending geometry.
 *
 * The text box border grows inward (stroke outer edge = textBox boundary),
 * so no outward padding is added for the text box. The callout line and
 * arrow stroke extend outward and miter joins at the knee can protrude
 * further, so they get strokeWidth padding (half for stroke + half for
 * miter/join clearance).
 */
export declare function computeCalloutOverallRect(textBox: Rect, calloutLine: Position[], lineEnding: PdfAnnotationLineEnding | undefined, strokeWidth: number): Rect;
export declare const calloutVertexConfig: {
    extractVertices: (a: PdfFreeTextAnnoObject) => Position[];
    transformAnnotation: (a: PdfFreeTextAnnoObject, vertices: Position[]) => {
        calloutLine?: undefined;
        rect?: undefined;
        rectangleDifferences?: undefined;
    } | {
        calloutLine: Position[];
        rect: Rect;
        rectangleDifferences: PdfRectDifferences;
    };
};
