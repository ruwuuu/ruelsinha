import { FullscreenPlugin, FullscreenState } from '../../lib/index.ts';
export declare const useFullscreenPlugin: () => import('@embedpdf/core/vue').PluginState<FullscreenPlugin>;
export declare const useFullscreenCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').FullscreenCapability>>;
export declare const useFullscreen: () => {
    provides: import('vue').Ref<Readonly<import('../../lib/index.ts').FullscreenCapability> | null, Readonly<import('../../lib/index.ts').FullscreenCapability> | null>;
    state: import('vue').Ref<{
        isFullscreen: boolean;
    }, FullscreenState | {
        isFullscreen: boolean;
    }>;
};
