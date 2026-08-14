import { Tile } from '../../index.ts';
interface TileImgProps {
    documentId: string;
    pageIndex: number;
    tile: Tile;
    dpr: number;
    scale: number;
}
export declare function TileImg({ documentId, pageIndex, tile, dpr, scale }: TileImgProps): import("react/jsx-runtime").JSX.Element | null;
export {};
