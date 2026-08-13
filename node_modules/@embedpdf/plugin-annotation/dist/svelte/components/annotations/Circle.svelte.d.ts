import { PdfAnnotationBorderStyle, PdfRectDifferences, Rect } from '@embedpdf/models';
interface CircleProps {
    isSelected: boolean;
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    rect: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
    cloudyBorderIntensity?: number;
    rectangleDifferences?: PdfRectDifferences;
}
declare const Circle: import('svelte', { with: { "resolution-mode": "import" } }).Component<CircleProps, {}, "">;
type Circle = ReturnType<typeof Circle>;
export default Circle;
