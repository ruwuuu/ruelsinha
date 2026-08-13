import { Rect, LinePoints, LineEndings, PdfAnnotationBorderStyle } from '@embedpdf/models';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
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
    onClick?: (e: PointerEvent) => void;
    isSelected: boolean;
    appearanceActive?: boolean;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
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
    onClick?: (e: PointerEvent) => void;
    isSelected: boolean;
    appearanceActive?: boolean;
}> & Readonly<{}>, {
    strokeColor: string;
    color: string;
    opacity: number;
    strokeStyle: PdfAnnotationBorderStyle;
    appearanceActive: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
