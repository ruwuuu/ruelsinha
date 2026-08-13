import { Rotation } from '@embedpdf/models';
import { SelectionMenuPlacement } from '@embedpdf/utils/vue';
import { RedactionSelectionContext, RedactionSelectionMenuRenderFn } from './types';
interface PendingRedactionsProps {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: Rotation;
    bboxStroke?: string;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: RedactionSelectionMenuRenderFn;
}
declare var __VLS_13: {
    context: RedactionSelectionContext;
    selected: boolean;
    rect: {
        origin: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
    };
    placement: SelectionMenuPlacement;
    menuWrapperProps: {
        style: import('vue').CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
}, __VLS_32: {
    context: RedactionSelectionContext;
    selected: boolean;
    rect: {
        origin: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
    };
    placement: SelectionMenuPlacement;
    menuWrapperProps: {
        style: import('vue').CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
};
type __VLS_Slots = {} & {
    'selection-menu'?: (props: typeof __VLS_13) => any;
} & {
    'selection-menu'?: (props: typeof __VLS_32) => any;
};
declare const __VLS_base: import('vue').DefineComponent<PendingRedactionsProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<PendingRedactionsProps> & Readonly<{}>, {
    rotation: Rotation;
    bboxStroke: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
