import { BookmarkPlugin } from '../../lib/index.ts';
export declare const useBookmarkPlugin: () => {
    plugin: BookmarkPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useBookmarkCapability: () => {
    provides: Readonly<import('../../lib/index.ts').BookmarkCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
