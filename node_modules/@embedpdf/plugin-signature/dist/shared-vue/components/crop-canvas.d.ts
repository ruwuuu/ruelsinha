export interface CropResult {
    canvas: HTMLCanvasElement;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * Scans a canvas for non-transparent pixels and returns a tightly cropped copy.
 * Returns null if the canvas has no visible content.
 */
export declare function cropCanvas(source: HTMLCanvasElement, padding?: number): CropResult | null;
