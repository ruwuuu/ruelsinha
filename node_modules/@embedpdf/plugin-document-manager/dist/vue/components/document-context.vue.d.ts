import { DocumentState } from '@embedpdf/core';
export interface TabActions {
    select: (documentId: string) => void;
    close: (documentId: string) => void;
    move: (documentId: string, toIndex: number) => void;
}
export interface DocumentContextRenderProps {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
    actions: TabActions;
}
declare var __VLS_1: {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
    actions: TabActions;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<{}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
