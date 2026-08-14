import { CSSProperties, HTMLAttributes } from '../../react/adapter.ts';
type RenderLayerProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
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
    /**
     * Additional styles for the image element
     */
    style?: CSSProperties;
};
/**
 * RenderLayer Component
 *
 * Renders a PDF page with smart prop handling:
 * - If scale/dpr/rotation props are provided, they override document state
 * - If not provided, component uses document's current state values
 * - Automatically re-renders when:
 *   1. Document state changes (scale, rotation)
 *   2. Page is refreshed (via REFRESH_PAGES action in core)
 */
export declare function RenderLayer({ documentId, pageIndex, scale: scaleOverride, dpr: dprOverride, style, ...props }: RenderLayerProps): import("react/jsx-runtime").JSX.Element;
export {};
