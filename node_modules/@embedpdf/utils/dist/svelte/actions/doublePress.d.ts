export type DoublePressOptions = {
    delay?: number;
    tolerancePx?: number;
    onDouble?: (e: PointerEvent | MouseEvent) => void;
};
export declare function doublePress<T extends Element = Element>(node: T, options?: DoublePressOptions): {
    update(next?: DoublePressOptions): void;
    destroy(): void;
};
