import { PdfStandardFont, Rect } from '@embedpdf/models';
import { BoxedAnnotationRenderer } from '../../react/annotation.ts';
export interface WidgetPreviewData {
    rect: Rect;
    fontFamily?: PdfStandardFont;
    fontSize?: number;
    fontColor?: string;
}
export declare const formRenderers: BoxedAnnotationRenderer[];
