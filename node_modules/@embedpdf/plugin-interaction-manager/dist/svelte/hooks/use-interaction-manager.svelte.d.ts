import { InteractionDocumentState, InteractionManagerPlugin, PointerEventHandlersWithLifecycle } from '../../lib/index.ts';
export declare const useInteractionManagerPlugin: () => {
    plugin: InteractionManagerPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useInteractionManagerCapability: () => {
    provides: Readonly<import('../../lib/index.ts').InteractionManagerCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare function useInteractionManager(getDocumentId: () => string): {
    readonly state: InteractionDocumentState;
    readonly provides: import('../../lib/index.ts').InteractionManagerScope | null;
};
export declare function useCursor(getDocumentId: () => string): {
    setCursor: (token: string, cursor: string, prio?: number) => void;
    removeCursor: (token: string) => void;
};
interface UsePointerHandlersOptions {
    modeId?: string | string[];
    pageIndex?: number;
    documentId: () => string;
}
export declare function usePointerHandlers({ modeId, pageIndex, documentId }: UsePointerHandlersOptions): {
    register: (handlers: PointerEventHandlersWithLifecycle, options?: {
        modeId?: string | string[];
        pageIndex?: number;
        documentId?: string;
    }) => (() => void) | undefined;
};
export declare function useIsPageExclusive(getDocumentId: () => string): {
    readonly current: boolean;
};
export {};
