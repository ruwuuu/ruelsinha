import { Snippet } from 'svelte';
import { DocumentState } from '@embedpdf/core';
export interface DocumentContentRenderProps {
    documentState: DocumentState;
    isLoading: boolean;
    isError: boolean;
    isLoaded: boolean;
}
interface DocumentContentProps {
    documentId: string | null;
    children: Snippet<[DocumentContentRenderProps]>;
}
declare const DocumentContent: import('svelte', { with: { "resolution-mode": "import" } }).Component<DocumentContentProps, {}, "">;
type DocumentContent = ReturnType<typeof DocumentContent>;
export default DocumentContent;
