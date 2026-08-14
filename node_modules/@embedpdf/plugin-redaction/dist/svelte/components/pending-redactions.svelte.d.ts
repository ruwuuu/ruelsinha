import { Snippet } from 'svelte';
import { Rotation } from '@embedpdf/models';
import { RedactionSelectionMenuRenderFn, RedactionSelectionMenuProps } from '../types';
interface Props {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation?: Rotation;
    bboxStroke?: string;
    selectionMenu?: RedactionSelectionMenuRenderFn;
    selectionMenuSnippet?: Snippet<[RedactionSelectionMenuProps]>;
}
declare const PendingRedactions: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type PendingRedactions = ReturnType<typeof PendingRedactions>;
export default PendingRedactions;
