import { HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
type SearchLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    documentId: string;
    pageIndex: number;
    scale?: number;
    highlightColor?: string;
    activeHighlightColor?: string;
    style?: CSSProperties;
};
export declare function SearchLayer({ documentId, pageIndex, scale: scaleOverride, style, highlightColor, activeHighlightColor, ...props }: SearchLayoutProps): import("preact").JSX.Element | null;
export {};
