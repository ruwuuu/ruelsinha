import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
type TilingLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    documentId: string;
    pageIndex: number;
    scale?: number;
    style?: CSSProperties;
};
export declare function TilingLayer({ documentId, pageIndex, scale: scaleOverride, style, ...props }: TilingLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
