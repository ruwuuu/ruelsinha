import { PluginRegistry, CoreState, DocumentState } from '../../lib/index.ts';
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
export declare const pdfContext: PDFContextState;
/**
 * Hook to access the PDF registry context.
 * @returns The PDF registry or null during initialization
 */
export declare const useRegistry: () => PDFContextState;
