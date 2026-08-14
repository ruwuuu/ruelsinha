/**
 * Anchor Registry
 *
 * Tracks DOM elements for menu positioning.
 * Each anchor is scoped by documentId and itemId.
 */
export interface AnchorRegistry {
    register(documentId: string, itemId: string, element: HTMLElement): void;
    unregister(documentId: string, itemId: string): void;
    getAnchor(documentId: string, itemId: string): HTMLElement | null;
}
export declare function createAnchorRegistry(): AnchorRegistry;
export declare function provideAnchorRegistry(): AnchorRegistry;
export declare function useAnchorRegistry(): AnchorRegistry;
