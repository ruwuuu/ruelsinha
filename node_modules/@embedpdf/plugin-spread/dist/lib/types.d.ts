import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { PdfPageObject } from '@embedpdf/models';
export interface SpreadPluginConfig extends BasePluginConfig {
    defaultSpreadMode?: SpreadMode;
}
export declare enum SpreadMode {
    None = "none",
    Odd = "odd",
    Even = "even"
}
export interface SpreadDocumentState {
    spreadMode: SpreadMode;
    pageGrouping?: number[][];
}
export interface SpreadState {
    documents: Record<string, SpreadDocumentState>;
    activeDocumentId: string | null;
}
export interface SpreadChangeEvent {
    documentId: string;
    spreadMode: SpreadMode;
}
export interface SpreadScope {
    setSpreadMode(mode: SpreadMode): void;
    getSpreadMode(): SpreadMode;
    getSpreadPages(): PdfPageObject[][];
    onSpreadChange: EventHook<SpreadMode>;
}
export interface SpreadCapability {
    setSpreadMode(mode: SpreadMode): void;
    getSpreadMode(): SpreadMode;
    getSpreadPages(documentId?: string): PdfPageObject[][];
    forDocument(documentId: string): SpreadScope;
    onSpreadChange: EventHook<SpreadChangeEvent>;
}
