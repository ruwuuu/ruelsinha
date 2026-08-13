interface MarqueeCaptureProps {
    /** Document ID */
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
declare const MarqueeCapture: import('svelte', { with: { "resolution-mode": "import" } }).Component<MarqueeCaptureProps, {}, "">;
type MarqueeCapture = ReturnType<typeof MarqueeCapture>;
export default MarqueeCapture;
