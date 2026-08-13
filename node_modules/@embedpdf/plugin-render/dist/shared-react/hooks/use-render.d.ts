import { RenderPlugin } from '../../lib/index.ts';
export declare const useRenderPlugin: () => {
    plugin: RenderPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRenderCapability: () => {
    provides: Readonly<import('../../lib/index.ts').RenderCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
