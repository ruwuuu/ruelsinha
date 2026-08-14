interface MarqueeZoomProps {
    documentId: string;
    pageIndex: number;
    scale?: number;
    className?: string;
    stroke?: string;
    fill?: string;
}
export declare const MarqueeZoom: ({ documentId, pageIndex, scale: scaleOverride, className, stroke, fill, }: MarqueeZoomProps) => import("preact").JSX.Element | null;
export {};
