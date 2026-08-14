import { Rotation } from '@embedpdf/models';
import { RedactionSelectionMenuRenderFn } from './types';
interface RedactionLayerProps {
    /** The ID of the document this layer belongs to */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Current render scale for this page */
    scale?: number;
    /** Page rotation (for counter-rotating menus, etc.) */
    rotation?: Rotation;
    /** Optional bbox stroke color */
    bboxStroke?: string;
    /** Optional menu renderer for a selected redaction */
    selectionMenu?: RedactionSelectionMenuRenderFn;
}
declare var __VLS_8: {
    context: import('./types').RedactionSelectionContext;
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
    placement: import('@embedpdf/utils').SelectionMenuPlacement;
    menuWrapperProps: {
        style: import('vue').CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
};
type __VLS_Slots = {} & {
    'selection-menu'?: (props: typeof __VLS_8) => any;
};
declare const __VLS_base: import('vue').DefineComponent<RedactionLayerProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<RedactionLayerProps> & Readonly<{}>, {
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
