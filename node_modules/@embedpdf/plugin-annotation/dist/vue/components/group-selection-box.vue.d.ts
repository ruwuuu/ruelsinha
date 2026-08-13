import { CSSProperties } from 'vue';
import { SelectionMenuPlacement } from '@embedpdf/utils/vue';
import { TrackedAnnotation } from '../../lib';
import { GroupSelectionContext, GroupSelectionMenuRenderFn, ResizeHandleUI, RotationHandleUI, SelectionOutline } from '../types';
type __VLS_Props = {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: number;
    pageWidth: number;
    pageHeight: number;
    /** All selected annotations on this page */
    selectedAnnotations: TrackedAnnotation[];
    /** Whether the group is draggable (all annotations must be group-draggable) */
    isDraggable: boolean;
    /** Whether the group is resizable (all annotations must be group-resizable) */
    isResizable: boolean;
    /** Whether the group can be rotated */
    isRotatable?: boolean;
    /** Whether to lock aspect ratio during group resize */
    lockAspectRatio?: boolean;
    /** Resize handle UI customization */
    resizeUi?: ResizeHandleUI;
    /** Rotation handle UI customization */
    rotationUi?: RotationHandleUI;
    /** @deprecated Use `selectionOutline.color` instead */
    selectionOutlineColor?: string;
    /** @deprecated Use `selectionOutline.offset` instead */
    outlineOffset?: number;
    /** Customize the selection outline (color, style, width, offset) */
    selectionOutline?: SelectionOutline;
    /** Z-index for the group box */
    zIndex?: number;
    /** Group selection menu render function */
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
};
declare var __VLS_1: {
    [key: string]: any;
    key?: string | number;
    style: CSSProperties;
    backgroundColor: string;
    iconColor: string;
    connectorStyle: CSSProperties;
    showConnector: boolean;
    opacity: number;
    border: import('..').RotationHandleBorder;
} | {
    [x: string]: never;
}, __VLS_3: {
    backgroundColor: string;
    onPointerdown: (e: PointerEvent) => void;
    onPointermove: (e: PointerEvent) => void;
    onPointerup: (e: PointerEvent) => void;
    onPointercancel: (e: PointerEvent) => void;
    key: string | number | undefined;
    style: CSSProperties;
}, __VLS_17: {
    context: GroupSelectionContext;
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
    placement: SelectionMenuPlacement;
    menuWrapperProps: {
        style: CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
};
type __VLS_Slots = {} & {
    'rotation-handle'?: (props: typeof __VLS_1) => any;
} & {
    'resize-handle'?: (props: typeof __VLS_3) => any;
} & {
    'group-selection-menu'?: (props: typeof __VLS_17) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    outlineOffset: number;
    zIndex: number;
    isRotatable: boolean;
    lockAspectRatio: boolean;
    selectionOutlineColor: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
