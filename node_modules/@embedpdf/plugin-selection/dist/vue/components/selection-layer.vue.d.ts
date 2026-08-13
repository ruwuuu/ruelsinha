import { Rotation } from '@embedpdf/models';
import { TextSelectionStyle, MarqueeSelectionStyle } from '../../lib/index.ts';
import { SelectionSelectionMenuRenderFn } from '../types';
interface SelectionLayerProps {
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: Rotation;
    /**
     * @deprecated Use `textStyle.background` instead.
     * Background color for selection rectangles.
     */
    background?: string;
    /** Styling options for text selection highlights */
    textStyle?: TextSelectionStyle;
    /** Styling options for the marquee selection rectangle */
    marqueeStyle?: MarqueeSelectionStyle;
    /** Optional CSS class applied to the marquee rectangle */
    marqueeClassName?: string;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: SelectionSelectionMenuRenderFn;
}
declare var __VLS_8: {
    context: import('..').SelectionSelectionContext;
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
    'selection-menu'?: (props: typeof __VLS_8) => any;
};
declare const __VLS_base: import('vue').DefineComponent<SelectionLayerProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<SelectionLayerProps> & Readonly<{}>, {
    rotation: Rotation;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
