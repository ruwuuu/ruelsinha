interface ThumbnailsPaneProps {
    /**
     * The ID of the document that this thumbnail pane displays
     */
    documentId: string;
}
declare var __VLS_1: {
    meta: {
        pageIndex: number;
        width: number;
        height: number;
        wrapperHeight: number;
        top: number;
        labelHeight: number;
        padding?: number | undefined;
    };
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<ThumbnailsPaneProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<ThumbnailsPaneProps> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
