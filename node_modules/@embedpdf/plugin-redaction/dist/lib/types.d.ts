import { BasePluginConfig, EventHook } from '@embedpdf/core';
import { PdfErrorReason, Rect, Task } from '@embedpdf/models';
export declare enum RedactionMode {
    /**
     * Unified redaction mode - supports both text selection and area marquee simultaneously.
     * Available when annotation plugin is present.
     */
    Redact = "redact",
    /**
     * Area-based redactions only (marquee selection).
     * For backwards compatibility with existing code.
     */
    MarqueeRedact = "marqueeRedact",
    /**
     * Text-based redactions only (text selection).
     * For backwards compatibility with existing code.
     */
    RedactSelection = "redactSelection"
}
export interface SelectedRedaction {
    page: number;
    id: string;
}
export interface RedactionDocumentState {
    isRedacting: boolean;
    activeType: RedactionMode | null;
    pending: Record<number, RedactionItem[]>;
    pendingCount: number;
    selected: SelectedRedaction | null;
}
export interface RedactionState {
    documents: Record<string, RedactionDocumentState>;
    activeDocumentId: string | null;
}
export type RedactionSource = 'annotation' | 'legacy';
interface RedactionItemBase {
    id: string;
    page: number;
    rect: Rect;
    source: RedactionSource;
    markColor: string;
    redactionColor: string;
}
export type RedactionItem = (RedactionItemBase & {
    kind: 'text';
    rects: Rect[];
    text?: string;
}) | (RedactionItemBase & {
    kind: 'area';
});
export interface RedactionPluginConfig extends BasePluginConfig {
    drawBlackBoxes: boolean;
    /**
     * When true, use annotation-based redactions (requires annotation plugin).
     * When false (default), use legacy internal pending state.
     */
    useAnnotationMode?: boolean;
}
export type RedactionEvent = {
    type: 'add';
    documentId: string;
    items: RedactionItem[];
} | {
    type: 'remove';
    documentId: string;
    page: number;
    id: string;
} | {
    type: 'clear';
    documentId: string;
} | {
    type: 'commit';
    documentId: string;
    success: boolean;
    error?: PdfErrorReason;
};
export interface PendingChangeEvent {
    documentId: string;
    pending: Record<number, RedactionItem[]>;
}
export interface SelectedChangeEvent {
    documentId: string;
    selected: SelectedRedaction | null;
}
export interface StateChangeEvent {
    documentId: string;
    state: RedactionDocumentState;
}
export interface RedactionScope {
    queueCurrentSelectionAsPending(): Task<boolean, PdfErrorReason>;
    enableRedact(): void;
    toggleRedact(): void;
    isRedactActive(): boolean;
    endRedact(): void;
    enableMarqueeRedact(): void;
    toggleMarqueeRedact(): void;
    isMarqueeRedactActive(): boolean;
    enableRedactSelection(): void;
    toggleRedactSelection(): void;
    isRedactSelectionActive(): boolean;
    addPending(items: RedactionItem[]): void;
    removePending(page: number, id: string): void;
    clearPending(): void;
    commitAllPending(): Task<boolean, PdfErrorReason>;
    commitPending(page: number, id: string): Task<boolean, PdfErrorReason>;
    selectPending(page: number, id: string): void;
    getSelectedPending(): SelectedRedaction | null;
    deselectPending(): void;
    getState(): RedactionDocumentState;
    onPendingChange: EventHook<Record<number, RedactionItem[]>>;
    onSelectedChange: EventHook<SelectedRedaction | null>;
    onRedactionEvent: EventHook<RedactionEvent>;
    onStateChange: EventHook<RedactionDocumentState>;
}
export interface RedactionCapability {
    queueCurrentSelectionAsPending(): Task<boolean, PdfErrorReason>;
    enableRedact(): void;
    toggleRedact(): void;
    isRedactActive(): boolean;
    endRedact(): void;
    enableMarqueeRedact(): void;
    toggleMarqueeRedact(): void;
    isMarqueeRedactActive(): boolean;
    enableRedactSelection(): void;
    toggleRedactSelection(): void;
    isRedactSelectionActive(): boolean;
    addPending(items: RedactionItem[]): void;
    removePending(page: number, id: string): void;
    clearPending(): void;
    commitAllPending(): Task<boolean, PdfErrorReason>;
    commitPending(page: number, id: string): Task<boolean, PdfErrorReason>;
    selectPending(page: number, id: string): void;
    getSelectedPending(): SelectedRedaction | null;
    deselectPending(): void;
    getState(): RedactionDocumentState;
    forDocument(documentId: string): RedactionScope;
    onPendingChange: EventHook<PendingChangeEvent>;
    onSelectedChange: EventHook<SelectedChangeEvent>;
    onRedactionEvent: EventHook<RedactionEvent>;
    onStateChange: EventHook<StateChangeEvent>;
}
export {};
