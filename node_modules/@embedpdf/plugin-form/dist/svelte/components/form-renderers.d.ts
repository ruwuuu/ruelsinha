import { Rect, PdfStandardFont } from '@embedpdf/models';
import { BoxedAnnotationRenderer } from '@embedpdf/plugin-annotation/svelte';
export interface WidgetPreviewData {
    rect: Rect;
    fontFamily?: PdfStandardFont;
    fontSize?: number;
    fontColor?: string;
}
export declare const formRenderers: BoxedAnnotationRenderer[];
