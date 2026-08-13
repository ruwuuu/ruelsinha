import { Component } from 'vue';
import { BaseComponentProps, UIRenderers } from './types';
/**
 * UIProvider Props
 */
interface Props {
    /**
     * Document ID for this UI context
     * Required for menu rendering
     */
    documentId: string;
    /**
     * Custom component registry
     * Maps component IDs to components
     */
    components?: Record<string, Component<BaseComponentProps>>;
    /**
     * REQUIRED: User-provided renderers
     * These define how toolbars, panels, and menus are displayed
     */
    renderers: UIRenderers;
    /**
     * Optional: Container for menu portal
     * Defaults to document.body
     */
    menuContainer?: HTMLElement | null;
}
declare var __VLS_8: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_8) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{}>, {
    components: Record<string, Component<BaseComponentProps>>;
    menuContainer: HTMLElement | null;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
