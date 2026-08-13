import { AnnotationSelectionMenuRenderFn, GroupSelectionMenuRenderFn, ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline } from '../types';
import { BoxedAnnotationRenderer } from '../context';
type __VLS_Props = {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: number;
    pageWidth: number;
    pageHeight: number;
    resizeUi?: ResizeHandleUI;
    vertexUi?: VertexHandleUI;
    rotationUi?: RotationHandleUI;
    selectionOutlineColor?: string;
    selectionOutline?: SelectionOutline;
    groupSelectionOutline?: SelectionOutline;
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    annotationRenderers?: BoxedAnnotationRenderer[];
};
declare var __VLS_14: {
    context: import('..').AnnotationSelectionContext;
    selected: boolean;
    rect: {
        origin: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
    };
    placement: import('@embedpdf/utils').SelectionMenuPlacement;
    menuWrapperProps: {
        style: import('vue').CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
}, __VLS_17: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: import('vue').CSSProperties;
}, __VLS_20: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: import('vue').CSSProperties;
}, __VLS_23: {
    [key: string]: any;
    key?: string | number;
    style: import('vue').CSSProperties;
    backgroundColor: string;
    iconColor: string;
    connectorStyle: import('vue').CSSProperties;
    showConnector: boolean;
    opacity: number;
    border: import('..').RotationHandleBorder;
} | {
    [x: string]: never;
}, __VLS_32: any, __VLS_35: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: import('vue').CSSProperties;
}, __VLS_38: {
    [key: string]: any;
    key?: string | number;
    style: import('vue').CSSProperties;
    backgroundColor: string;
    iconColor: string;
    connectorStyle: import('vue').CSSProperties;
    showConnector: boolean;
    opacity: number;
    border: import('..').RotationHandleBorder;
} | {
    [x: string]: never;
};
type __VLS_Slots = {} & {
    'selection-menu'?: (props: typeof __VLS_14) => any;
} & {
    'resize-handle'?: (props: typeof __VLS_17) => any;
} & {
    'vertex-handle'?: (props: typeof __VLS_20) => any;
} & {
    'rotation-handle'?: (props: typeof __VLS_23) => any;
} & {
    'group-selection-menu'?: (props: typeof __VLS_32) => any;
} & {
    'resize-handle'?: (props: typeof __VLS_35) => any;
} & {
    'rotation-handle'?: (props: typeof __VLS_38) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
