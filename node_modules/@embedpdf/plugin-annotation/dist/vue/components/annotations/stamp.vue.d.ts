import { PdfStampAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: import('vue').DefineComponent<{
    isSelected: boolean;
    annotation: TrackedAnnotation<PdfStampAnnoObject>;
    documentId: string;
    pageIndex: number;
    scale: number;
    onClick?: (e: PointerEvent) => void;
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
    isSelected: boolean;
    annotation: TrackedAnnotation<PdfStampAnnoObject>;
    documentId: string;
    pageIndex: number;
    scale: number;
    onClick?: (e: PointerEvent) => void;
}> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
