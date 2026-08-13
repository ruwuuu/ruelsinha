import { CSSProperties } from 'vue';
import { PdfAnnotationObject } from '@embedpdf/models';
type __VLS_Props = {
    documentId: string;
    pageIndex: number;
    annotation: PdfAnnotationObject;
    scaleFactor?: number;
    unrotated?: boolean;
    style?: CSSProperties;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    scaleFactor: number;
    unrotated: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
