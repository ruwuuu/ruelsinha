import { PdfWidgetAnnoField, PdfWidgetAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../preact/annotation.ts';
export declare function useFormWidgetState(props: AnnotationRendererProps<PdfWidgetAnnoObject>): {
    annotation: PdfWidgetAnnoObject;
    field: PdfWidgetAnnoField;
    scale: number;
    pageIndex: number;
    scope: import('src/preact').FormScope | undefined;
    handleChangeField: (newField: PdfWidgetAnnoField) => void;
    renderKey: number;
    isReadOnly: boolean;
};
