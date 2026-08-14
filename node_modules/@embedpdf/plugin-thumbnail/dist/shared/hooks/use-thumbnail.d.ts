import { ThumbnailPlugin } from '../../index.ts';
export declare const useThumbnailPlugin: () => {
    plugin: ThumbnailPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useThumbnailCapability: () => {
    provides: Readonly<import('../../index.ts').ThumbnailCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
