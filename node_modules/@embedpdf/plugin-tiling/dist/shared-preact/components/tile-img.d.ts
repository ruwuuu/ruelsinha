import { Tile } from '../../lib/index.ts';
interface TileImgProps {
    documentId: string;
    pageIndex: number;
    tile: Tile;
    dpr: number;
    scale: number;
}
export declare function TileImg({ documentId, pageIndex, tile, dpr, scale }: TileImgProps): import("preact").JSX.Element | null;
export {};
