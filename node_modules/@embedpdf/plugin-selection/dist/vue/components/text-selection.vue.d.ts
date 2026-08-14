import { Rotation } from '@embedpdf/models';
import { SelectionSelectionContext, SelectionSelectionMenuRenderFn } from '../types';
interface TextSelectionProps {
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: Rotation;
    /** Background color for text selection highlights. Default: 'rgba(33,150,243)' */
    background?: string;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: SelectionSelectionMenuRenderFn;
}
declare var __VLS_13: {
    context: SelectionSelectionContext;
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
    placement: {
        suggestTop: boolean;
        spaceAbove: number;
        spaceBelow: number;
    };
    menuWrapperProps: {
        style: import('vue').CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
};
type __VLS_Slots = {} & {
    'selection-menu'?: (props: typeof __VLS_13) => any;
};
declare const __VLS_base: import('vue').DefineComponent<TextSelectionProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<TextSelectionProps> & Readonly<{}>, {
    rotation: Rotation;
    background: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
