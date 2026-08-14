import { UIPlugin, UIDocumentState, UIScope } from '../../lib';
/**
 * Hook to get the raw UI plugin instance.
 */
export declare const useUIPlugin: () => {
    plugin: UIPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the UI plugin's capability API.
 */
export declare const useUICapability: () => {
    provides: Readonly<import('../../lib').UICapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseUIStateReturn {
    provides: UIScope | null;
    state: UIDocumentState | null;
}
/**
 * Hook for UI state for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useUIState: (getDocumentId: () => string | null) => UseUIStateReturn;
/**
 * Hook to get UI schema
 * Returns an object with a reactive getter for the schema
 */
export declare const useUISchema: () => {
    readonly schema: import('../../lib').UISchema | null;
};
export {};
