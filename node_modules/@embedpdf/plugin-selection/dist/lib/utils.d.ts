import { PdfPageGeometry, Position, Rect } from '@embedpdf/models';
import { SelectionRangeX } from './types';
/**
 * Hit-test helper using runs, with tolerance-based fallback.
 *
 * Adapted from PDFium's FPDFText_GetCharIndexAtPos / CPDF_TextPage::GetIndexAtPos:
 *  1. Exact match: return the glyph whose bounding box contains the point.
 *  2. Tolerance expansion: expand each glyph box by tolerance/2 on every side,
 *     then pick the closest glyph by Manhattan distance.
 *
 * @param geo - page geometry
 * @param pt - point in page coordinates
 * @param toleranceFactor - multiplied by average glyph height to derive the
 *                          tolerance radius. 0 disables the fallback.
 *                          Default 1.5 (see Chromium's pdfium-page.cc kTolerance).
 * @returns glyph index, or -1 if nothing was hit
 */
export declare function glyphAt(geo: PdfPageGeometry, pt: Position, toleranceFactor?: number): number;
/**
 * Helper: min/max glyph indices on `page` for current sel
 * @param sel - selection range
 * @param geo - page geometry
 * @param page - page index
 * @returns { from: number; to: number } | null
 */
export declare function sliceBounds(sel: SelectionRangeX | null, geo: PdfPageGeometry | undefined, page: number): {
    from: number;
    to: number;
} | null;
/**
 * Helper: build rects for a slice of the page
 * @param geo - page geometry
 * @param from - from index
 * @param to - to index
 * @param merge - whether to merge adjacent rects (default: true)
 * @returns rects
 */
export declare function rectsWithinSlice(geo: PdfPageGeometry, from: number, to: number, merge?: boolean): Rect[];
/**
 * ============================================================================
 * Rectangle Merging Algorithm
 * ============================================================================
 *
 * The following code is adapted from Chromium's PDF text selection implementation.
 *
 * Copyright 2010 The Chromium Authors
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file: https://source.chromium.org/chromium/chromium/src/+/main:LICENSE
 *
 * Original source:
 * https://source.chromium.org/chromium/chromium/src/+/main:pdf/pdfium/pdfium_range.cc
 *
 * Adapted for TypeScript and this project's Rect/geometry types.
 */
/**
 * Text run info for rect merging (similar to Chromium's PdfRectTextRunInfo)
 */
export interface TextRunInfo {
    rect: Rect;
    charCount: number;
    fontSize?: number;
}
/**
 * Helper functions for Rect operations
 */
export declare function rectUnion(rect1: Rect, rect2: Rect): Rect;
export declare function rectIntersect(rect1: Rect, rect2: Rect): Rect;
export declare function rectIsEmpty(rect: Rect): boolean;
/**
 * Returns a ratio between [0, 1] representing vertical overlap
 */
export declare function getVerticalOverlap(rect1: Rect, rect2: Rect): number;
/**
 * Returns true if there is sufficient horizontal and vertical overlap
 */
export declare function shouldMergeHorizontalRects(textRun1: TextRunInfo, textRun2: TextRunInfo): boolean;
/**
 * Merge adjacent rectangles based on proximity and overlap.
 *
 * Adapted from Chromium's MergeAdjacentRects (pdfium_range.cc):
 *  - The merge DECISION uses the loose `rect` (via shouldMergeHorizontalRects).
 *  - The OUTPUT rect always uses loose bounds.
 */
export declare function mergeAdjacentRects(textRuns: TextRunInfo[]): Rect[];
/**
 * Expand a character index to the word surrounding it.
 *
 * Walks backward and forward from `charIndex` within the page geometry
 * until a word-boundary glyph (space or empty) is encountered.
 *
 * @returns `{ from, to }` inclusive indices, or null if charIndex is invalid.
 */
export declare function expandToWordBoundary(geo: PdfPageGeometry, charIndex: number): {
    from: number;
    to: number;
} | null;
/**
 * Expand a character index to the full visual line (row) it belongs to.
 *
 * Finds all runs whose vertical extent overlaps with the run containing `charIndex`,
 * then returns the first-to-last character span across those runs.
 *
 * @returns `{ from, to }` inclusive indices, or null if charIndex is invalid.
 */
export declare function expandToLineBoundary(geo: PdfPageGeometry, charIndex: number): {
    from: number;
    to: number;
} | null;
