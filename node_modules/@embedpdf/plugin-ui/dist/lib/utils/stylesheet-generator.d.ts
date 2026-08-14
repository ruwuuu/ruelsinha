import { UISchema } from '../types';
export interface StylesheetConfig {
    /** Use container queries (@container) instead of media queries (@media). Default: true */
    useContainerQueries?: boolean;
}
export interface StylesheetGenerationOptions {
    config?: StylesheetConfig;
    /** Current locale for locale-aware responsive rules */
    locale?: string;
}
/**
 * Generates complete CSS stylesheet for UI visibility.
 *
 * Includes:
 * 1. Responsive visibility rules (container queries or media queries)
 * 2. Category visibility rules
 * 3. Breakpoint-aware dependency rules
 *
 * This is pure logic - no DOM manipulation.
 *
 * @param schema - The UI schema to generate CSS for
 * @param options - Generation options including config and locale
 * @returns Generated CSS string
 */
export declare function generateUIStylesheet(schema: UISchema, options?: StylesheetGenerationOptions): string;
/**
 * Extract all unique categories from the schema.
 * Useful for building UI to toggle categories.
 *
 * @param schema - The UI schema to extract categories from
 * @returns Sorted array of unique category names
 */
export declare function extractCategories(schema: UISchema): string[];
/**
 * Extract a map of item ID -> categories from the schema.
 * Used to compute which items are hidden based on disabled categories.
 *
 * @param schema - The UI schema to extract item categories from
 * @returns Map of item ID to array of categories
 */
export declare function extractItemCategories(schema: UISchema): Map<string, string[]>;
/**
 * Compute which items are hidden based on disabled categories.
 * An item is hidden if ANY of its categories is disabled.
 *
 * @param itemCategories - Map of item ID to categories (from extractItemCategories)
 * @param disabledCategories - Array of currently disabled categories
 * @returns Array of hidden item IDs
 */
export declare function computeHiddenItems(itemCategories: Map<string, string[]>, disabledCategories: string[]): string[];
/**
 * Get the stylesheet configuration with defaults applied.
 *
 * @param config - Optional partial configuration
 * @returns Complete configuration with defaults
 */
export declare function getStylesheetConfig(config?: StylesheetConfig): Required<StylesheetConfig>;
