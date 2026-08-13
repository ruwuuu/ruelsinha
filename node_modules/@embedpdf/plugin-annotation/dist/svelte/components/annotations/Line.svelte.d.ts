import { Rect, LinePoints, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
interface LineProps {
    color?: string;
    opacity?: number;
    strokeWidth: number;
    strokeColor?: string;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    rect: Rect;
    linePoints: LinePoints;
    lineEndings?: LineEndings;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    isSelected: boolean;
    appearanceActive?: boolean;
}
declare const Line: import('svelte', { with: { "resolution-mode": "import" } }).Component<LineProps, {}, "">;
type Line = ReturnType<typeof Line>;
export default Line;
