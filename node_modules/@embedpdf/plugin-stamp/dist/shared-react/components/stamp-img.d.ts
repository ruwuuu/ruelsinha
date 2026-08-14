import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
type StampImgProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
    libraryId: string;
    pageIndex: number;
    width: number;
    dpr?: number;
    style?: CSSProperties;
};
export declare function StampImg({ libraryId, pageIndex, width, dpr, style, ...props }: StampImgProps): import("react/jsx-runtime").JSX.Element | null;
export {};
