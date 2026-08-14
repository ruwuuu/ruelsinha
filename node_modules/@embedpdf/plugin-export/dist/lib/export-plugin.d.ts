import { BasePlugin, Listener, PluginRegistry } from '@embedpdf/core';
import { PdfErrorReason, Task } from '@embedpdf/models';
import { BufferAndName, ExportCapability, ExportPluginConfig, DownloadRequestEvent } from './types';
export declare class ExportPlugin extends BasePlugin<ExportPluginConfig, ExportCapability> {
    static readonly id: "export";
    private readonly downloadRequest$;
    private readonly config;
    constructor(id: string, registry: PluginRegistry, config: ExportPluginConfig);
    protected buildCapability(): ExportCapability;
    private createExportScope;
    private download;
    private saveAsCopy;
    saveAsCopyAndGetBufferAndName(documentId: string): Task<BufferAndName, PdfErrorReason>;
    onRequest(listener: Listener<DownloadRequestEvent>): import('@embedpdf/core').Unsubscribe;
    initialize(_: ExportPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
