import { PdfWidgetAnnoField, PdfWidgetAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../react/annotation.ts';
export declare function useFormWidgetState(props: AnnotationRendererProps<PdfWidgetAnnoObject>): {
    annotation: PdfWidgetAnnoObject;
    field: PdfWidgetAnnoField;
    scale: number;
    pageIndex: number;
    scope: import('..').FormScope | undefined;
    handleChangeField: (newField: PdfWidgetAnnoField) => void;
    renderKey: number;
    isReadOnly: boolean;
};
