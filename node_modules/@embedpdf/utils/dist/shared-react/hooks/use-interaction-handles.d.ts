import { PointerEvent, CSSProperties } from '../../react/adapter.ts';
import { UseDragResizeOptions } from './use-drag-resize';
import { ResizeUI, VertexUI, RotationUI } from '../plugin-interaction-primitives/utils';
export type HandleElementProps = {
    key?: string | number;
    style: CSSProperties;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    onPointerCancel: (e: PointerEvent) => void;
} & Record<string, any>;
export type RotationHandleProps = {
    /** Props for the rotation handle element */
    handle: HandleElementProps;
    /** Props for the connector line element (if shown) */
    connector: {
        style: CSSProperties;
    } & Record<string, any>;
};
export declare function useInteractionHandles(opts: {
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
    dragProps: {
        onPointerDown: (e: PointerEvent) => void;
        onPointerMove: (e: PointerEvent) => void;
        onPointerUp: (e: PointerEvent) => void;
        onPointerCancel: (e: PointerEvent) => void;
        onLostPointerCapture: (e: PointerEvent) => void;
    } | {
        onPointerDown?: undefined;
        onPointerMove?: undefined;
        onPointerUp?: undefined;
        onPointerCancel?: undefined;
        onLostPointerCapture?: undefined;
    };
    resize: HandleElementProps[];
    vertices: HandleElementProps[];
    rotation: RotationHandleProps | null;
};
