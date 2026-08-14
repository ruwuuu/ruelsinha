import { Snippet } from 'svelte';
import { DocumentState } from '@embedpdf/core';
export interface TabActions {
    select: (documentId: string) => void;
    close: (documentId: string) => void;
    move: (documentId: string, toIndex: number) => void;
}
export interface DocumentContextRenderProps {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
    actions: TabActions;
}
interface DocumentContextProps {
    children: Snippet<[DocumentContextRenderProps]>;
}
declare const DocumentContext: import('svelte', { with: { "resolution-mode": "import" } }).Component<DocumentContextProps, {}, "">;
type DocumentContext = ReturnType<typeof DocumentContext>;
export default DocumentContext;
