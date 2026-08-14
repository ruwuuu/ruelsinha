import { HTMLImgAttributes } from 'svelte/elements';
interface RenderLayerProps extends Omit<HTMLImgAttributes, 'style'> {
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
    class?: string;
    style?: string;
}
declare const RenderLayer: import('svelte', { with: { "resolution-mode": "import" } }).Component<RenderLayerProps, {}, "">;
type RenderLayer = ReturnType<typeof RenderLayer>;
export default RenderLayer;
