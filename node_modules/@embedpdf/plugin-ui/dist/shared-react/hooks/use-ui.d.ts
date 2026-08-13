import { UIPlugin, UIDocumentState, UISchema } from '../../lib/index.ts';
export declare const useUICapability: () => {
    provides: Readonly<import('../../lib/index.ts').UICapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useUIPlugin: () => {
    plugin: UIPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Get UI state for a document
 */
export declare const useUIState: (documentId: string) => UIDocumentState | null;
/**
 * Get UI schema
 */
export declare const useUISchema: () => UISchema | null;
