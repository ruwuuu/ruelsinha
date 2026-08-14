import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
type Props = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet;
};
declare const Root: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type Root = ReturnType<typeof Root>;
export default Root;
