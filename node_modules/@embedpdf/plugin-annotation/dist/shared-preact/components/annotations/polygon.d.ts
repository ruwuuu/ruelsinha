import { MouseEvent } from '../../../preact/adapter.ts';
import { Rect, Position, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface PolygonProps {
    rect: Rect;
    vertices: Position[];
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    scale: number;
    isSelected: boolean;
    onClick?: (e: MouseEvent<SVGElement>) => void;
    currentVertex?: Position;
    handleSize?: number;
    /** When true, AP canvas provides the visual; only render hit area */
    appearanceActive?: boolean;
    /** Cloudy border intensity (0 = no cloud, typically 1 or 2) */
    cloudyBorderIntensity?: number;
}
export declare function Polygon({ rect, vertices, color, strokeColor, opacity, strokeWidth, strokeStyle, strokeDashArray, scale, isSelected, onClick, currentVertex, handleSize, appearanceActive, cloudyBorderIntensity, }: PolygonProps): JSX.Element;
export {};
