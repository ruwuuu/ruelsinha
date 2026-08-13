import { MouseEvent } from '../../../preact/adapter.ts';
import { Rect, LinePoints, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface LineProps {
    /** interior colour */
    color?: string;
    /** 0 – 1 */
    opacity?: number;
    /** Stroke width in PDF units */
    strokeWidth: number;
    /** Stroke colour (falls back to PDFium default black) */
    strokeColor?: string;
    /** Stroke style */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array */
    strokeDashArray?: number[];
    /** Bounding box of the annotation */
    rect: Rect;
    /** Line start / end points (page units) */
    linePoints: LinePoints;
    /** Line endings (eg. OpenArrow / Butt) */
    lineEndings?: LineEndings;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: MouseEvent<SVGElement>) => void;
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
}
/**
 * Renders a PDF Line annotation as SVG (with arrow/butt endings).
 */
export declare function Line({ color, opacity, strokeWidth, strokeColor, strokeStyle, strokeDashArray, rect, linePoints, lineEndings, scale, onClick, isSelected, appearanceActive, }: LineProps): JSX.Element;
export {};
