/**
 * Automatically renders menus when opened
 *
 * This component:
 * 1. Listens to UI plugin state for open menus
 * 2. Looks up anchor elements from the anchor registry
 * 3. Renders menus using the user-provided menu renderer
 */
interface Props {
    documentId: string;
    container?: HTMLElement | null;
}
declare const __VLS_export: import('vue').DefineComponent<Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
