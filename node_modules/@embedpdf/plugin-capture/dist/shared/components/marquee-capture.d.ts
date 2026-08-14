interface MarqueeCaptureProps {
    /** Document ID */
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
export declare const MarqueeCapture: ({ documentId, pageIndex, scale, className, stroke, fill, }: MarqueeCaptureProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
