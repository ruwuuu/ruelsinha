import { Position } from '@embedpdf/models';
import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
interface PagePointerProviderProps extends HTMLAttributes<HTMLDivElement> {
    documentId: string;
    pageIndex: number;
    rotation?: number;
    scale?: number;
    children: Snippet;
    class?: string;
    convertEventToPoint?: (event: PointerEvent, element: HTMLElement) => Position;
}
declare const PagePointerProvider: import('svelte', { with: { "resolution-mode": "import" } }).Component<PagePointerProviderProps, {}, "">;
type PagePointerProvider = ReturnType<typeof PagePointerProvider>;
export default PagePointerProvider;
