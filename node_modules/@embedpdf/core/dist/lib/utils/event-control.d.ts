export type EventHandler<T> = (data: T) => void;
export interface BaseEventControlOptions {
    wait: number;
}
export interface DebounceOptions extends BaseEventControlOptions {
    mode: 'debounce';
}
export interface ThrottleOptions extends BaseEventControlOptions {
    mode: 'throttle';
    throttleMode?: 'leading-trailing' | 'trailing';
}
export interface KeyedDebounceOptions<T> extends BaseEventControlOptions {
    mode: 'debounce';
    keyExtractor: (data: T) => string | number;
}
export interface KeyedThrottleOptions<T> extends BaseEventControlOptions {
    mode: 'throttle';
    throttleMode?: 'leading-trailing' | 'trailing';
    keyExtractor: (data: T) => string | number;
}
export type EventControlOptions<T = any> = DebounceOptions | ThrottleOptions | KeyedDebounceOptions<T> | KeyedThrottleOptions<T>;
export declare class EventControl<T> {
    private handler;
    private options;
    private timeoutId?;
    private lastRun;
    constructor(handler: EventHandler<T>, options: DebounceOptions | ThrottleOptions);
    handle: (data: T) => void;
    private debounce;
    private throttle;
    destroy(): void;
}
/**
 * Event control with independent debouncing/throttling per key.
 * Useful when events carry a discriminator (like documentId) and
 * you want to debounce/throttle each key's events independently.
 *
 * @example
 * // Debounce viewport resize events independently per document
 * const control = new KeyedEventControl(
 *   (event) => recalcZoom(event.documentId),
 *   { mode: 'debounce', wait: 150, keyExtractor: (e) => e.documentId }
 * );
 * control.handle(event); // Each documentId gets its own 150ms debounce
 */
export declare class KeyedEventControl<T> {
    private handler;
    private options;
    private controls;
    private readonly baseOptions;
    constructor(handler: EventHandler<T>, options: KeyedDebounceOptions<T> | KeyedThrottleOptions<T>);
    handle: (data: T) => void;
    destroy(): void;
}
/**
 * Type guard to check if options are keyed
 */
export declare function isKeyedOptions<T>(options: EventControlOptions<T>): options is KeyedDebounceOptions<T> | KeyedThrottleOptions<T>;
