import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
interface GlobalPointerProviderProps extends HTMLAttributes<HTMLDivElement> {
    documentId: string;
    children: Snippet;
    class?: string;
}
declare const GlobalPointerProvider: import('svelte', { with: { "resolution-mode": "import" } }).Component<GlobalPointerProviderProps, {}, "">;
type GlobalPointerProvider = ReturnType<typeof GlobalPointerProvider>;
export default GlobalPointerProvider;
