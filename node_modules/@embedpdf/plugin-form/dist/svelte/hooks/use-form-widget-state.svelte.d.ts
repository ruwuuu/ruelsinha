import { PdfWidgetAnnoField, PdfWidgetAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '@embedpdf/plugin-annotation/svelte';
export declare function useFormWidgetState(props: AnnotationRendererProps<PdfWidgetAnnoObject>): {
    readonly annotation: PdfWidgetAnnoObject;
    readonly field: PdfWidgetAnnoField;
    readonly scale: number;
    readonly pageIndex: number;
    readonly scope: import('../../lib/index.ts').FormScope | null;
    handleChangeField: (newField: PdfWidgetAnnoField) => void;
    readonly renderKey: number;
    readonly isReadOnly: boolean;
};
