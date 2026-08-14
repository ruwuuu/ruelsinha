import { HTMLAttributes } from 'svelte/elements';
import { Snippet } from 'svelte';
type ViewportProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * The ID of the document that this viewport displays
     */
    documentId: string;
    children: Snippet;
    class?: string;
};
declare const Viewport: import('svelte', { with: { "resolution-mode": "import" } }).Component<ViewportProps, {}, "">;
type Viewport = ReturnType<typeof Viewport>;
export default Viewport;
