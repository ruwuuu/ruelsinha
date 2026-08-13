import { Rect } from '@embedpdf/models';
interface SquigglyProps {
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
declare const Squiggly: import('svelte', { with: { "resolution-mode": "import" } }).Component<SquigglyProps, {}, "">;
type Squiggly = ReturnType<typeof Squiggly>;
export default Squiggly;
