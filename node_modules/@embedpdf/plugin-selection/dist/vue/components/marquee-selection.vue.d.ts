interface MarqueeSelectionProps {
    /** The ID of the document */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Scale of the page (optional, defaults to document scale) */
    scale?: number;
    /** Optional CSS class applied to the marquee rectangle */
    className?: string;
    /** Fill/background color inside the marquee rectangle. Default: 'rgba(0,122,204,0.15)' */
    background?: string;
    /** Border color of the marquee rectangle. Default: 'rgba(0,122,204,0.8)' */
    borderColor?: string;
    /** Border style. Default: 'dashed' */
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    /**
     * @deprecated Use `borderColor` instead.
     */
    stroke?: string;
    /**
     * @deprecated Use `background` instead.
     */
    fill?: string;
}
declare const __VLS_export: import('vue').DefineComponent<MarqueeSelectionProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<MarqueeSelectionProps> & Readonly<{}>, {
    borderStyle: "solid" | "dashed" | "dotted";
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
