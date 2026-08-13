import { CSSProperties, MouseEvent } from '../../../preact/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface FormTextFieldProps {
    annotation: TrackedAnnotation<PdfWidgetAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
export declare function FormTextField({ annotation, isSelected, scale, onClick, style, }: FormTextFieldProps): import("preact").JSX.Element;
