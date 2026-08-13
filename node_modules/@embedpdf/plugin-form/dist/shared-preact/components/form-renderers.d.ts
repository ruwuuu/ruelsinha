import { PdfStandardFont, Rect } from '@embedpdf/models';
import { BoxedAnnotationRenderer } from '../../preact/annotation.ts';
export interface WidgetPreviewData {
    rect: Rect;
    fontFamily?: PdfStandardFont;
    fontSize?: number;
    fontColor?: string;
}
export declare const formRenderers: BoxedAnnotationRenderer[];
