import { BasePlugin, PluginRegistry, Unsubscribe, Listener } from '@embedpdf/core';
import { Task, PdfErrorReason } from '@embedpdf/models';
import { DocumentManagerPluginConfig, DocumentManagerCapability, OpenDocumentResponse, OpenFileDialogOptions } from './types';
export declare class DocumentManagerPlugin extends BasePlugin<DocumentManagerPluginConfig, DocumentManagerCapability> {
    readonly id: string;
    static readonly id: "document-manager";
    private readonly documentOpened$;
    private readonly documentClosed$;
    private readonly activeDocumentChanged$;
    private readonly documentError$;
    private readonly documentOrderChanged$;
    private readonly openFileRequest$;
    private maxDocuments?;
    private loadOptions;
    constructor(id: string, registry: PluginRegistry, config?: DocumentManagerPluginConfig);
    protected buildCapability(): DocumentManagerCapability;
    /**
     * Check if a document is currently open
     */
    private isDocumentOpen;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    protected onActiveDocumentChanged(previousId: string | null, currentId: string | null): void;
    protected onCoreStoreUpdated(oldState: any, newState: any): void;
    onOpenFileRequest(handler: Listener<{
        task: Task<OpenDocumentResponse, PdfErrorReason>;
        options?: OpenFileDialogOptions;
    }>): Unsubscribe;
    private openDocumentUrl;
    private openDocumentBuffer;
    private retryDocument;
    private openFileDialog;
    private closeDocument;
    private closeAllDocuments;
    private setDocumentEncryption;
    private unlockOwnerPermissions;
    private removeEncryption;
    private checkDocumentLimit;
    private validateRetry;
    private retryUrlDocument;
    private retryBufferDocument;
    private handleLoadTask;
    private handleLoadError;
    private generateDocumentId;
    private extractNameFromUrl;
    initialize(config: DocumentManagerPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
