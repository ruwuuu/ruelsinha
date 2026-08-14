import { BasePluginConfig } from '@embedpdf/core';
import { PdfErrorReason, Task } from '@embedpdf/models';
export interface ExportPluginConfig extends BasePluginConfig {
    defaultFileName: string;
}
export interface BufferAndName {
    buffer: ArrayBuffer;
    name: string;
}
export interface DownloadRequestEvent {
    documentId: string;
}
export interface ExportScope {
    saveAsCopy: () => Task<ArrayBuffer, PdfErrorReason>;
    download: () => void;
}
export interface ExportCapability {
    saveAsCopy: () => Task<ArrayBuffer, PdfErrorReason>;
    download: () => void;
    forDocument(documentId: string): ExportScope;
}
export interface ExportState {
}
