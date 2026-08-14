import { CSSProperties } from 'vue';
import { Rect, Rotation } from '@embedpdf/models';
interface CounterRotateProps {
    rect: Rect;
    rotation: Rotation;
}
declare var __VLS_1: {
    menuWrapperProps: {
        style: CSSProperties;
        onPointerdown: (e: PointerEvent) => void;
        onTouchstart: (e: TouchEvent) => void;
    };
    matrix: string;
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
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<CounterRotateProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<CounterRotateProps> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
