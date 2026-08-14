import { Snippet } from 'svelte';
import { Rotation } from '@embedpdf/models';
import { RedactionSelectionMenuRenderFn, RedactionSelectionMenuProps } from '../types';
interface RedactionLayerProps {
    /** The ID of the document this layer belongs to */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Current render scale for this page */
    scale?: number;
    /** Page rotation (for counter-rotating menus, etc.) */
    rotation?: Rotation;
    /** Render function for selection menu (schema-driven approach) */
    selectionMenu?: RedactionSelectionMenuRenderFn;
    /** Snippet for custom selection menu (slot-based approach) */
    selectionMenuSnippet?: Snippet<[RedactionSelectionMenuProps]>;
}
declare const RedactionLayer: import('svelte', { with: { "resolution-mode": "import" } }).Component<RedactionLayerProps, {}, "">;
type RedactionLayer = ReturnType<typeof RedactionLayer>;
export default RedactionLayer;
