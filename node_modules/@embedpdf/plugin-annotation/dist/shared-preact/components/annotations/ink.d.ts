import { MouseEvent } from '../../../preact/adapter.ts';
import { PdfInkListObject, Rect } from '@embedpdf/models';
interface InkProps {
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke color */
    strokeColor?: string;
    /** 0 – 1 */
    opacity?: number;
    /** Line width in PDF units */
    strokeWidth: number;
    /** Array of strokes — exactly as in your JSON */
    inkList: PdfInkListObject[];
    /** Bounding box of the whole annotation */
    rect: Rect;
    /** Page zoom factor */
    scale: number;
    /** Callback for when the annotation is clicked */
    onClick?: (e: MouseEvent<SVGPathElement>) => void;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
}
/**
 * Renders a PDF Ink annotation (free-hand drawing) as SVG.
 */
export declare function Ink({ isSelected, strokeColor, opacity, strokeWidth, inkList, rect, scale, onClick, appearanceActive, }: InkProps): JSX.Element;
export {};
