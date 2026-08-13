import { PreviewState } from '../../index.ts';
interface Props {
    toolId: string;
    preview: PreviewState;
    scale: number;
}
export declare function PreviewRenderer({ toolId, preview, scale }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
