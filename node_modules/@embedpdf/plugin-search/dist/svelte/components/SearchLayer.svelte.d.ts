import { HTMLAttributes } from 'svelte/elements';
interface SearchLayerProps extends HTMLAttributes<HTMLDivElement> {
    documentId: string;
    pageIndex: number;
    scale?: number;
    highlightColor?: string;
    activeHighlightColor?: string;
}
declare const SearchLayer: import('svelte', { with: { "resolution-mode": "import" } }).Component<SearchLayerProps, {}, "">;
type SearchLayer = ReturnType<typeof SearchLayer>;
export default SearchLayer;
