export declare function useIOSZoomPrevention(getComputedFontPx: () => number, getActive: () => boolean): {
    readonly needsComp: boolean;
    readonly adjustedFontPx: number;
    readonly scaleComp: number;
    readonly wrapperStyle: string;
};
