import { HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
import { ThumbMeta } from '../../lib/index.ts';
type ThumbnailImgProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
    /**
     * The ID of the document that this thumbnail belongs to
     */
    documentId: string;
    style?: CSSProperties;
    meta: ThumbMeta;
};
export declare function ThumbImg({ documentId, meta, style, ...props }: ThumbnailImgProps): import("preact").JSX.Element | null;
export {};
