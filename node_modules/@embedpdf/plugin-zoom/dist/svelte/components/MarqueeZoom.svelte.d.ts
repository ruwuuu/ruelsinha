interface MarqueeZoomProps {
    /** The ID of the document */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Scale of the page */
    scale?: number;
    /** Optional CSS class applied to the marquee rectangle */
    class?: string;
    /** Stroke / fill colours (defaults below) */
    stroke?: string;
    fill?: string;
}
declare const MarqueeZoom: import('svelte', { with: { "resolution-mode": "import" } }).Component<MarqueeZoomProps, {}, "">;
type MarqueeZoom = ReturnType<typeof MarqueeZoom>;
export default MarqueeZoom;
