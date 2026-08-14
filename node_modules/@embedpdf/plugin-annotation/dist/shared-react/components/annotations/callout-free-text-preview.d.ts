import { Rect, PdfAnnotationLineEnding, Position } from '@embedpdf/models';
interface CalloutFreeTextPreviewProps {
    calloutLine?: Position[];
    textBox?: Rect;
    bounds: Rect;
    scale: number;
    strokeColor?: string;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    opacity?: number;
    lineEnding?: PdfAnnotationLineEnding;
}
export declare function CalloutFreeTextPreview({ calloutLine, textBox, bounds, scale, strokeColor, strokeWidth, color, backgroundColor, opacity, lineEnding, }: CalloutFreeTextPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
