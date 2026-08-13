import { MouseEvent } from '../../../preact/adapter.ts';
import { PdfAnnotationBorderStyle, Rect } from '@embedpdf/models';
interface LinkProps {
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke colour – defaults to blue when omitted */
    strokeColor?: string;
    /** Stroke width in PDF units */
    strokeWidth?: number;
    /** Stroke type – defaults to underline when omitted */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array – for dashed style */
    strokeDashArray?: number[];
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: MouseEvent<SVGElement>) => void;
    /** Whether this link has an IRT (In Reply To) reference - disables direct interaction */
    hasIRT?: boolean;
}
/**
 * Renders a PDF Link annotation as SVG.
 * Supports underline (default), solid, and dashed border styles.
 */
export declare function Link({ isSelected, strokeColor, strokeWidth, strokeStyle, strokeDashArray, rect, scale, onClick, hasIRT, }: LinkProps): JSX.Element;
export {};
