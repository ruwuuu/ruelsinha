import { DocumentState } from '../../lib/index.ts';
/**
 * Hook that provides reactive access to a specific document's state from the core store.
 *
 * @param documentId The ID of the document to retrieve.
 * @returns The reactive DocumentState object or null if not found.
 */
export declare function useDocumentState(documentId: string | null): DocumentState | null;
