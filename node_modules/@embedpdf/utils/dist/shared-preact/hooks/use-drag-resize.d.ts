import { PointerEvent } from '../../preact/adapter.ts';
import { DragResizeConfig, InteractionEvent, ResizeHandle } from '../plugin-interaction-primitives';
export interface UseDragResizeOptions extends DragResizeConfig {
    onUpdate?: (event: InteractionEvent) => void;
    enabled?: boolean;
}
export interface ResizeHandleEventProps {
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    onPointerCancel: (e: PointerEvent) => void;
    onLostPointerCapture?: (e: PointerEvent) => void;
}
export declare function useDragResize(options: UseDragResizeOptions): {
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
    createResizeProps: (handle: ResizeHandle) => ResizeHandleEventProps;
    createVertexProps: (vertexIndex: number) => ResizeHandleEventProps;
    createRotationProps: (initialRotation?: number, orbitRadiusPx?: number) => ResizeHandleEventProps;
};
