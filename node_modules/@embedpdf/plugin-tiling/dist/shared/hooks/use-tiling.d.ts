import { TilingPlugin } from '../../index.ts';
export declare const useTilingPlugin: () => {
    plugin: TilingPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useTilingCapability: () => {
    provides: Readonly<import('../../index.ts').TilingCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
