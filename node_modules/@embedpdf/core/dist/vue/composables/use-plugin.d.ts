import { ShallowRef, Ref } from 'vue';
import { BasePlugin } from '../../lib/index.ts';
export interface PluginState<T extends BasePlugin> {
    plugin: ShallowRef<T | null>;
    isLoading: Ref<boolean>;
    ready: Ref<Promise<void>>;
}
export declare function usePlugin<T extends BasePlugin>(pluginId: T['id']): PluginState<T>;
