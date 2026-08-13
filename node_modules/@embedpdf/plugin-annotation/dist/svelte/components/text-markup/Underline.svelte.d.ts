import { Rect } from '@embedpdf/models';
interface UnderlineProps {
    /** Stroke/markup color */
    strokeColor?: string;
    opacity?: number;
    segmentRects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    style?: Record<string, string | number | undefined>;
    /** When true, AP image provides the visual; only render hit area */
    appearanceActive?: boolean;
}
declare const Underline: import('svelte', { with: { "resolution-mode": "import" } }).Component<UnderlineProps, {}, "">;
type Underline = ReturnType<typeof Underline>;
export default Underline;
