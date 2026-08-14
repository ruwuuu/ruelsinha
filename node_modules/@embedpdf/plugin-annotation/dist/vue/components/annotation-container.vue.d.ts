import { CSSProperties } from 'vue';
import { PdfAnnotationObject, AnnotationAppearances, CssBlendMode } from '@embedpdf/models';
import { SelectionMenuPlacement } from '@embedpdf/utils/vue';
import { TrackedAnnotation } from '../../lib';
import { VertexConfig } from '../../shared-vue/types';
import { AnnotationSelectionContext, AnnotationSelectionMenuRenderFn, ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline } from '../types';
declare const _default: typeof __VLS_export;
export default _default;
declare const __VLS_export: <T extends PdfAnnotationObject>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<{
        scale: number;
        documentId: string;
        pageIndex: number;
        rotation: number;
        pageWidth: number;
        pageHeight: number;
        trackedAnnotation: TrackedAnnotation<T>;
        isSelected: boolean;
        /** Whether the annotation is in editing mode */
        isEditing?: boolean;
        /** Whether multiple annotations are selected (container becomes passive) */
        isMultiSelected?: boolean;
        isDraggable: boolean;
        isResizable: boolean;
        isRotatable?: boolean;
        lockAspectRatio?: boolean;
        vertexConfig?: VertexConfig<T>;
        selectionMenu?: AnnotationSelectionMenuRenderFn;
        /**
         * Derived: PDF `locked` flag is set OR the annotation is non-interactive.
         * Threaded into the selection menu context so custom menus can disable move/
         * resize/rotate/delete/property-change items without recomputing flags.
         */
        structurallyLocked?: boolean;
        /**
         * Derived: PDF `lockedContents` flag is set OR the annotation is non-interactive.
         * Threaded into the selection menu context so custom menus can disable content
         * edit items without recomputing flags.
         */
        contentLocked?: boolean;
        /** @deprecated Use `selectionOutline.offset` instead */
        outlineOffset?: number;
        onDoubleClick?: (event: PointerEvent | MouseEvent) => void;
        onSelect: (event: PointerEvent | MouseEvent) => void;
        /** Pre-rendered appearance stream images for AP mode rendering */
        appearance?: AnnotationAppearances<Blob> | null;
        zIndex?: number;
        /** @deprecated Use `selectionOutline.color` instead */
        selectionOutlineColor?: string;
        /** Customize the selection outline (color, style, width, offset) */
        selectionOutline?: SelectionOutline;
        /** Customize resize handle appearance */
        resizeUi?: ResizeHandleUI;
        /** Customize vertex handle appearance */
        vertexUi?: VertexHandleUI;
        /** Customize rotation handle appearance */
        rotationUi?: RotationHandleUI;
        blendMode?: CssBlendMode;
        style?: CSSProperties;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        default?: (props: {
            annotation: T;
            appearanceActive: boolean;
        }) => any;
    } & {
        'rotation-handle'?: (props: {
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
        }) => any;
    } & {
        'resize-handle'?: (props: {
            backgroundColor: string;
            onPointerdown: (e: PointerEvent) => void;
            onPointermove: (e: PointerEvent) => void;
            onPointerup: (e: PointerEvent) => void;
            onPointercancel: (e: PointerEvent) => void;
            key: string | number | undefined;
            style: CSSProperties;
        }) => any;
    } & {
        'vertex-handle'?: (props: {
            backgroundColor: string;
            onPointerdown: (e: PointerEvent) => void;
            onPointermove: (e: PointerEvent) => void;
            onPointerup: (e: PointerEvent) => void;
            onPointercancel: (e: PointerEvent) => void;
            key: string | number | undefined;
            style: CSSProperties;
        }) => any;
    } & {
        'selection-menu'?: (props: {
            context: AnnotationSelectionContext;
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
        }) => any;
    };
    emit: {};
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
