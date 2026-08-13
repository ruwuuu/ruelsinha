import { FullscreenPlugin, FullscreenState } from '../../lib/index.ts';
export declare const useFullscreenPlugin: () => {
    plugin: FullscreenPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFullscreenCapability: () => {
    provides: Readonly<import('../../lib/index.ts').FullscreenCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFullscreen: () => {
    readonly provides: Readonly<import('../../lib/index.ts').FullscreenCapability> | null;
    state: FullscreenState;
};
