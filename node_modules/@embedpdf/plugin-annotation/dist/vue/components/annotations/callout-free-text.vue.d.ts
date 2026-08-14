import { PdfFreeTextAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: PointerEvent) => void;
    appearanceActive?: boolean;
}> & Readonly<{}>, {
    appearanceActive: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
