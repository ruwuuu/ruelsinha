import { ExportPlugin, ExportScope } from '../../lib/index.ts';
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
interface UseExportReturn {
    provides: ExportScope | null;
}
/**
 * Hook for export capability for a specific document
 * @param getDocumentId Function that returns the document ID
 */
export declare const useExport: (getDocumentId: () => string | null) => UseExportReturn;
export {};
