import { PdfAnnotationObject } from '@embedpdf/models';
import { CustomAnnotationRenderer, ResizeHandleUI, AnnotationSelectionMenuRenderFn, GroupSelectionMenuRenderFn, VertexHandleUI, RotationHandleUI, SelectionOutline, BoxedAnnotationRenderer } from './types';
interface AnnotationsProps {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: number;
    pageWidth: number;
    pageHeight: number;
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    resizeUI?: ResizeHandleUI;
    vertexUI?: VertexHandleUI;
    rotationUI?: RotationHandleUI;
    selectionOutlineColor?: string;
    selectionOutline?: SelectionOutline;
    groupSelectionOutline?: SelectionOutline;
    customAnnotationRenderer?: CustomAnnotationRenderer<PdfAnnotationObject>;
    annotationRenderers?: BoxedAnnotationRenderer[];
}
export declare function Annotations(annotationsProps: AnnotationsProps): import("react/jsx-runtime").JSX.Element;
export {};
