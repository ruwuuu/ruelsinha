import { StampPlugin, ResolvedStamp, StampLibrary, ActiveStampInfo } from '../../lib/index.ts';
export declare const useStampPlugin: () => {
    plugin: StampPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useStampCapability: () => {
    provides: Readonly<import('../../lib/index.ts').StampCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare function useStampLibraries(): {
    readonly libraries: StampLibrary[];
};
export declare function useStampsByCategory(getCategory: () => string): {
    readonly stamps: ResolvedStamp[];
};
export declare function useStampsByLibrary(getLibraryId: () => string | undefined, getCategory?: () => string | undefined): {
    readonly stamps: ResolvedStamp[];
};
export declare function useActiveStamp(getDocumentId: () => string): {
    readonly activeStamp: ActiveStampInfo | null;
};
