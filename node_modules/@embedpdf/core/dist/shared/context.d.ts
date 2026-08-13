import { CoreState, DocumentState, PluginRegistry } from '../index.ts';
export interface PDFContextState {
    registry: PluginRegistry | null;
    coreState: CoreState | null;
    isInitializing: boolean;
    pluginsReady: boolean;
    activeDocumentId: string | null;
    activeDocument: DocumentState | null;
    documents: Record<string, DocumentState>;
    documentStates: DocumentState[];
}
export declare const PDFContext: import('react').Context<PDFContextState>;
