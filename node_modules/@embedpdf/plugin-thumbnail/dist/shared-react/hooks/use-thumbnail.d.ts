import { ThumbnailPlugin } from '../../lib/index.ts';
export declare const useThumbnailPlugin: () => {
    plugin: ThumbnailPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useThumbnailCapability: () => {
    provides: Readonly<import('../../lib/index.ts').ThumbnailCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
