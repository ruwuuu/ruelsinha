import { BasePlugin, Listener, PluginRegistry, Unsubscribe } from '@embedpdf/core';
import { PrintCapability, PrintPluginConfig, PrintReadyEvent } from './types';
export declare class PrintPlugin extends BasePlugin<PrintPluginConfig, PrintCapability> {
    static readonly id: "print";
    private readonly printReady$;
    constructor(id: string, registry: PluginRegistry, _config: PrintPluginConfig);
    protected buildCapability(): PrintCapability;
    private createPrintScope;
    private print;
    private preparePrintDocument;
    onPrintRequest(listener: Listener<PrintReadyEvent>): Unsubscribe;
    initialize(_: PrintPluginConfig): Promise<void>;
    destroy(): Promise<void>;
}
