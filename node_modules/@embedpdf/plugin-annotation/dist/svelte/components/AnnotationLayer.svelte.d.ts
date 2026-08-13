import { PdfAnnotationObject } from '@embedpdf/models';
import { HTMLAttributes } from 'svelte/elements';
import { AnnotationSelectionMenuProps, AnnotationSelectionMenuRenderFn, GroupSelectionMenuProps, GroupSelectionMenuRenderFn, CustomAnnotationRenderer, ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline } from '../types';
import { BoxedAnnotationRenderer } from '../context';
import { Snippet } from 'svelte';
type AnnotationLayerProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    /** The ID of the document that this layer displays annotations for */
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: number;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    /** Snippet for custom selection menu (slot-based approach) */
    selectionMenuSnippet?: Snippet<[AnnotationSelectionMenuProps]>;
    /** Render function for group selection menu (schema-driven approach) */
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    /** Snippet for custom group selection menu (slot-based approach) */
    groupSelectionMenuSnippet?: Snippet<[GroupSelectionMenuProps]>;
    style?: Record<string, string | number | undefined>;
    /** Customize resize handles */
    resizeUI?: ResizeHandleUI;
    /** Customize vertex handles */
    vertexUI?: VertexHandleUI;
    /** Customize rotation handle */
    rotationUI?: RotationHandleUI;
    /** @deprecated Use `selectionOutline` instead */
    selectionOutlineColor?: string;
    /** Customize the selection outline for individual annotations */
    selectionOutline?: SelectionOutline;
    /** Customize the selection outline for the group selection box (falls back to selectionOutline) */
    groupSelectionOutline?: SelectionOutline;
    /** Customize annotation renderer */
    customAnnotationRenderer?: CustomAnnotationRenderer<PdfAnnotationObject>;
    /** Custom annotation renderers from props */
    annotationRenderers?: BoxedAnnotationRenderer[];
};
declare const AnnotationLayer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationLayerProps, {}, "">;
type AnnotationLayer = ReturnType<typeof AnnotationLayer>;
export default AnnotationLayer;
