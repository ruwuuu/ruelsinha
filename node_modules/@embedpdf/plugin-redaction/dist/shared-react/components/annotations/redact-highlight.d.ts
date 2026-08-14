import { CSSProperties, MouseEvent } from '../../../react/adapter.ts';
import { PdfRedactAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface RedactHighlightProps {
    annotation: TrackedAnnotation<PdfRedactAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
/**
 * Renders a text-based redact annotation using QuadPoints/segmentRects.
 * Default: shows strokeColor (C) border only, no fill.
 * Hovered: shows redaction preview with color (IC) as background fill + overlayText.
 * Selected: no border (AnnotationContainer handles selection styling).
 */
export declare function RedactHighlight({ annotation, isSelected, scale, onClick, style, }: RedactHighlightProps): import("react/jsx-runtime").JSX.Element;
