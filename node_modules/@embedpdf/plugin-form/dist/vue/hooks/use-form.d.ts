import { MaybeRefOrGetter } from 'vue';
import { FormPlugin, FormDocumentState } from '../../lib/index.ts';
export declare const useFormPlugin: () => import('@embedpdf/core/vue').PluginState<FormPlugin>;
export declare const useFormCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').FormCapability>>;
export declare const useFormDocumentState: (documentId: MaybeRefOrGetter<string>) => {
    state: import('vue').Ref<{
        selectedFieldId: string | null;
    }, FormDocumentState | {
        selectedFieldId: string | null;
    }>;
    provides: import('vue').ComputedRef<import('../../lib/index.ts').FormScope | null>;
};
