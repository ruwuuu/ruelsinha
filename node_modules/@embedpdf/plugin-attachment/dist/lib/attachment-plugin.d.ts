import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { AttachmentCapability, AttachmentPluginConfig } from './types';
export declare class AttachmentPlugin extends BasePlugin<AttachmentPluginConfig, AttachmentCapability> {
    static readonly id: "attachment";
    constructor(id: string, registry: PluginRegistry);
    initialize(_: AttachmentPluginConfig): Promise<void>;
    protected buildCapability(): AttachmentCapability;
    private createAttachmentScope;
    private downloadAttachment;
    private getAttachments;
}
