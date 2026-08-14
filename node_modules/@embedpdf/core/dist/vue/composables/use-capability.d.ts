import { BasePlugin } from '../../lib/index.ts';
import { Ref } from 'vue';
export interface CapabilityState<C> {
    provides: Ref<C | null>;
    isLoading: Ref<boolean>;
    ready: Ref<Promise<void>>;
}
/**
 * Access the public capability exposed by a plugin.
 *
 * @example
 * const { provides: zoom } = useCapability<ZoomPlugin>(ZoomPlugin.id);
 * zoom.value?.zoomIn();
 */
export declare function useCapability<T extends BasePlugin>(pluginId: T['id']): CapabilityState<ReturnType<NonNullable<T['provides']>>>;
