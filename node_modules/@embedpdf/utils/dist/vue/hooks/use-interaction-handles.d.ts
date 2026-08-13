import { CSSProperties } from 'vue';
import { UseDragResizeOptions } from './use-drag-resize';
import { ResizeUI, VertexUI, RotationUI } from '../../shared-vue/plugin-interaction-primitives/utils';
import { MaybeRef } from '../utils/interaction-normalize';
export type HandleElementProps = {
    key?: string | number;
    style: CSSProperties;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
} & Record<string, any>;
export type RotationHandleProps = {
    /** Props for the rotation handle element */
    handle: HandleElementProps;
    /** Props for the connector line element (if shown) */
    connector: {
        style: CSSProperties;
    } & Record<string, any>;
};
export interface UseInteractionHandlesOptions {
    controller: UseDragResizeOptions;
    resizeUI?: ResizeUI;
    vertexUI?: VertexUI;
    rotationUI?: RotationUI;
    includeVertices?: boolean;
    includeRotation?: MaybeRef<boolean>;
    /** Current rotation angle of the annotation (for initializing rotation interaction) */
    currentRotation?: MaybeRef<number>;
    handleAttrs?: (h: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w') => Record<string, any> | void;
    vertexAttrs?: (i: number) => Record<string, any> | void;
    rotationAttrs?: () => Record<string, any> | void;
}
export declare function useInteractionHandles(opts: UseInteractionHandlesOptions): {
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
    resize: import('vue').ComputedRef<HandleElementProps[]>;
    vertices: import('vue').ComputedRef<HandleElementProps[]>;
    rotation: import('vue').ComputedRef<RotationHandleProps | null>;
};
