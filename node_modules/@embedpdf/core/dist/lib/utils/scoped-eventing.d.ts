import { EventHook } from './eventing';
/**
 * A scoped behavior emitter that maintains separate cached values
 * and listener sets per scope key.
 *
 * @typeParam TData - The scoped data type (without key context)
 * @typeParam TGlobalEvent - The global event type (includes key context)
 * @typeParam TKey - The key type (string, number, or both)
 */
export interface ScopedEmitter<TData = any, TGlobalEvent = {
    key: string;
    data: TData;
}, TKey extends string | number = string | number> {
    /**
     * Emit an event for a specific scope key.
     */
    emit(key: TKey, data: TData): void;
    /**
     * Get a scoped event hook that only receives events for this key.
     */
    forScope(key: TKey): EventHook<TData>;
    /**
     * Global event hook that receives events from all scopes.
     */
    readonly onGlobal: EventHook<TGlobalEvent>;
    /**
     * Clear all scopes' caches and listeners
     */
    clear(): void;
    /**
     * Clear a specific scope's cache and listeners
     */
    clearScope(key: TKey): void;
    /**
     * Get the current cached value for a specific scope
     */
    getValue(key: TKey): TData | undefined;
    /**
     * Get all active scope keys
     */
    getScopes(): TKey[];
}
/**
 * Creates a scoped emitter with optional caching behavior.
 *
 * @param toGlobalEvent - Transform function to convert (key, data) into a global event
 * @param options - Configuration options
 * @param options.cache - Whether to cache values per scope (default: true)
 * @param options.equality - Equality function for cached values (default: arePropsEqual)
 *
 * @example
 * ```typescript
 * // With caching (stateful) - default behavior
 * const window$ = createScopedEmitter<WindowState, WindowChangeEvent, string>(
 *   (documentId, window) => ({ documentId, window })
 * );
 *
 * // Without caching (transient events)
 * const refreshPages$ = createScopedEmitter<number[], RefreshPagesEvent, string>(
 *   (documentId, pages) => ({ documentId, pages }),
 *   { cache: false }
 * );
 * ```
 */
export declare function createScopedEmitter<TData = any, TGlobalEvent = {
    key: string;
    data: TData;
}, TKey extends string | number = string | number>(toGlobalEvent: (key: TKey, data: TData) => TGlobalEvent, options?: {
    cache?: boolean;
    equality?: (a: TData, b: TData) => boolean;
}): ScopedEmitter<TData, TGlobalEvent, TKey>;
