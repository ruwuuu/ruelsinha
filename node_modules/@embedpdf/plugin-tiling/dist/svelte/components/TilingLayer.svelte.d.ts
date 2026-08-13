import { HTMLAttributes } from 'svelte/elements';
type TilingLayoutProps = HTMLAttributes<HTMLDivElement> & {
    documentId: string;
    pageIndex: number;
    scale?: number;
    class?: string;
};
declare const TilingLayer: import('svelte', { with: { "resolution-mode": "import" } }).Component<TilingLayoutProps, {}, "">;
type TilingLayer = ReturnType<typeof TilingLayer>;
export default TilingLayer;
