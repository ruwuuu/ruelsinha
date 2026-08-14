import { FormPlugin, FormDocumentState } from '../../lib/index.ts';
export declare const useFormPlugin: () => {
    plugin: FormPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFormCapability: () => {
    provides: Readonly<import('../../lib/index.ts').FormCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useFormDocumentState: (getDocumentId: () => string) => {
    readonly state: FormDocumentState;
};
