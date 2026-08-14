import { ScrollPlugin, ScrollScope } from '../../lib/index.ts';
export declare const useScrollPlugin: () => {
    plugin: ScrollPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useScrollCapability: () => {
    provides: Readonly<import('../../lib/index.ts').ScrollCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseScrollReturn {
    provides: ScrollScope | null;
    state: {
        currentPage: number;
        totalPages: number;
    };
}
export declare const useScroll: (documentId: string) => UseScrollReturn;
export {};
