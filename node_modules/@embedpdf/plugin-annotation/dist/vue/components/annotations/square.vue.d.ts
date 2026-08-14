import { PdfAnnotationBorderStyle, PdfRectDifferences, Rect } from '@embedpdf/models';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
    isSelected: boolean;
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    rect: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
    cloudyBorderIntensity?: number;
    rectangleDifferences?: PdfRectDifferences;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
    isSelected: boolean;
    color?: string;
    strokeColor?: string;
    opacity?: number;
    strokeWidth: number;
    strokeStyle?: PdfAnnotationBorderStyle;
    strokeDashArray?: number[];
    rect: Rect;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
    cloudyBorderIntensity?: number;
    rectangleDifferences?: PdfRectDifferences;
}> & Readonly<{}>, {
    color: string;
    opacity: number;
    strokeStyle: PdfAnnotationBorderStyle;
    appearanceActive: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
