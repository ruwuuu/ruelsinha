import { PreviewState } from '../../lib/index.ts';
interface PreviewRendererProps {
    toolId: string;
    preview: PreviewState;
    scale: number;
}
declare const PreviewRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<PreviewRendererProps, {}, "">;
type PreviewRenderer = ReturnType<typeof PreviewRenderer>;
export default PreviewRenderer;
