import { MouseEvent } from '../../../react/adapter.ts';
import { PdfAnnotationBorderStyle, PdfRectDifferences, Rect } from '@embedpdf/models';
interface SquareProps {
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Fill colour – defaults to PDFium's black if omitted */
    color?: string;
    /** Stroke colour – defaults to same as fill when omitted */
    strokeColor?: string;
    /** 0 – 1 */
    opacity?: number;
    /** Stroke width in PDF units */
    strokeWidth: number;
    /** Stroke type – defaults to solid when omitted */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array – defaults to undefined when omitted */
    strokeDashArray?: number[];
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: MouseEvent<SVGElement>) => void;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
    /** Cloudy border intensity (0 = no cloud, typically 1 or 2) */
    cloudyBorderIntensity?: number;
    /** Rectangle differences – inset from Rect to drawn area */
    rectangleDifferences?: PdfRectDifferences;
}
/**
 * Renders a PDF Square annotation (rectangle) as SVG.
 */
export declare function Square({ isSelected, color, strokeColor, opacity, strokeWidth, strokeStyle, strokeDashArray, rect, scale, onClick, appearanceActive, cloudyBorderIntensity, rectangleDifferences, }: SquareProps): JSX.Element;
export {};
