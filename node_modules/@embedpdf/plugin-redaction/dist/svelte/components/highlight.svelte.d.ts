import { Rect } from '@embedpdf/models';
interface HighlightProps {
    color?: string;
    opacity?: number;
    border?: string;
    rects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    style?: string;
}
declare const Highlight: import('svelte', { with: { "resolution-mode": "import" } }).Component<HighlightProps, {}, "">;
type Highlight = ReturnType<typeof Highlight>;
export default Highlight;
