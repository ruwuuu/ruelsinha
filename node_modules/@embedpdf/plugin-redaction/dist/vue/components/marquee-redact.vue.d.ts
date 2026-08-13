interface MarqueeRedactProps {
    /** The ID of the document */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Scale of the page */
    scale?: number;
    /** Optional CSS class applied to the marquee rectangle */
    className?: string;
    /** Stroke / fill colours (defaults below) */
    stroke?: string;
    fill?: string;
}
declare const __VLS_export: import('vue').DefineComponent<MarqueeRedactProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<MarqueeRedactProps> & Readonly<{}>, {
    fill: string;
    stroke: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
