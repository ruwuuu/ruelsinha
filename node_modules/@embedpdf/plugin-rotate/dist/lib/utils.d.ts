import { Rotation } from '@embedpdf/models';
/**
 * Returns the 6-tuple transformation matrix for rotation.
 * Rotation is clockwise, origin = top-left (0 0).
 *
 * ── Note on e,f ───────────────────────────────
 * For 0°/180° no translation is needed.
 * For 90°/270° you may want to pass the page
 * height / width so the page stays in positive
 * coordinates.  Keep them 0 and handle layout
 * elsewhere if that's what you do today.
 */
export declare function getRotationMatrix(rotation: Rotation, w: number, h: number): [number, number, number, number, number, number];
/**
 * Returns the CSS matrix transformation string for rotation.
 * Rotation is clockwise, origin = top-left (0 0).
 */
export declare function getRotationMatrixString(rotation: Rotation, w: number, h: number): string;
/**
 * Returns the next rotation.
 */
export declare function getNextRotation(current: Rotation): Rotation;
/**
 * Returns the previous rotation.
 */
export declare function getPreviousRotation(current: Rotation): Rotation;
