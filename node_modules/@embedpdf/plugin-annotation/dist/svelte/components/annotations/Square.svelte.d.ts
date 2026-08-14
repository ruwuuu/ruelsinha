import { Rect, PdfRectDifferences, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface SquareProps {
    isSelected: boolean;
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    rect: Rect;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    appearanceActive?: boolean;
    cloudyBorderIntensity?: number;
    rectangleDifferences?: PdfRectDifferences;
}
declare const Square: import('svelte', { with: { "resolution-mode": "import" } }).Component<SquareProps, {}, "">;
type Square = ReturnType<typeof Square>;
export default Square;
