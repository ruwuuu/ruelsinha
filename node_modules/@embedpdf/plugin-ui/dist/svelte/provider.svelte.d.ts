import { Component, Snippet } from 'svelte';
import { UIComponents, UIRenderers } from './types';
import { HTMLAttributes } from 'svelte/elements';
/**
 * UIProvider Props
 */
type ProviderProps = HTMLAttributes<HTMLDivElement> & {
    children: Snippet;
    /**
     * Document ID for this UI context
     * Required for menu rendering
     */
    documentId: string;
    /**
     * Custom component registry
     * Maps component IDs to components
     */
    components?: UIComponents;
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
    class?: string;
};
declare const Provider: Component<ProviderProps, {}, "">;
type Provider = ReturnType<typeof Provider>;
export default Provider;
