import { FormPlugin, FormDocumentState } from '../../index.ts';
export declare const useFormPlugin: () => {
    plugin: FormPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFormCapability: () => {
    provides: Readonly<import('../../index.ts').FormCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook that subscribes to the form plugin's document state for a specific document.
 * Returns selectedFieldId and re-renders when the state changes.
 */
export declare const useFormDocumentState: (documentId: string) => FormDocumentState;
