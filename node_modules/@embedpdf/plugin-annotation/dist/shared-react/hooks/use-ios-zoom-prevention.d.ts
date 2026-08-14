import { CSSProperties } from '../../react/adapter.ts';
/**
 * Prevents iOS Safari from auto-zooming when a focused input's computed
 * font-size is below 16px. Returns an adjusted font size and optional
 * wrapper style that uses `transform: scale()` to visually match the
 * intended size while keeping the real font at >= 16px.
 *
 * @param computedFontPx - The intended on-screen font size (fontSize * scale)
 * @param active - Whether compensation should apply (e.g. isEditing, or always true for form inputs)
 */
export declare function useIOSZoomPrevention(computedFontPx: number, active: boolean): {
    needsComp: boolean;
    adjustedFontPx: number;
    scaleComp: number;
    wrapperStyle: CSSProperties | undefined;
};
