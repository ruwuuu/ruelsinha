import { DragResizeConfig, InteractionEvent, ResizeHandle } from '../../shared-svelte/plugin-interaction-primitives';
export interface UseDragResizeOptions extends DragResizeConfig {
    onUpdate?: (event: InteractionEvent) => void;
    enabled?: boolean;
}
export interface ResizeHandleEventProps {
    onpointerdown: (e: PointerEvent) => void;
    onpointermove: (e: PointerEvent) => void;
    onpointerup: (e: PointerEvent) => void;
    onpointercancel: (e: PointerEvent) => void;
}
export declare function useDragResize(getOptions: () => UseDragResizeOptions): {
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
    createResizeProps: (handle: ResizeHandle) => ResizeHandleEventProps;
    createVertexProps: (vertexIndex: number) => ResizeHandleEventProps;
    createRotationProps: (initialRotation?: number, orbitRadiusPx?: number) => ResizeHandleEventProps;
};
