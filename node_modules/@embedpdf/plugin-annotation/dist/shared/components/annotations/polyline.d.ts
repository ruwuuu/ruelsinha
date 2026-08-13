import { MouseEvent } from '../../../react/adapter.ts';
import { Rect, Position, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface PolylineProps {
    rect: Rect;
    vertices: Position[];
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    /** Stroke style */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array */
    strokeDashArray?: number[];
    scale: number;
    isSelected: boolean;
    onClick?: (e: MouseEvent<SVGElement>) => void;
    /** Optional start & end endings */
    lineEndings?: LineEndings;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
}
export declare function Polyline({ rect, vertices, color, strokeColor, opacity, strokeWidth, strokeStyle, strokeDashArray, scale, isSelected, onClick, lineEndings, appearanceActive, }: PolylineProps): JSX.Element;
export {};
