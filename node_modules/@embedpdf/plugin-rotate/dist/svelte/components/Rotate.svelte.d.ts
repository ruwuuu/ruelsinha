import { Rotation } from '@embedpdf/models';
import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
type RotateProps = HTMLAttributes<HTMLDivElement> & {
    documentId: string;
    pageIndex: number;
    rotation?: Rotation;
    scale?: number;
    children?: Snippet;
    class?: string;
    style?: string;
};
declare const Rotate: import('svelte', { with: { "resolution-mode": "import" } }).Component<RotateProps, {}, "">;
type Rotate = ReturnType<typeof Rotate>;
export default Rotate;
