import { CoreState } from './initial-state';
/**
 * Calculate the next active document when closing a document.
 * Returns the document to activate, or null if no documents remain.
 */
export declare function calculateNextActiveDocument(state: CoreState, closingDocumentId: string, explicitNext?: string | null): string | null;
/**
 * Reorder a document within the documentOrder array.
 * Returns the new order, or null if the operation is invalid.
 */
export declare function moveDocumentInOrder(currentOrder: string[], documentId: string, toIndex: number): string[] | null;
