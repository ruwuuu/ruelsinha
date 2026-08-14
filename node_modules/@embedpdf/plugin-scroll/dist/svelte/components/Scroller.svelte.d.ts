import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
import { PageLayout } from '../../lib/index.ts';
type ScrollerProps = HTMLAttributes<HTMLDivElement> & {
    documentId: string;
    renderPage: Snippet<[PageLayout]>;
};
declare const Scroller: import('svelte', { with: { "resolution-mode": "import" } }).Component<ScrollerProps, {}, "">;
type Scroller = ReturnType<typeof Scroller>;
export default Scroller;
