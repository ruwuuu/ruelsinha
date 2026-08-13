import { FullscreenPlugin, FullscreenState } from '../../index.ts';
export declare const useFullscreenPlugin: () => {
    plugin: FullscreenPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFullscreenCapability: () => {
    provides: Readonly<import('../../index.ts').FullscreenCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFullscreen: () => {
    provides: Readonly<import('../../index.ts').FullscreenCapability> | null;
    state: FullscreenState;
};
