import { CSSProperties, MouseEvent } from '../../../preact/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface FormRadioButtonProps {
    annotation: TrackedAnnotation<PdfWidgetAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
export declare function FormRadioButton({ annotation, isSelected, scale, onClick, style, }: FormRadioButtonProps): import("preact").JSX.Element;
