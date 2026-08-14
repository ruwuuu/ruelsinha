import { BasePlugin } from '../../lib/index.ts';
/**
 * Hook to access a plugin.
 * @param pluginId The ID of the plugin to access
 * @returns The plugin or null during initialization
 * @example
 * // Get zoom plugin
 * const zoom = usePlugin<ZoomPlugin>(ZoomPlugin.id);
 */
export declare function usePlugin<T extends BasePlugin>(pluginId: T['id']): {
    plugin: T | null;
    isLoading: boolean;
    ready: Promise<void>;
};
