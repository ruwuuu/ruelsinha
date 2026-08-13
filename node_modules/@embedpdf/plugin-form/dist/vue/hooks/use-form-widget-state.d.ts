import { PdfWidgetAnnoField, PdfWidgetAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '@embedpdf/plugin-annotation/vue';
export declare function useFormWidgetState(props: AnnotationRendererProps<PdfWidgetAnnoObject>): {
    annotation: import('vue').ComputedRef<PdfWidgetAnnoObject>;
    field: import('vue').ComputedRef<PdfWidgetAnnoField>;
    scale: import('vue').ComputedRef<number>;
    pageIndex: import('vue').ComputedRef<number>;
    scope: import('vue').ComputedRef<import('../../lib/index.ts').FormScope | null>;
    handleChangeField: (newField: PdfWidgetAnnoField) => void;
    renderKey: import('vue').Ref<number, number>;
    isReadOnly: import('vue').ComputedRef<boolean>;
};
