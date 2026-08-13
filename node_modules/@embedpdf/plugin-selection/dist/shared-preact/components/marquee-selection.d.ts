interface MarqueeSelectionProps {
    /** Document ID */
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
/**
 * MarqueeSelection renders a selection rectangle when the user drags to select items.
 * It registers the marquee handler on the page.
 *
 * Other plugins (e.g., annotation, form, redaction) can subscribe to `onMarqueeEnd` to
 * determine which objects intersect with the marquee rect.
 *
 * Use this component directly for advanced cases, or use `SelectionLayer`
 * which composes both `TextSelection` and `MarqueeSelection`.
 */
export declare const MarqueeSelection: ({ documentId, pageIndex, scale, className, background, borderColor, borderStyle, stroke, fill, }: MarqueeSelectionProps) => import("preact").JSX.Element | null;
export {};
