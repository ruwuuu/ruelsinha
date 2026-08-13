/**
 * Cloudy border path generator for PDF annotations.
 *
 * Framework-agnostic utility that generates SVG path `d` strings for cloudy
 * (scalloped) borders on Rectangle, Ellipse, and Polygon shapes.
 *
 * Derived from Apache PDFBox's CloudyBorder.java:
 * https://github.com/apache/pdfbox/blob/trunk/pdfbox/src/main/java/org/apache/pdfbox/pdmodel/interactive/annotation/handlers/CloudyBorder.java
 *
 * Original code licensed under the Apache License, Version 2.0:
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Substantially modified: ported from Java to TypeScript, adapted for SVG
 * path output, and reworked curl distribution and merging logic.
 *
 * Copyright (c) 2026 CloudPDF / EmbedPDF
 *
 * @module
 */
interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
/** Rect differences (inset from annotation Rect to drawn shape). */
export interface RectDifferences {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface CloudyPathResult {
    /** SVG path `d` attribute string */
    path: string;
    /** Bounding box of the generated cloudy border (in annotation-local coords) */
    bbox: BBox;
}
/**
 * Returns the per-side outward extent of a cloudy border (how far the
 * scallop peaks + stroke extend beyond the inner shape boundary).
 *
 * Use this to compute `rectangleDifferences` for Square/Circle or the
 * padding for Polygon Rect computation.
 */
export declare function getCloudyBorderExtent(intensity: number, lineWidth: number, isEllipse: boolean): number;
/**
 * Generates a cloudy border SVG path for a rectangle (Square annotation).
 *
 * @param rect - The annotation rect `{ x, y, width, height }` (top-left origin)
 * @param rd - Rectangle differences (inset), or undefined
 * @param intensity - Cloudy border intensity (typically 1 or 2)
 * @param lineWidth - Stroke width of the annotation border
 */
export declare function generateCloudyRectanglePath(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
}, rd: RectDifferences | undefined, intensity: number, lineWidth: number): CloudyPathResult;
/**
 * Generates a cloudy border SVG path for an ellipse (Circle annotation).
 *
 * @param rect - The annotation rect `{ x, y, width, height }` (top-left origin)
 * @param rd - Rectangle differences (inset), or undefined
 * @param intensity - Cloudy border intensity (typically 1 or 2)
 * @param lineWidth - Stroke width of the annotation border
 */
export declare function generateCloudyEllipsePath(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
}, rd: RectDifferences | undefined, intensity: number, lineWidth: number): CloudyPathResult;
/**
 * Generates a cloudy border SVG path for a polygon.
 *
 * @param vertices - The polygon vertices in annotation-local coordinates
 * @param rectOrigin - The annotation rect origin `{ x, y }` for coordinate translation
 * @param intensity - Cloudy border intensity (typically 1 or 2)
 * @param lineWidth - Stroke width of the annotation border
 */
export declare function generateCloudyPolygonPath(vertices: ReadonlyArray<{
    x: number;
    y: number;
}>, rectOrigin: {
    x: number;
    y: number;
}, intensity: number, lineWidth: number): CloudyPathResult;
export {};
