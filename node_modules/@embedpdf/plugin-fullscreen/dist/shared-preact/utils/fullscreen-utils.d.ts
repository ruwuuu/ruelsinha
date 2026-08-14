import { FullscreenRequestEvent } from '../../lib/index.ts';
/**
 * Find the element to fullscreen based on the event and container
 * @param event The fullscreen request event
 * @param containerElement The container element (fallback if no selector or element not found)
 * @param targetSelector Optional target selector from plugin config
 * @returns The element to fullscreen, or null if not found
 */
export declare function findFullscreenElement(event: FullscreenRequestEvent, containerElement: HTMLElement | null, targetSelector?: string): HTMLElement | null;
/**
 * Handle a fullscreen request event
 * @param event The fullscreen request event
 * @param containerElement The container element
 * @param targetSelector Optional target selector from plugin config
 */
export declare function handleFullscreenRequest(event: FullscreenRequestEvent, containerElement: HTMLElement | null, targetSelector?: string): Promise<void>;
