import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
import { ResizeHandleUI, VertexHandleUI, RotationHandleUI, SelectionOutline, CustomAnnotationRenderer, AnnotationSelectionMenuRenderFn, GroupSelectionMenuRenderFn, BoxedAnnotationRenderer } from './types';
import { PdfAnnotationObject } from '@embedpdf/models';
type AnnotationLayerProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    /** The ID of the document that this layer displays annotations for */
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: number;
    /** Customize selection menu across all annotations on this layer */
    selectionMenu?: AnnotationSelectionMenuRenderFn;
    /** Customize group selection menu across all annotations on this layer */
    groupSelectionMenu?: GroupSelectionMenuRenderFn;
    style?: CSSProperties;
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
    /** Custom renderers for specific annotation types (provided by external plugins) */
    annotationRenderers?: BoxedAnnotationRenderer[];
};
export declare function AnnotationLayer({ style, documentId, pageIndex, scale: overrideScale, rotation: overrideRotation, selectionMenu, groupSelectionMenu, resizeUI, vertexUI, rotationUI, selectionOutlineColor, selectionOutline, groupSelectionOutline, customAnnotationRenderer, annotationRenderers, ...props }: AnnotationLayerProps): import("react/jsx-runtime").JSX.Element;
export {};
