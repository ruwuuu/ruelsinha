import { PdfInkListObject, Rect } from '@embedpdf/models';
interface InkProps {
    isSelected: boolean;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    inkList: PdfInkListObject[];
    rect: Rect;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    appearanceActive?: boolean;
}
declare const Ink: import('svelte', { with: { "resolution-mode": "import" } }).Component<InkProps, {}, "">;
type Ink = ReturnType<typeof Ink>;
export default Ink;
