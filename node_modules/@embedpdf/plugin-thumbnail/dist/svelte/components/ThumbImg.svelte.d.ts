import { ThumbMeta } from '../../lib/index.ts';
import { HTMLImgAttributes } from 'svelte/elements';
interface Props extends HTMLImgAttributes {
    /**
     * The ID of the document that this thumbnail belongs to
     */
    documentId: string;
    meta: ThumbMeta;
}
declare const ThumbImg: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type ThumbImg = ReturnType<typeof ThumbImg>;
export default ThumbImg;
