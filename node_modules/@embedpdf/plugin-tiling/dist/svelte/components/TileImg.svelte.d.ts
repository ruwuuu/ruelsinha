import { Tile } from '../../lib/index.ts';
interface TileImgProps {
    documentId: string;
    pageIndex: number;
    tile: Tile;
    dpr: number;
    scale: number;
}
declare const TileImg: import('svelte', { with: { "resolution-mode": "import" } }).Component<TileImgProps, {}, "">;
type TileImg = ReturnType<typeof TileImg>;
export default TileImg;
