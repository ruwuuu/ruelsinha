import { SelectionPlugin } from '../../lib/index.ts';
/**
 * Hook to get the selection plugin's capability API.
 * This provides methods for controlling and listening to selection events.
 */
export declare const useSelectionCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SelectionCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the raw selection plugin instance.
 * Useful for accessing plugin-specific properties or methods not exposed in the capability.
 */
export declare const useSelectionPlugin: () => {
    plugin: SelectionPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
