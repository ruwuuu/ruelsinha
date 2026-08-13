import { CSSProperties, MouseEvent } from '../../../react/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface FormComboboxProps {
    annotation: TrackedAnnotation<PdfWidgetAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
export declare function FormCombobox({ annotation, isSelected, scale, onClick, style }: FormComboboxProps): import("react/jsx-runtime").JSX.Element;
