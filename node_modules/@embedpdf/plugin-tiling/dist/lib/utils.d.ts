import { CalculateTilesForPageOptions, Tile } from './types';
/**
 * Build a grid where neighbouring tiles overlap by `overlapPx`
 * (screen pixels). Inner tiles keep the full `tileSize`, edge
 * tiles are clipped to the page bounds. All screen-space values
 * are rounded to **integers** to avoid sub-pixel seams.
 */
export declare function calculateTilesForPage({ tileSize, overlapPx, extraRings, scale, rotation, page, metric, }: CalculateTilesForPageOptions): Tile[];
