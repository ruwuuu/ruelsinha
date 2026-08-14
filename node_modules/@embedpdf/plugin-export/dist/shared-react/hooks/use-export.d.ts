import { ExportPlugin } from '../../lib/index.ts';
export declare const useExportPlugin: () => {
    plugin: ExportPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useExportCapability: () => {
    provides: Readonly<import('../../lib/index.ts').ExportCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for export capability for a specific document
 * @param documentId Document ID
 */
export declare const useExport: (documentId: string) => {
    provides: import('../../lib/index.ts').ExportScope | null;
};
