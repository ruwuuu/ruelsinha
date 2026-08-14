interface RenderLayerProps {
    /**
     * The ID of the document to render from
     */
    documentId: string;
    /**
     * The page index to render (0-based)
     */
    pageIndex: number;
    /**
     * Optional scale override. If not provided, uses document's current scale.
     */
    scale?: number;
    /**
     * Optional device pixel ratio override. If not provided, uses window.devicePixelRatio.
     */
    dpr?: number;
}
declare const __VLS_export: import('vue').DefineComponent<RenderLayerProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<RenderLayerProps> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
