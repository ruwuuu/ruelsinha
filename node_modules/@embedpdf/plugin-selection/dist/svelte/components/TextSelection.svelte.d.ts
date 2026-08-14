import { Snippet } from 'svelte';
import { Rotation } from '@embedpdf/models';
import { SelectionSelectionMenuRenderFn, SelectionSelectionMenuProps } from '../types';
interface TextSelectionProps {
    /** Document ID */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Scale of the page (optional, defaults to document scale) */
    scale?: number;
    /** Rotation of the page (optional, defaults to document rotation) */
    rotation?: Rotation;
    /** Background color for text selection highlights. Default: 'rgba(33,150,243)' */
    background?: string;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: SelectionSelectionMenuRenderFn;
    /** Snippet for custom selection menu (slot-based approach) */
    selectionMenuSnippet?: Snippet<[SelectionSelectionMenuProps]>;
}
declare const TextSelection: import('svelte', { with: { "resolution-mode": "import" } }).Component<TextSelectionProps, {}, "">;
type TextSelection = ReturnType<typeof TextSelection>;
export default TextSelection;
