import { BasePlugin } from '../../lib/index.ts';
/**
 * Hook to access a plugin's capability.
 * @param pluginId The ID of the plugin to access
 * @returns The capability provided by the plugin or null during initialization
 * @example
 * // Get zoom capability
 * const zoom = useCapability<ZoomPlugin>(ZoomPlugin.id);
 */
export declare function useCapability<T extends BasePlugin>(pluginId: T['id']): {
    provides: ReturnType<NonNullable<T["provides"]>> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
