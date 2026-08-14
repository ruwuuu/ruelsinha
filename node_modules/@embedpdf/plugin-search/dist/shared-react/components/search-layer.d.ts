import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
type SearchLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    documentId: string;
    pageIndex: number;
    scale?: number;
    highlightColor?: string;
    activeHighlightColor?: string;
    style?: CSSProperties;
};
export declare function SearchLayer({ documentId, pageIndex, scale: scaleOverride, style, highlightColor, activeHighlightColor, ...props }: SearchLayoutProps): import("react/jsx-runtime").JSX.Element | null;
export {};
