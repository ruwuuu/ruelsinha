import { PdfAnnotationLineEnding } from '@embedpdf/models';
export interface SvgEnding {
    d: string;
    transform: string;
    filled: boolean;
}
/**
 * Factory that returns SVG path data and transform attributes for a given line ending.
 * It uses a central handler for each ending type to ensure consistency.
 */
export declare function createEnding(ending: PdfAnnotationLineEnding | undefined, strokeWidth: number, rad: number, // direction angle in radians of the line segment
px: number, // x-coordinate of the line's endpoint
py: number): SvgEnding | null;
