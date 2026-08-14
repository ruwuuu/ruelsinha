import { HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
type StampImgProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
    libraryId: string;
    pageIndex: number;
    width: number;
    dpr?: number;
    style?: CSSProperties;
};
export declare function StampImg({ libraryId, pageIndex, width, dpr, style, ...props }: StampImgProps): import("preact").JSX.Element | null;
export {};
