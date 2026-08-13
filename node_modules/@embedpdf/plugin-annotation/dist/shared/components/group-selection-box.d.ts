import { TrackedAnnotation } from '../../index.ts';
import { ResizeHandleUI, RotationHandleUI, GroupSelectionMenuRenderFn, SelectionOutline } from './types';
interface GroupSelectionBoxProps {
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
    resizeUI?: ResizeHandleUI;
    /** Rotation handle UI customization */
    rotationUI?: RotationHandleUI;
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
}
/**
 * GroupSelectionBox renders a bounding box around all selected annotations
 * with drag and resize handles for group manipulation.
 */
export declare function GroupSelectionBox({ documentId, pageIndex, scale, rotation, pageWidth, pageHeight, selectedAnnotations, isDraggable, isResizable, isRotatable, lockAspectRatio, resizeUI, rotationUI, selectionOutlineColor, outlineOffset, selectionOutline, zIndex, groupSelectionMenu, }: GroupSelectionBoxProps): JSX.Element | null;
export {};
