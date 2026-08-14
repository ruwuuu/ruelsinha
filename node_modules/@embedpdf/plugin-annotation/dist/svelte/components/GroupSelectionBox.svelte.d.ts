import { TrackedAnnotation } from '../../lib/index.ts';
import { GroupSelectionMenuProps, GroupSelectionMenuRenderFn, ResizeHandleUI, RotationHandleUI, SelectionOutline } from '../types';
import { Snippet } from 'svelte';
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
    /** Snippet for custom group selection menu (slot-based approach) */
    groupSelectionMenuSnippet?: Snippet<[GroupSelectionMenuProps]>;
}
declare const GroupSelectionBox: import('svelte', { with: { "resolution-mode": "import" } }).Component<GroupSelectionBoxProps, {}, "">;
type GroupSelectionBox = ReturnType<typeof GroupSelectionBox>;
export default GroupSelectionBox;
