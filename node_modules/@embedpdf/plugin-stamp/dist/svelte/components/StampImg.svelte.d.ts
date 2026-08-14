import { HTMLImgAttributes } from 'svelte/elements';
interface Props extends HTMLImgAttributes {
    libraryId: string;
    pageIndex: number;
    width: number;
    dpr?: number;
}
declare const StampImg: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type StampImg = ReturnType<typeof StampImg>;
export default StampImg;
