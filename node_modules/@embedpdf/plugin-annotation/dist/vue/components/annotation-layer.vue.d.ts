import { AnnotationSelectionMenuRenderFn, GroupSelectionMenuRenderFn, ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline } from '../types';
import { BoxedAnnotationRenderer } from '../context';
type __VLS_Props = {
    /** The ID of the document that this layer displays annotations for */
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: number;
    /** Customize resize handles */
    resizeUi?: ResizeHandleUI;
    /** @deprecated Use `resizeUi` (or `:resize-ui` in templates) instead */
    resizeUI?: ResizeHandleUI;
    /** Customize vertex handles */
    vertexUi?: VertexHandleUI;
    /** @deprecated Use `vertexUi` (or `:vertex-ui` in templates) instead */
    vertexUI?: VertexHandleUI;
    /** Customize rotation handle */
    rotationUi?: RotationHandleUI;
    /** @deprecated Use `selectionOutline` instead */
    selectionOutlineColor?: string;
    /** Customize the selection outline for individual annotations */
    selectionOutline?: SelectionOutline;
    /** Customize the selection outline for the group selection box (falls back to selectionOutline) */
    groupSelectionOutline?: SelectionOutline;
    /** Customize selection menu */
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    /** Customize group selection menu */
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    /** Custom renderers for specific annotation types (provided by external plugins) */
    annotationRenderers?: BoxedAnnotationRenderer[];
};
declare var __VLS_8: {
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
}, __VLS_11: any, __VLS_14: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: import('vue').CSSProperties;
}, __VLS_17: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: import('vue').CSSProperties;
}, __VLS_20: {
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
    'selection-menu'?: (props: typeof __VLS_8) => any;
} & {
    'group-selection-menu'?: (props: typeof __VLS_11) => any;
} & {
    'resize-handle'?: (props: typeof __VLS_14) => any;
} & {
    'vertex-handle'?: (props: typeof __VLS_17) => any;
} & {
    'rotation-handle'?: (props: typeof __VLS_20) => any;
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
