import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
import { PdfAnnotationObject } from '@embedpdf/models';
type RenderAnnotationProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
    documentId: string;
    pageIndex: number;
    annotation: PdfAnnotationObject;
    scaleFactor?: number;
    dpr?: number;
    style?: CSSProperties;
    unrotated?: boolean;
};
export declare function RenderAnnotation({ documentId, pageIndex, annotation, scaleFactor, unrotated, style, ...props }: RenderAnnotationProps): import("react/jsx-runtime").JSX.Element;
export {};
