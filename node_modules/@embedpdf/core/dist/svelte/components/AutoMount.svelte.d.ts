import { PluginBatchRegistration, IPlugin } from '../../lib/index.ts';
import { Snippet } from 'svelte';
type Props = {
    plugins: PluginBatchRegistration<IPlugin<any>, any>[];
    children: Snippet;
};
declare const AutoMount: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type AutoMount = ReturnType<typeof AutoMount>;
export default AutoMount;
