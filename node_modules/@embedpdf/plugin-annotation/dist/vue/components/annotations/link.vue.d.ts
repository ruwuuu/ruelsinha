import { PdfAnnotationBorderStyle, Rect } from '@embedpdf/models';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke colour – defaults to blue when omitted */
    strokeColor?: string;
    /** Stroke width in PDF units */
    strokeWidth?: number;
    /** Stroke type – defaults to underline when omitted */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array – for dashed style */
    strokeDashArray?: number[];
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: PointerEvent | MouseEvent) => void;
    /** Whether this link has an IRT (In Reply To) reference - disables direct interaction */
    hasIRT?: boolean;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke colour – defaults to blue when omitted */
    strokeColor?: string;
    /** Stroke width in PDF units */
    strokeWidth?: number;
    /** Stroke type – defaults to underline when omitted */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array – for dashed style */
    strokeDashArray?: number[];
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: PointerEvent | MouseEvent) => void;
    /** Whether this link has an IRT (In Reply To) reference - disables direct interaction */
    hasIRT?: boolean;
}> & Readonly<{}>, {
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: PdfAnnotationBorderStyle;
    hasIRT: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
