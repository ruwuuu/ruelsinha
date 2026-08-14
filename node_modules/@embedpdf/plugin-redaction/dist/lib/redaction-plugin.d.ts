import { RedactionPluginConfig, RedactionCapability, RedactionState } from './types';
import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { Rect } from '@embedpdf/models';
import { FormattedSelection } from '@embedpdf/plugin-selection';
import { RedactionAction } from './actions';
export declare class RedactionPlugin extends BasePlugin<RedactionPluginConfig, RedactionCapability, RedactionState, RedactionAction> {
    static readonly id: "redaction";
    private config;
    private selectionCapability;
    private interactionManagerCapability;
    private annotationCapability;
    private historyCapability;
    /**
     * Determines which mode to use:
     * - true: Annotation mode (new) - uses REDACT annotations as pending state
     * - false: Legacy mode (deprecated) - uses internal pending state
     */
    private readonly useAnnotationMode;
    private readonly redactionSelection$;
    private readonly redactionMarquee$;
    private readonly pending$;
    private readonly selected$;
    private readonly state$;
    private readonly events$;
    private readonly documentUnsubscribers;
    constructor(id: string, registry: PluginRegistry, config: RedactionPluginConfig);
    /**
     * Setup redaction modes - registers all interaction modes for redaction.
     * Works for both annotation mode and legacy mode.
     */
    private setupRedactionModes;
    /**
     * Setup mode change listener - handles all redaction modes
     */
    private setupModeChangeListener;
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    initialize(_config: RedactionPluginConfig): Promise<void>;
    protected buildCapability(): RedactionCapability;
    private createRedactionScope;
    /**
     * Get pending redactions derived from annotation plugin (annotation mode only)
     */
    private getPendingFromAnnotations;
    private getDocumentState;
    private getDocumentStateOrThrow;
    private isRedactTool;
    private getRedactTool;
    /**
     * Sync internal state when REDACT annotation is created.
     * Called from annotation event listener in annotation mode.
     */
    private syncFromAnnotationCreate;
    /**
     * Sync internal state when REDACT annotation is updated (moved/resized/color changed).
     * Called from annotation event listener in annotation mode.
     */
    private syncFromAnnotationUpdate;
    /**
     * Sync internal state when REDACT annotation is deleted.
     * Called from annotation event listener in annotation mode.
     */
    private syncFromAnnotationDelete;
    /**
     * Sync internal state from existing REDACT annotations after initial load.
     * Called when annotation plugin emits 'loaded' event.
     */
    private syncFromAnnotationLoad;
    /**
     * Sync selection state from annotation plugin's selected REDACT annotation.
     * Called when annotation plugin state changes.
     */
    private syncSelectionFromAnnotation;
    private addPendingItems;
    private removePendingItem;
    private clearPendingItems;
    private selectPending;
    private getSelectedPending;
    private deselectPending;
    private enableRedactSelection;
    private toggleRedactSelection;
    private isRedactSelectionActive;
    private enableMarqueeRedact;
    private toggleMarqueeRedact;
    private isMarqueeRedactActive;
    private enableRedact;
    private toggleRedact;
    private isRedactActive;
    private endRedact;
    onRedactionSelectionChange(documentId: string, callback: (formattedSelection: FormattedSelection[]) => void): import('@embedpdf/core').Unsubscribe;
    onRedactionMarqueeChange(documentId: string, callback: (data: {
        pageIndex: number;
        rect: Rect | null;
        modeId: string;
    }) => void): import('@embedpdf/core').Unsubscribe;
    /**
     * Get the stroke color for redaction previews.
     * In annotation mode: returns tool's defaults.strokeColor
     * In legacy mode: returns hardcoded red
     */
    getPreviewStrokeColor(): string;
    private queueCurrentSelectionAsPending;
    private commitPendingOne;
    /**
     * Legacy commit single redaction using redactTextInRects
     */
    private commitPendingOneLegacy;
    /**
     * Annotation mode: Apply single redaction using engine.applyRedaction
     */
    private applyRedactionAnnotationMode;
    private commitAllPending;
    /**
     * Legacy commit all redactions using redactTextInRects
     */
    private commitAllPendingLegacy;
    /**
     * Annotation mode: Apply all redactions using engine.applyAllRedactions per page
     */
    private applyAllRedactionsAnnotationMode;
    /**
     * Create REDACT annotations from text selection (annotation mode only)
     * @returns Array of annotation IDs that were created
     */
    private createRedactAnnotationsFromSelection;
    /**
     * Create legacy RedactionItems from text selection (legacy mode only)
     */
    private createLegacyRedactionsFromSelection;
    /**
     * Unified method to create redactions from text selection.
     * Delegates to annotation mode or legacy mode helper based on configuration.
     */
    private createRedactionsFromSelection;
    /**
     * Create a REDACT annotation from an area/marquee selection (annotation mode only)
     */
    private createRedactAnnotationFromArea;
    /**
     * Convert a RedactionItem to a PdfRedactAnnoObject
     */
    private redactionItemToAnnotation;
    /**
     * Convert a PdfRedactAnnoObject to a RedactionItem
     */
    private annotationToRedactionItem;
    private emitPendingChange;
    private emitSelectedChange;
    private emitStateChange;
    onStoreUpdated(_: RedactionState, newState: RedactionState): void;
    destroy(): Promise<void>;
}
