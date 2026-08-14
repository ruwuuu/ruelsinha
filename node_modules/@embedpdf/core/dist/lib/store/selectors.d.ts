import { PdfPermissionFlag } from '@embedpdf/models';
import { CoreState, DocumentState } from './initial-state';
/**
 * Get the active document state
 */
export declare const getActiveDocumentState: (state: CoreState) => DocumentState | null;
/**
 * Get document state by ID
 */
export declare const getDocumentState: (state: CoreState, documentId: string) => DocumentState | null;
/**
 * Get all document IDs
 */
export declare const getDocumentIds: (state: CoreState) => string[];
/**
 * Check if a document is loaded
 */
export declare const isDocumentLoaded: (state: CoreState, documentId: string) => boolean;
/**
 * Get the number of open documents
 */
export declare const getDocumentCount: (state: CoreState) => number;
/**
 * Check if a specific permission flag is effectively allowed for a document.
 * Applies layered resolution: per-document override → global override → enforceDocumentPermissions → PDF permission.
 *
 * @param state - The core state
 * @param documentId - The document ID to check permissions for
 * @param flag - The permission flag to check
 * @returns true if the permission is allowed, false otherwise
 */
export declare function getEffectivePermission(state: CoreState, documentId: string, flag: PdfPermissionFlag): boolean;
/**
 * Get all effective permissions as a bitmask for a document.
 * Combines all individual permission checks into a single bitmask.
 *
 * @param state - The core state
 * @param documentId - The document ID to get permissions for
 * @returns A bitmask of all effective permissions
 */
export declare function getEffectivePermissions(state: CoreState, documentId: string): number;
