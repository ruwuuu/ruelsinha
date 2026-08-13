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
declare const AutoMenuRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type AutoMenuRenderer = ReturnType<typeof AutoMenuRenderer>;
export default AutoMenuRenderer;
