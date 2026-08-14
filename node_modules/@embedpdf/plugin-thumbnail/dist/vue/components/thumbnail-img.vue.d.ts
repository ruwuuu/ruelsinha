import { ThumbMeta } from '../../lib/index.ts';
interface ThumbImgProps {
    /**
     * The ID of the document that this thumbnail belongs to
     */
    documentId: string;
    meta: ThumbMeta;
}
declare const __VLS_export: import('vue').DefineComponent<ThumbImgProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<ThumbImgProps> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
