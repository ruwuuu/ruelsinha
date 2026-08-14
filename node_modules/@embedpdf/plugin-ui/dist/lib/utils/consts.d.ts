/**
 * Using 'embedpdf' prefix to avoid conflicts with other libraries.
 */
export declare const UI_ATTRIBUTES: {
    /** Root element marker */
    readonly ROOT: "data-epdf";
    /** Style element marker for deduplication */
    readonly STYLES: "data-epdf-s";
    /** Item ID for responsive and dependency rules */
    readonly ITEM: "data-epdf-i";
    /** Item categories for category-based hiding */
    readonly CATEGORIES: "data-epdf-cat";
    /** Disabled categories list on root element */
    readonly DISABLED_CATEGORIES: "data-epdf-dis";
    /** Hidden item IDs (computed from disabled categories) */
    readonly HIDDEN_ITEMS: "data-epdf-hid";
};
/**
 * CSS selectors derived from attributes
 */
export declare const UI_SELECTORS: {
    readonly ROOT: "[data-epdf]";
    readonly STYLES: "[data-epdf-s]";
    readonly ITEM: (id: string) => string;
    readonly CATEGORIES: (category: string) => string;
    readonly DISABLED_CATEGORY: (category: string) => string;
    readonly HIDDEN_ITEM: (itemId: string) => string;
};
