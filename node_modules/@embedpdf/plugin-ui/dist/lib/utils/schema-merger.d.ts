import { UISchema } from '../types';
/**
 * Deep merge UI schemas
 * Allows users to override/extend default schema
 */
export declare function mergeUISchema(base: UISchema, override: Partial<UISchema>): UISchema;
/**
 * Helper to remove items from schema
 */
export declare function removeFromSchema(schema: UISchema, options: {
    toolbars?: string[];
    menus?: string[];
    sidebars?: string[];
    commands?: string[];
}): UISchema;
