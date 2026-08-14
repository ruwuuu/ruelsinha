import { PdfPermissionFlag } from '@embedpdf/models';
/**
 * Human-readable permission names for use in configuration.
 */
export type PermissionName = 'print' | 'modifyContents' | 'copyContents' | 'modifyAnnotations' | 'fillForms' | 'extractForAccessibility' | 'assembleDocument' | 'printHighQuality';
/**
 * Map from human-readable names to PdfPermissionFlag values.
 */
export declare const PERMISSION_NAME_TO_FLAG: Record<PermissionName, PdfPermissionFlag>;
/**
 * Permission overrides can use either numeric flags or human-readable string names.
 */
export type PermissionOverrides = Partial<Record<PdfPermissionFlag, boolean> & Record<PermissionName, boolean>>;
/**
 * Configuration for overriding document permissions.
 * Can be applied globally (at PluginRegistry level) or per-document (when opening).
 */
export interface PermissionConfig {
    /**
     * When true (default): use PDF's permissions as the base, then apply overrides.
     * When false: treat document as having all permissions allowed, then apply overrides.
     */
    enforceDocumentPermissions?: boolean;
    /**
     * Explicit per-flag overrides. Supports both numeric flags and string names.
     * - true = force allow (even if PDF denies)
     * - false = force deny (even if PDF allows)
     * - undefined = use base permissions
     *
     * @example
     * // Using string names (recommended)
     * overrides: { print: false, modifyAnnotations: true }
     *
     * @example
     * // Using numeric flags
     * overrides: { [PdfPermissionFlag.Print]: false }
     */
    overrides?: PermissionOverrides;
}
/**
 * All permission flags for iteration when computing effective permissions.
 */
export declare const ALL_PERMISSION_FLAGS: PdfPermissionFlag[];
/**
 * All permission names for iteration.
 */
export declare const ALL_PERMISSION_NAMES: PermissionName[];
/**
 * Map from PdfPermissionFlag to human-readable name.
 */
export declare const PERMISSION_FLAG_TO_NAME: Record<PdfPermissionFlag, PermissionName>;
/**
 * Helper to get the override value for a permission flag, checking both numeric and string keys.
 */
export declare function getPermissionOverride(overrides: PermissionOverrides | undefined, flag: PdfPermissionFlag): boolean | undefined;
