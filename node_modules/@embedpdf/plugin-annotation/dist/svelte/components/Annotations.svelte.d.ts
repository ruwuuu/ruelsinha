import { PdfAnnotationObject } from '@embedpdf/models';
import { BoxedAnnotationRenderer } from '../context';
import { AnnotationSelectionMenuProps, AnnotationSelectionMenuRenderFn, GroupSelectionMenuProps, GroupSelectionMenuRenderFn, CustomAnnotationRenderer, ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline } from '../types';
import { Snippet } from 'svelte';
interface AnnotationsProps {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: number;
    pageWidth: number;
    pageHeight: number;
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    selectionMenuSnippet?: Snippet<[AnnotationSelectionMenuProps]>;
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    groupSelectionMenuSnippet?: Snippet<[GroupSelectionMenuProps]>;
    resizeUI?: ResizeHandleUI;
    vertexUI?: VertexHandleUI;
    rotationUI?: RotationHandleUI;
    /** @deprecated Use `selectionOutline` instead */
    selectionOutlineColor?: string;
    selectionOutline?: SelectionOutline;
    groupSelectionOutline?: SelectionOutline;
    customAnnotationRenderer?: CustomAnnotationRenderer<PdfAnnotationObject>;
    annotationRenderers?: BoxedAnnotationRenderer[];
}
declare const Annotations: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationsProps, {}, "">;
type Annotations = ReturnType<typeof Annotations>;
export default Annotations;
