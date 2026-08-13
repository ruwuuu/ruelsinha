import { Rect } from '@embedpdf/models';
interface HighlightProps {
    color?: string;
    opacity?: number;
    border?: string;
    rects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
}
declare const __VLS_export: import('vue').DefineComponent<HighlightProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<HighlightProps> & Readonly<{}>, {
    color: string;
    opacity: number;
    border: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
