import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { PdfAnnotationObject, Position, Rect } from '@embedpdf/models';
import { AnnotationCapability, AnnotationPluginConfig, AnnotationState, UnifiedDragOptions, UnifiedDragState, UnifiedDragEvent, UnifiedResizeOptions, UnifiedResizeState, UnifiedResizeEvent, UnifiedRotateOptions, UnifiedRotateState, UnifiedRotateEvent, LockMode } from './types';
import { AnnotationAction } from './actions';
import { AnnotationTool, AnnotationToolMap, ToolById, ToolId } from './tools/types';
import { PreviewState, HandlerServices } from './handlers/types';
export declare class AnnotationPlugin extends BasePlugin<AnnotationPluginConfig, AnnotationCapability, AnnotationState, AnnotationAction> {
    static readonly id: "annotation";
    private readonly ANNOTATION_HISTORY_TOPIC;
    private static readonly defaultHandlerFactories;
    readonly config: AnnotationPluginConfig;
    private readonly state$;
    private readonly interactionManager;
    private readonly selection;
    private readonly history;
    private readonly scroll;
    private pendingContexts;
    private isInitialLoadComplete;
    private importQueue;
    private commitInProgress;
    private readonly activeTool$;
    private readonly events$;
    private readonly toolsChange$;
    private readonly appearanceCache;
    private readonly unifiedDragStates;
    private readonly unifiedDrag$;
    private readonly unifiedResizeStates;
    private readonly unifiedResize$;
    private readonly unifiedRotateStates;
    private readonly unifiedRotate$;
    private readonly navigate$;
    constructor(id: string, registry: PluginRegistry, config: AnnotationPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentLoaded(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    initialize(): Promise<void>;
    private registerInteractionForTool;
    protected buildCapability(): AnnotationCapability;
    private createAnnotationScope;
    onStoreUpdated(prev: AnnotationState, next: AnnotationState): void;
    private transformAnnotation;
    registerPageHandlers(documentId: string, pageIndex: number, scale: number, callbacks: {
        services: HandlerServices;
        onPreview: (toolId: string, state: PreviewState | null) => void;
    }): () => void;
    private getDocumentState;
    private getAllAnnotations;
    private getPageAnnotations;
    private getSelectedAnnotation;
    private getAnnotationById;
    private getAnnotationsMethod;
    private renderAnnotation;
    /**
     * Batch-fetch rendered appearance stream images for all annotations on a page.
     * Results are cached per document + page. Call invalidatePageAppearances to clear.
     */
    private getPageAppearances;
    /**
     * Clear cached appearances for a specific page (e.g. on zoom change).
     */
    private invalidatePageAppearances;
    /**
     * Remove a single annotation's entry from the page appearance cache.
     * Used after committing changes that regenerate the annotation's appearance.
     */
    private invalidateAnnotationAppearance;
    private exportAnnotationsMethod;
    private importAnnotations;
    private processImportQueue;
    private processImportItems;
    private createAnnotation;
    private buildPatch;
    private updateAnnotation;
    private deleteAnnotation;
    private deleteAnnotationsMethod;
    private deleteAllAnnotationsMethod;
    private purgeAnnotationMethod;
    private selectAnnotation;
    private deselectAnnotation;
    /**
     * Derive page activity from the current annotation selection.
     * Called from onStoreUpdated whenever selectedUids changes,
     * so ALL selection code paths are covered automatically.
     */
    private updateAnnotationSelectionActivity;
    private getSelectedAnnotationsMethod;
    private getSelectedAnnotationIdsMethod;
    private toggleSelectionMethod;
    private addToSelectionMethod;
    private removeFromSelectionMethod;
    private setSelectionMethod;
    private getAttachedLinksMethod;
    private hasAttachedLinksMethod;
    private deleteAttachedLinksMethod;
    /**
     * Group the currently selected annotations.
     * The first selected annotation becomes the group leader.
     * All other selected annotations get their IRT set to the leader's ID with RT = Group.
     */
    private groupAnnotationsMethod;
    /**
     * Ungroup all annotations in the group containing the specified annotation.
     * Clears IRT and RT from all group members (the leader doesn't have them).
     */
    private ungroupAnnotationsMethod;
    /**
     * Get all annotations in the same group as the specified annotation.
     */
    private getGroupMembersMethod;
    /**
     * Check if an annotation is part of a group.
     */
    private isInGroupMethod;
    /**
     * Get the available grouping action for the current selection.
     */
    private getGroupingActionMethod;
    /**
     * Compute combined constraints from all selected annotations.
     * This finds the "weakest link" in each direction - the annotation with the least
     * room to move determines the group's limit.
     */
    private computeCombinedConstraints;
    /**
     * Clamp a delta to the combined constraints.
     * Negative y = moving up, positive y = moving down
     * Negative x = moving left, positive x = moving right
     */
    private clampDelta;
    /**
     * Start a unified drag operation.
     * The plugin automatically expands the selection to include attached links.
     * Framework components should call this instead of building their own logic.
     *
     * @param documentId - The document ID
     * @param options - Drag options (annotationIds and pageSize)
     */
    startDrag(documentId: string, options: UnifiedDragOptions): void;
    /**
     * Compute preview patches for all drag participants.
     * Uses transformAnnotation to properly handle vertices, inkList, etc.
     */
    private computeDragPreviewPatches;
    /**
     * Update the drag delta during a unified drag operation.
     * Returns the clamped delta synchronously for the caller's preview.
     *
     * @param documentId - The document ID
     * @param rawDelta - The unconstrained delta from the drag gesture
     * @returns The clamped delta
     */
    updateDrag(documentId: string, rawDelta: Position): Position;
    /**
     * Commit the drag - plugin builds and applies ALL patches.
     * This is the key method that centralizes patch building in the plugin.
     *
     * @param documentId - The document ID
     */
    commitDrag(documentId: string): void;
    /**
     * Cancel the drag without committing.
     *
     * @param documentId - The document ID
     */
    cancelDrag(documentId: string): void;
    /**
     * Get the current unified drag state for a document.
     */
    getDragState(documentId: string): UnifiedDragState | null;
    /**
     * Subscribe to unified drag state changes.
     * Framework components use this for preview updates.
     */
    get onDragChange(): import('@embedpdf/core').EventHook<UnifiedDragEvent>;
    /**
     * Compute the union bounding box of multiple rects.
     */
    private computeUnifiedGroupBoundingBox;
    /**
     * Compute relative positions for annotations within a group bounding box.
     */
    private computeUnifiedRelativePositions;
    /**
     * Compute new rects for all annotations based on the new group bounding box.
     */
    private computeUnifiedResizedRects;
    /**
     * Compute preview patches for all resize participants.
     * Uses transformAnnotation to properly handle vertices, inkList, etc.
     */
    private computeResizePreviewPatches;
    /**
     * Start a unified resize operation.
     * The plugin automatically expands the selection to include attached links.
     *
     * @param documentId - The document ID
     * @param options - Resize options
     */
    startResize(documentId: string, options: UnifiedResizeOptions): void;
    /**
     * Update the resize with a new group bounding box.
     * Returns the computed rects synchronously for immediate preview use.
     *
     * @param documentId - The document ID
     * @param newGroupBox - The new group bounding box
     * @returns Record of annotation ID to new rect
     */
    updateResize(documentId: string, newGroupBox: Rect): Record<string, Rect>;
    /**
     * Commit the resize - plugin builds and applies ALL patches.
     *
     * @param documentId - The document ID
     */
    commitResize(documentId: string): void;
    /**
     * Cancel the resize without committing.
     *
     * @param documentId - The document ID
     */
    cancelResize(documentId: string): void;
    /**
     * Get the current unified resize state for a document.
     */
    getResizeState(documentId: string): UnifiedResizeState | null;
    /**
     * Subscribe to unified resize state changes.
     * Framework components use this for preview updates.
     */
    get onResizeChange(): import('@embedpdf/core').EventHook<UnifiedResizeEvent>;
    private cloneRect;
    private translateRect;
    private normalizeAngle;
    private normalizeDelta;
    private buildRotationParticipants;
    private computeRotatePreviewPatches;
    startRotation(documentId: string, options: UnifiedRotateOptions): void;
    updateRotation(documentId: string, cursorAngle: number, rotationDelta?: number): void;
    commitRotation(documentId: string): void;
    cancelRotation(documentId: string): void;
    getRotateState(documentId: string): UnifiedRotateState | null;
    /**
     * Subscribe to unified rotation state changes.
     */
    get onRotateChange(): import('@embedpdf/core').EventHook<UnifiedRotateEvent>;
    private updateAnnotationsMethod;
    private moveAnnotationsMethod;
    private moveAnnotationMethod;
    getActiveTool(documentId?: string): AnnotationTool | null;
    setActiveTool(toolId: string | null, documentId?: string, context?: Record<string, unknown>): void;
    getTool<TId extends ToolId<AnnotationToolMap>>(toolId: TId): (ToolById<AnnotationToolMap, TId> & AnnotationTool) | undefined;
    getTool(toolId: string): AnnotationTool | undefined;
    findToolForAnnotation(annotation: PdfAnnotationObject): AnnotationTool | null;
    setLocked(mode: LockMode, documentId?: string): void;
    getLocked(documentId?: string): LockMode;
    isAnnotationLocked(annotation: PdfAnnotationObject, documentId?: string): boolean;
    /**
     * Whether the annotation can be interacted with at all (selected, edited, menu shown).
     * Returns false for `noView`, `hidden`, `readOnly`, or category-locked annotations.
     * This is the spec-compliant "can the user do anything with this?" predicate.
     */
    isAnnotationInteractive(annotation: PdfAnnotationObject, documentId?: string): boolean;
    /**
     * Whether the annotation's structure (position, size, rotation, vertices) is locked.
     * Non-interactive annotations are treated as structurally locked. PDF `locked` flag
     * makes an otherwise-interactive annotation structurally locked while still selectable.
     */
    isAnnotationStructurallyLocked(annotation: PdfAnnotationObject, documentId?: string): boolean;
    /**
     * Whether the annotation's content (e.g. FreeText text) is locked.
     * Non-interactive annotations are treated as content-locked. PDF `lockedContents`
     * flag blocks content edits while still allowing move/resize.
     */
    isAnnotationContentLocked(annotation: PdfAnnotationObject, documentId?: string): boolean;
    /**
     * Whether a specific annotation is eligible to be added to the selection store.
     * Differs from the subtype-based `isSelectableAnnotation` helper: that answers
     * "is this subtype ever selectable?", while this answers "is this specific
     * annotation selectable right now given its flags and document lock state?".
     */
    private isAnnotationSelectable;
    isCategoryLockedMethod(category: string, documentId?: string): boolean;
    isToolLockedMethod(toolId: string, documentId?: string): boolean;
    syncAnnotationObject(id: string, patch: Partial<PdfAnnotationObject>, documentId?: string): void;
    private navigateTargetMethod;
    /**
     * Collects all pending annotation changes for a document into a batch.
     * This separates the "what to commit" from "how to commit" for cleaner code.
     */
    private collectPendingChanges;
    /**
     * Executes a batch of pending changes by creating engine tasks.
     * Returns a task that resolves when all operations complete.
     */
    private executeCommitBatch;
    /**
     * Emits commit events for all completed operations.
     * Centralizes event emission for cleaner separation of concerns.
     */
    private emitCommitEvents;
    /**
     * Attempts to acquire the commit lock for a document.
     * Returns true if acquired, false if a commit is already in progress.
     */
    private acquireCommitLock;
    /**
     * Releases the commit lock for a document.
     */
    private releaseCommitLock;
    private commit;
}
