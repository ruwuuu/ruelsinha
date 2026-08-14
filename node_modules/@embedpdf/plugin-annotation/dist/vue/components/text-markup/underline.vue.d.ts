import { Rect } from '@embedpdf/models';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
    /** Stroke/markup color */
    strokeColor?: string;
    opacity?: number;
    segmentRects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    /** When true, AP image provides the visual; only render hit area */
    appearanceActive?: boolean;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
    /** Stroke/markup color */
    strokeColor?: string;
    opacity?: number;
    segmentRects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    /** When true, AP image provides the visual; only render hit area */
    appearanceActive?: boolean;
}> & Readonly<{}>, {
    opacity: number;
    appearanceActive: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
