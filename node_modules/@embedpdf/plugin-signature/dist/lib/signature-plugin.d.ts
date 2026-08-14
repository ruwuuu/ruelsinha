import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { SignatureCapability, SignatureEntry, SignaturePluginConfig, SignatureState } from './types';
import { SignatureAction } from './actions';
export declare class SignaturePlugin extends BasePlugin<SignaturePluginConfig, SignatureCapability, SignatureState, SignatureAction> {
    private config;
    static readonly id = "signature";
    private readonly entries;
    private readonly entriesChange$;
    private readonly activePlacement$;
    private annotation;
    private toolChangeUnsubscribe;
    private currentGhostUrl;
    constructor(id: string, registry: PluginRegistry, config: SignaturePluginConfig);
    initialize(): Promise<void>;
    protected buildCapability(): SignatureCapability;
    getEntries(): SignatureEntry[];
    addEntry(entry: Omit<SignatureEntry, 'id' | 'createdAt'>): string;
    removeEntry(id: string): void;
    loadEntries(entries: SignatureEntry[]): void;
    exportEntries(): SignatureEntry[];
    private createSignatureScope;
    private activatePlacement;
    private deactivatePlacement;
    private revokeGhostUrl;
    private emitEntriesChange;
    destroy(): Promise<void>;
}
