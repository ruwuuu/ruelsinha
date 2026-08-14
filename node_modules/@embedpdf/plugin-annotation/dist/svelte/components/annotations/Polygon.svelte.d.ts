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
    onClick?: (e: MouseEvent) => void;
    currentVertex?: Position;
    handleSize?: number;
    appearanceActive?: boolean;
    cloudyBorderIntensity?: number;
}
declare const Polygon: import('svelte', { with: { "resolution-mode": "import" } }).Component<PolygonProps, {}, "">;
type Polygon = ReturnType<typeof Polygon>;
export default Polygon;
