import { Action } from '@embedpdf/core';
import { Tile, TileStatus, TilingDocumentState } from './types';
export declare const INIT_TILING_STATE = "TILING/INIT_STATE";
export declare const CLEANUP_TILING_STATE = "TILING/CLEANUP_STATE";
export declare const UPDATE_VISIBLE_TILES = "TILING/UPDATE_VISIBLE_TILES";
export declare const MARK_TILE_STATUS = "TILING/MARK_TILE_STATUS";
export interface InitTilingStateAction extends Action {
    type: typeof INIT_TILING_STATE;
    payload: {
        documentId: string;
        state: TilingDocumentState;
    };
}
export interface CleanupTilingStateAction extends Action {
    type: typeof CLEANUP_TILING_STATE;
    payload: string;
}
export type UpdateVisibleTilesAction = {
    type: typeof UPDATE_VISIBLE_TILES;
    payload: {
        documentId: string;
        tiles: Record<number, Tile[]>;
    };
};
export type MarkTileStatusAction = {
    type: typeof MARK_TILE_STATUS;
    payload: {
        documentId: string;
        pageIndex: number;
        tileId: string;
        status: TileStatus;
    };
};
export type TilingAction = InitTilingStateAction | CleanupTilingStateAction | UpdateVisibleTilesAction | MarkTileStatusAction;
export declare const initTilingState: (documentId: string, state: TilingDocumentState) => InitTilingStateAction;
export declare const cleanupTilingState: (documentId: string) => CleanupTilingStateAction;
export declare const updateVisibleTiles: (documentId: string, tiles: Record<number, Tile[]>) => UpdateVisibleTilesAction;
export declare const markTileStatus: (documentId: string, pageIndex: number, tileId: string, status: TileStatus) => MarkTileStatusAction;
