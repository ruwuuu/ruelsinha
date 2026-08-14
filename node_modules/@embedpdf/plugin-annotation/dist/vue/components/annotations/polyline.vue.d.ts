import { Rect, Position, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
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
    onClick?: (e: PointerEvent) => void;
    lineEndings?: LineEndings;
    appearanceActive?: boolean;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
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
    onClick?: (e: PointerEvent) => void;
    lineEndings?: LineEndings;
    appearanceActive?: boolean;
}> & Readonly<{}>, {
    strokeColor: string;
    color: string;
    opacity: number;
    strokeStyle: PdfAnnotationBorderStyle;
    appearanceActive: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
