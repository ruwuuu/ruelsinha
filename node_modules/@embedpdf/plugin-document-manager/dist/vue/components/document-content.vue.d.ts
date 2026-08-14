import { MaybeRefOrGetter } from 'vue';
import { DocumentState } from '@embedpdf/core';
export interface DocumentContentRenderProps {
    documentState: DocumentState;
    isLoading: boolean;
    isError: boolean;
    isLoaded: boolean;
}
interface DocumentContentProps {
    documentId: MaybeRefOrGetter<string | null>;
}
declare var __VLS_1: {
    documentState: DocumentState;
    isLoading: boolean;
    isError: boolean;
    isLoaded: boolean;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<DocumentContentProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<DocumentContentProps> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
