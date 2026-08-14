import { ToolbarSchema, MenuSchema, ResponsiveMetadata, ResponsiveItemMetadata, SelectionMenuSchema } from '../types';
/**
 * Processes responsive configuration and returns metadata for all items
 * This is framework-agnostic and lives in plugin-ui
 */
export declare function resolveResponsiveMetadata(schema: ToolbarSchema | MenuSchema | SelectionMenuSchema, currentLocale?: string): ResponsiveMetadata | null;
/**
 * Get responsive metadata for a specific item
 */
export declare function getItemResponsiveMetadata(itemId: string, schema: ToolbarSchema | MenuSchema, currentLocale?: string): ResponsiveItemMetadata | null;
