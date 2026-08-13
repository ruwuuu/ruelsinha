import { MaybeRefOrGetter } from 'vue';
import { InteractionDocumentState, InteractionManagerPlugin, PointerEventHandlersWithLifecycle } from '../../lib/index.ts';
export declare const useInteractionManagerPlugin: () => import('@embedpdf/core/vue').PluginState<InteractionManagerPlugin>;
export declare const useInteractionManagerCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').InteractionManagerCapability>>;
export declare function useInteractionManager(documentId: MaybeRefOrGetter<string>): {
    provides: import('vue').ComputedRef<import('../../lib/index.ts').InteractionManagerScope | null>;
    state: import('vue').Ref<{
        activeMode: string;
        cursor: string;
        paused: boolean;
    }, InteractionDocumentState | {
        activeMode: string;
        cursor: string;
        paused: boolean;
    }>;
};
export declare function useCursor(documentId: MaybeRefOrGetter<string>): {
    setCursor: (token: string, cursor: string, prio?: number) => void;
    removeCursor: (token: string) => void;
};
interface UsePointerHandlersOptions {
    modeId?: string | string[];
    pageIndex?: MaybeRefOrGetter<number>;
    documentId: MaybeRefOrGetter<string>;
}
export declare function usePointerHandlers({ modeId, pageIndex, documentId }: UsePointerHandlersOptions): {
    register: (handlers: PointerEventHandlersWithLifecycle, options?: {
        modeId?: string | string[];
        pageIndex?: number;
        documentId?: MaybeRefOrGetter<string>;
    }) => (() => void) | undefined;
};
export declare function useIsPageExclusive(documentId: MaybeRefOrGetter<string>): import('vue').Ref<boolean, boolean>;
export {};
