import { Rect, Position, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface PolylineProps {
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
    onClick?: (e: MouseEvent) => void;
    lineEndings?: LineEndings;
    appearanceActive?: boolean;
}
declare const Polyline: import('svelte', { with: { "resolution-mode": "import" } }).Component<PolylineProps, {}, "">;
type Polyline = ReturnType<typeof Polyline>;
export default Polyline;
