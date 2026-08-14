import { CSSProperties, MouseEvent } from '../../../preact/adapter.ts';
import { PdfRedactAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface RedactAreaProps {
    annotation: TrackedAnnotation<PdfRedactAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
/**
 * Renders an area-based redact annotation (marquee redaction).
 * Default: shows strokeColor (C) border only, no fill.
 * Hovered: shows redaction preview with color (IC) as background fill + overlayText.
 * Selected: no border (AnnotationContainer handles selection styling).
 */
export declare function RedactArea({ annotation, isSelected, scale, onClick, style }: RedactAreaProps): import("preact").JSX.Element;
