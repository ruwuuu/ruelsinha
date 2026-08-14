import { RenderPlugin } from '../../index.ts';
export declare const useRenderPlugin: () => {
    plugin: RenderPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRenderCapability: () => {
    provides: Readonly<import('../../index.ts').RenderCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
