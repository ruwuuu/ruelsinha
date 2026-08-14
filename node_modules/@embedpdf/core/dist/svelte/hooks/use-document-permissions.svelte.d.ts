import { PdfPermissionFlag } from '@embedpdf/models';
export interface DocumentPermissions {
    /** Effective permission flags after applying overrides */
    permissions: number;
    /** Raw PDF permission flags (before overrides) */
    pdfPermissions: number;
    /** Check if a specific permission flag is effectively allowed */
    hasPermission: (flag: PdfPermissionFlag) => boolean;
    /** Check if all specified flags are effectively allowed */
    hasAllPermissions: (...flags: PdfPermissionFlag[]) => boolean;
    /** Can print (possibly degraded quality) */
    canPrint: boolean;
    /** Can modify document contents */
    canModifyContents: boolean;
    /** Can copy/extract text and graphics */
    canCopyContents: boolean;
    /** Can add/modify annotations and fill forms */
    canModifyAnnotations: boolean;
    /** Can fill in existing form fields */
    canFillForms: boolean;
    /** Can extract for accessibility */
    canExtractForAccessibility: boolean;
    /** Can assemble document (insert, rotate, delete pages) */
    canAssembleDocument: boolean;
    /** Can print high quality */
    canPrintHighQuality: boolean;
}
/**
 * Hook that provides reactive access to a document's effective permission flags.
 * Applies layered resolution: per-document override → global override → PDF permission.
 *
 * @param getDocumentId Function that returns the document ID
 * @returns An object with reactive permission properties.
 */
export declare function useDocumentPermissions(getDocumentId: () => string): DocumentPermissions;
