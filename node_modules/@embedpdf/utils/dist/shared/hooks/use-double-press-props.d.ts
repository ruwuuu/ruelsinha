import { dblClickProp, PointerEvent } from '../../react/adapter.ts';
type DoublePressOptions = {
    delay?: number;
    tolerancePx?: number;
};
type DoubleHandler<T extends Element> = ((e: PointerEvent<T> | MouseEvent) => void) | undefined;
type DoubleProps<K extends string> = Partial<Record<K, (e: any) => void>> & {
    onPointerUp?: (e: any) => void;
};
export declare function useDoublePressProps<T extends Element = Element, K extends string = typeof dblClickProp>(onDouble?: DoubleHandler<T>, { delay, tolerancePx }?: DoublePressOptions): DoubleProps<K>;
export {};
