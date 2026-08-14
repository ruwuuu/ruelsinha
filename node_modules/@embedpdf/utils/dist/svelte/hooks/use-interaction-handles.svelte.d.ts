import { UseDragResizeOptions } from './use-drag-resize.svelte';
import { ResizeUI, VertexUI, RotationUI } from '../../shared-svelte/plugin-interaction-primitives';
export type HandleElementProps = {
    key?: string | number;
    style: string;
    onpointerdown: (e: PointerEvent) => void;
    onpointermove: (e: PointerEvent) => void;
    onpointerup: (e: PointerEvent) => void;
    onpointercancel: (e: PointerEvent) => void;
} & Record<string, any>;
export type RotationHandleElementProps = {
    /** Props for the rotation handle element */
    handle: HandleElementProps;
    /** Props for the connector line element (if shown) */
    connector: {
        style: string;
    } & Record<string, any>;
};
export declare function useInteractionHandles(getOpts: () => {
    controller: UseDragResizeOptions;
    resizeUI?: ResizeUI;
    vertexUI?: VertexUI;
    rotationUI?: RotationUI;
    includeVertices?: boolean;
    includeRotation?: boolean;
    /** Current rotation angle of the annotation (for initializing rotation interaction) */
    currentRotation?: number;
    handleAttrs?: (h: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w') => Record<string, any> | void;
    vertexAttrs?: (i: number) => Record<string, any> | void;
    rotationAttrs?: () => Record<string, any> | void;
}): {
    readonly dragProps: {
        onpointerdown: (e: PointerEvent) => void;
        onpointermove: (e: PointerEvent) => void;
        onpointerup: (e: PointerEvent) => void;
        onpointercancel: (e: PointerEvent) => void;
    } | {
        onpointerdown?: undefined;
        onpointermove?: undefined;
        onpointerup?: undefined;
        onpointercancel?: undefined;
    };
    readonly resize: HandleElementProps[];
    readonly vertices: HandleElementProps[];
    readonly rotation: RotationHandleElementProps | null;
};
