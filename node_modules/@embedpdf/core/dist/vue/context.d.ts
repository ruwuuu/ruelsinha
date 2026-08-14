import { InjectionKey, Ref, ShallowRef } from 'vue';
import { PluginRegistry, CoreState, DocumentState } from '../lib/index.ts';
export interface PDFContextState {
    registry: ShallowRef<PluginRegistry | null>;
    coreState: Ref<CoreState | null>;
    isInitializing: Ref<boolean>;
    pluginsReady: Ref<boolean>;
    activeDocumentId: Ref<string | null>;
    activeDocument: Ref<DocumentState | null>;
    documents: Ref<Record<string, DocumentState>>;
    documentStates: Ref<DocumentState[]>;
}
export declare const pdfKey: InjectionKey<PDFContextState>;
