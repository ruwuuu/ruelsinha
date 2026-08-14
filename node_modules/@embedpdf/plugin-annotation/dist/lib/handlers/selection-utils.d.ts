import { Rect } from '@embedpdf/models';
/**
 * Compute a caret annotation rect at the end of a text selection.
 * The caret is half the line height, bottom-aligned with the line,
 * and horizontally centered on the line's end edge.
 */
export declare function computeCaretRect(lastSegRect: Rect): Rect;
