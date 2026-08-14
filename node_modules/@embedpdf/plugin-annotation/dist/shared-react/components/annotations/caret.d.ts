import { MouseEvent } from '../../../react/adapter.ts';
import { Rect } from '@embedpdf/models';
interface CaretProps {
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke colour */
    strokeColor?: string;
    /** 0 – 1 */
    opacity?: number;
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: MouseEvent<SVGElement>) => void;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
}
/**
 * Renders a PDF Caret annotation as an SVG ^ symbol using bezier curves
 * that mirror the C++ appearance stream.
 */
export declare function Caret({ isSelected, strokeColor, opacity, rect, scale, onClick, appearanceActive, }: CaretProps): JSX.Element;
export {};
