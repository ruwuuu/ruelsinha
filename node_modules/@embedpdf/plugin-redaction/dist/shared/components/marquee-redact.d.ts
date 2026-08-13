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
export declare const MarqueeRedact: ({ documentId, pageIndex, scale: scaleOverride, className, stroke, fill, }: MarqueeRedactProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
