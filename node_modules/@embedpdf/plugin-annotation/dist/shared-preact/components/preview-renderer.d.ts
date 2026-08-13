import { PreviewState } from '../../lib/index.ts';
interface Props {
    toolId: string;
    preview: PreviewState;
    scale: number;
}
export declare function PreviewRenderer({ toolId, preview, scale }: Props): import("preact").JSX.Element | null;
export {};
