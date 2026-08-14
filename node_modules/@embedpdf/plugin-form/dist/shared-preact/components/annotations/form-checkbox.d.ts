import { CSSProperties, MouseEvent } from '../../../preact/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface FormCheckboxProps {
    annotation: TrackedAnnotation<PdfWidgetAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
export declare function FormCheckbox({ annotation, isSelected, scale, onClick, style }: FormCheckboxProps): import("preact").JSX.Element;
