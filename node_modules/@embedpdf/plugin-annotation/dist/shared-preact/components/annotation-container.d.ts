import { PdfAnnotationObject, AnnotationAppearances, CssBlendMode } from '@embedpdf/models';
import { TrackedAnnotation } from '../../lib/index.ts';
import { JSX, CSSProperties } from '../../preact/adapter.ts';
import { CustomAnnotationRenderer, ResizeHandleUI, AnnotationSelectionMenuRenderFn, AnnotationInteractionEvent, VertexHandleUI, RotationHandleUI, GroupSelectionMenuRenderFn, BoxedAnnotationRenderer, SelectionOutline } from './types';
import { VertexConfig } from '../types';
interface AnnotationContainerProps<T extends PdfAnnotationObject> {
    scale: number;
    documentId: string;
    pageIndex: number;
    rotation: number;
    pageWidth: number;
    pageHeight: number;
    trackedAnnotation: TrackedAnnotation<T>;
    children: JSX.Element | ((annotation: T, options: {
        appearanceActive: boolean;
    }) => JSX.Element);
    isSelected: boolean;
    /** Whether the annotation is in editing mode (e.g., FreeText text editing) */
    isEditing?: boolean;
    /** Whether multiple annotations are selected (container becomes passive) */
    isMultiSelected?: boolean;
    isDraggable: boolean;
    isResizable: boolean;
    isRotatable?: boolean;
    lockAspectRatio?: boolean;
    style?: CSSProperties;
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
    onDoubleClick?: (event: any) => void;
    onSelect: (event: AnnotationInteractionEvent) => void;
    /** Pre-rendered appearance stream images for AP mode rendering */
    appearance?: AnnotationAppearances<Blob> | null;
    /** Blend mode applied only to the visual content (children + AP image), not to interaction handles */
    blendMode?: CssBlendMode;
    zIndex?: number;
    resizeUI?: ResizeHandleUI;
    vertexUI?: VertexHandleUI;
    rotationUI?: RotationHandleUI;
    /** @deprecated Use `selectionOutline.color` instead */
    selectionOutlineColor?: string;
    /** Customize the selection outline (color, style, width, offset) */
    selectionOutline?: SelectionOutline;
    customAnnotationRenderer?: CustomAnnotationRenderer<T>;
    /** Passed from parent but not used - destructured to prevent DOM spread */
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    /** Passed from parent but not used - destructured to prevent DOM spread */
    groupSelectionOutline?: SelectionOutline;
    /** Passed from parent but not used - destructured to prevent DOM spread */
    annotationRenderers?: BoxedAnnotationRenderer[];
}
/**
 * AnnotationContainer wraps individual annotations with interaction handles.
 * When isMultiSelected is true, the container becomes passive - drag/resize
 * is handled by the GroupSelectionBox instead.
 */
export declare function AnnotationContainer<T extends PdfAnnotationObject>({ scale, documentId, pageIndex, rotation, pageWidth, pageHeight, trackedAnnotation, children, isSelected, isEditing, isMultiSelected, isDraggable, isResizable, isRotatable, lockAspectRatio, style, blendMode, vertexConfig, selectionMenu, structurallyLocked, contentLocked, outlineOffset, onDoubleClick, onSelect, appearance, zIndex, resizeUI, vertexUI, rotationUI, selectionOutlineColor, selectionOutline, customAnnotationRenderer, groupSelectionMenu: _groupSelectionMenu, groupSelectionOutline: _groupSelectionOutline, annotationRenderers: _annotationRenderers, ...props }: AnnotationContainerProps<T>): JSX.Element;
export {};
