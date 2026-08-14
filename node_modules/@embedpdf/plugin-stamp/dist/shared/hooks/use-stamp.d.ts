import { StampPlugin, StampLibrary, ResolvedStamp, ActiveStampInfo } from '../../index.ts';
export declare const useStampPlugin: () => {
    plugin: StampPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useStampCapability: () => {
    provides: Readonly<import('../../index.ts').StampCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useStampLibraries: () => {
    libraries: StampLibrary[];
    provides: Readonly<import('../../index.ts').StampCapability> | null;
};
export declare const useStampsByCategory: (category: string) => ResolvedStamp[];
export declare const useStampsByLibrary: (libraryId?: string, category?: string) => ResolvedStamp[];
export declare const useActiveStamp: (documentId: string) => ActiveStampInfo | null;
