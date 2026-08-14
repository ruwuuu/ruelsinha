import { Rect } from '@embedpdf/models';
interface CaretProps {
    isSelected: boolean;
    strokeColor?: string;
    opacity?: number;
    rect: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
}
declare const Caret: import('svelte', { with: { "resolution-mode": "import" } }).Component<CaretProps, {}, "">;
type Caret = ReturnType<typeof Caret>;
export default Caret;
