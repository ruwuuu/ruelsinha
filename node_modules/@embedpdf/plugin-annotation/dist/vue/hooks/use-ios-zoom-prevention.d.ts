import { CSSProperties, MaybeRefOrGetter } from 'vue';
export declare function useIOSZoomPrevention(computedFontPx: MaybeRefOrGetter<number>, active: MaybeRefOrGetter<boolean>): import('vue').ComputedRef<{
    needsComp: boolean;
    adjustedFontPx: number;
    scaleComp: number;
    wrapperStyle: CSSProperties | undefined;
}>;
