import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
type FullscreenProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    children: Snippet;
    class?: string;
    style?: string;
};
declare const FullscreenProvider: import('svelte', { with: { "resolution-mode": "import" } }).Component<FullscreenProviderProps, {}, "">;
type FullscreenProvider = ReturnType<typeof FullscreenProvider>;
export default FullscreenProvider;
