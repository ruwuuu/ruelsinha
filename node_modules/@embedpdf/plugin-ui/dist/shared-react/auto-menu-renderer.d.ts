/**
 * Automatically renders menus when opened
 *
 * This component:
 * 1. Listens to UI plugin state for open menus
 * 2. Looks up anchor elements from the anchor registry
 * 3. Renders menus using the user-provided menu renderer
 */
export interface AutoMenuRendererProps {
    container?: HTMLElement | null;
    documentId: string;
}
export declare function AutoMenuRenderer({ container, documentId }: AutoMenuRendererProps): import("react/jsx-runtime").JSX.Element | null;
