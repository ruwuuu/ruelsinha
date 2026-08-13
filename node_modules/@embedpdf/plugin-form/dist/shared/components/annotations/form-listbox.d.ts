import { CSSProperties, MouseEvent } from '../../../react/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
export interface FormListboxProps {
    annotation: TrackedAnnotation<PdfWidgetAnnoObject>;
    isSelected: boolean;
    scale: number;
    pageIndex: number;
    onClick?: (e: MouseEvent<Element>) => void;
    style?: CSSProperties;
}
export declare function FormListbox({ annotation, isSelected, scale, onClick, style }: FormListboxProps): import("react/jsx-runtime").JSX.Element;
