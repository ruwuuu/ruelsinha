/**
 * Converts Svelte proxy objects to plain JavaScript objects.
 * This is useful when passing data to Web Workers or other contexts
 * that cannot handle Svelte's reactive proxies.
 *
 * Inspired by the Vue implementation, this recursively traverses the object
 * and handles primitives, arrays, and plain objects while stripping reactive proxies.
 */
export declare function deepToRaw<T extends Record<string, any>>(sourceObj: T): T;
