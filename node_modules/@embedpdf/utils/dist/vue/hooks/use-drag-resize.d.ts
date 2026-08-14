import { Position, Rect } from '@embedpdf/models';
import { DragResizeConfig, InteractionEvent, ResizeHandle } from '../../shared-vue/plugin-interaction-primitives';
import { MaybeRef } from '../utils/interaction-normalize';
export interface UseDragResizeOptions {
    element: MaybeRef<Rect>;
    rotationCenter?: MaybeRef<Position | undefined>;
    rotationElement?: MaybeRef<Rect | undefined>;
    vertices?: MaybeRef<Position[]>;
    constraints?: MaybeRef<DragResizeConfig['constraints']>;
    maintainAspectRatio?: MaybeRef<boolean>;
    pageRotation?: MaybeRef<number>;
    annotationRotation?: MaybeRef<number>;
    scale?: MaybeRef<number>;
    onUpdate?: (event: InteractionEvent) => void;
    enabled?: MaybeRef<boolean>;
}
export declare function useDragResize(options: UseDragResizeOptions): {
    dragProps: import('vue').ComputedRef<{
        onPointerdown: (e: PointerEvent) => void;
        onPointermove: (e: PointerEvent) => void | undefined;
        onPointerup: (e: PointerEvent) => void;
        onPointercancel: (e: PointerEvent) => void;
    } | {
        onPointerdown?: undefined;
        onPointermove?: undefined;
        onPointerup?: undefined;
        onPointercancel?: undefined;
    }>;
    createResizeProps: (handle: ResizeHandle) => {
        onPointerdown: (e: PointerEvent) => void;
        onPointermove: (e: PointerEvent) => void | undefined;
        onPointerup: (e: PointerEvent) => void;
        onPointercancel: (e: PointerEvent) => void;
    };
    createVertexProps: (vertexIndex: number) => {
        onPointerdown: (e: PointerEvent) => void;
        onPointermove: (e: PointerEvent) => void | undefined;
        onPointerup: (e: PointerEvent) => void;
        onPointercancel: (e: PointerEvent) => void;
    };
    createRotationProps: (initialRotation?: number, orbitRadiusPx?: number) => {
        onPointerdown: (e: PointerEvent) => void;
        onPointermove: (e: PointerEvent) => void | undefined;
        onPointerup: (e: PointerEvent) => void;
        onPointercancel: (e: PointerEvent) => void;
    };
};
