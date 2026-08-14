import { Rect, Rotation } from '@embedpdf/models';
interface CounterTransformResult {
    matrix: string;
    width: number;
    height: number;
}
/**
 * Given an already-placed rect (left/top/width/height in px) and the page rotation,
 * return the counter-rotation matrix + adjusted width/height.
 *
 * transform-origin is expected to be "0 0".
 * left/top DO NOT change, apply them as-is.
 */
export declare function getCounterRotation(rect: Rect, rotation: Rotation): CounterTransformResult;
export {};
