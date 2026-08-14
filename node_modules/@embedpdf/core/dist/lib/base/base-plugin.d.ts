import { IPlugin } from '../types/plugin';
import { PluginRegistry } from '../registry/plugin-registry';
import { Action, CoreAction, CoreState, PluginStore, Store, StoreState } from '../store';
import { Logger, PdfEngine, PdfPermissionFlag } from '@embedpdf/models';
import { DocumentState } from '../store/initial-state';
export interface StateChangeHandler<TState> {
    (state: TState): void;
}
export declare abstract class BasePlugin<TConfig = unknown, TCapability = unknown, TState = unknown, TAction extends Action = Action> implements IPlugin<TConfig> {
    readonly id: string;
    protected registry: PluginRegistry;
    static readonly id: string;
    protected pluginStore: PluginStore<TState, TAction>;
    protected coreStore: Store<CoreState, CoreAction>;
    protected readonly logger: Logger;
    protected readonly engine: PdfEngine;
    private cooldownActions;
    private debouncedTimeouts;
    private unsubscribeFromState;
    private unsubscribeFromCoreStore;
    private unsubscribeFromStartLoadingDocument;
    private unsubscribeFromSetDocumentLoaded;
    private unsubscribeFromCloseDocument;
    private unsubscribeFromSetScale;
    private unsubscribeFromSetRotation;
    private _capability?;
    private readyPromise;
    private readyResolve;
    constructor(id: string, registry: PluginRegistry);
    /** Construct the public capability (called once & cached). */
    protected abstract buildCapability(): TCapability;
    provides(): Readonly<TCapability>;
    /**
     * Initialize plugin with config
     */
    abstract initialize(config: TConfig): Promise<void>;
    /**
     *  Get a copy of the current state
     */
    protected get state(): Readonly<TState>;
    /**
     *  Get a copy of the current core state
     */
    protected get coreState(): Readonly<StoreState<CoreState>>;
    /**
     * @deprecated  use `this.state` Get a copy of the current state
     */
    protected getState(): TState;
    /**
     * @deprecated  use `this.coreState` Get a copy of the current core state
     */
    protected getCoreState(): StoreState<CoreState>;
    /**
     * Core Dispatch
     */
    protected dispatchCoreAction(action: CoreAction): StoreState<CoreState>;
    /**
     * Dispatch an action to all plugins
     */
    protected dispatchToAllPlugins(action: TAction): StoreState<CoreState>;
    /**
     * Dispatch an action
     */
    protected dispatch(action: TAction): TState;
    /**
     * Dispatch an action with a cooldown to prevent rapid repeated calls
     * This executes immediately if cooldown has expired, then blocks subsequent calls
     * @param action The action to dispatch
     * @param cooldownTime Time in ms for cooldown (default: 100ms)
     * @returns boolean indicating whether the action was dispatched or blocked
     */
    protected cooldownDispatch(action: TAction, cooldownTime?: number): boolean;
    /**
     * Dispatch an action with true debouncing - waits for the delay after the last call
     * Each new call resets the timer. Action only executes after no calls for the specified time.
     * @param action The action to dispatch
     * @param debounceTime Time in ms to wait after the last call
     */
    protected debouncedDispatch(action: TAction, debounceTime?: number): void;
    /**
     * Cancel a pending debounced action
     * @param actionType The action type to cancel
     */
    protected cancelDebouncedDispatch(actionType: string): void;
    /**
     * Subscribe to state changes
     */
    protected subscribe(listener: (action: TAction, state: TState) => void): () => void;
    /**
     * Subscribe to core store changes
     */
    protected subscribeToCoreStore(listener: (action: Action, state: StoreState<CoreState>) => void): () => void;
    /**
     * Called when the plugin store state is updated
     * @param oldState Previous state
     * @param newState New state
     */
    protected onStoreUpdated(oldState: TState, newState: TState): void;
    /**
     * Called when the core store state is updated
     * @param oldState Previous state
     * @param newState New state
     */
    protected onCoreStoreUpdated(oldState: StoreState<CoreState>, newState: StoreState<CoreState>): void;
    /**
     * Called when a document is opened
     * Override to initialize per-document state
     * @param documentId The ID of the document that was opened
     */
    protected onDocumentLoadingStarted(documentId: string): void;
    /**
     * Called when a document is loaded
     * @param documentId The ID of the document that is loaded
     */
    protected onDocumentLoaded(documentId: string): void;
    /**
     * Called when a document is closed
     * Override to cleanup per-document state
     * @param documentId The ID of the document that was closed
     */
    protected onDocumentClosed(documentId: string): void;
    /**
     * Called when the active document changes
     * @param previousId The ID of the previous active document
     * @param currentId The ID of the new active document
     */
    protected onActiveDocumentChanged(previousId: string | null, currentId: string | null): void;
    protected onScaleChanged(documentId: string, scale: number): void;
    protected onRotationChanged(documentId: string, rotation: number): void;
    /**
     * Cleanup method to be called when plugin is being destroyed
     */
    destroy(): void;
    /**
     * Returns a promise that resolves when the plugin is ready
     */
    ready(): Promise<void>;
    /**
     * Mark the plugin as ready
     */
    protected markReady(): void;
    /**
     * Reset the ready state (useful for plugins that need to reinitialize)
     */
    protected resetReady(): void;
    /**
     * Get the active document ID
     * @throws Error if no active document exists
     */
    protected getActiveDocumentId(): string;
    /**
     * Get the active document ID or null if none exists
     */
    protected getActiveDocumentIdOrNull(): string | null;
    /**
     * Get core document state for a specific document
     * @param documentId Document ID (optional, defaults to active document)
     * @returns Document state or null if not found
     */
    protected getCoreDocument(documentId?: string): DocumentState | null;
    /**
     * Get core document state for a specific document
     * @param documentId Document ID (optional, defaults to active document)
     * @throws Error if document not found
     */
    protected getCoreDocumentOrThrow(documentId?: string): DocumentState;
    /**
     * Get the effective permission flags for a document.
     * Applies layered resolution: per-document override → global override → PDF permission.
     * Returns AllowAll if document not found.
     * @param documentId Document ID (optional, defaults to active document)
     */
    protected getDocumentPermissions(documentId?: string): number;
    /**
     * Check if a document has the required permissions (returns boolean).
     * Applies layered resolution: per-document override → global override → PDF permission.
     * Useful for conditional UI logic.
     * @param documentId Document ID (optional, defaults to active document)
     * @param flags Permission flags to check
     */
    protected checkPermission(documentId: string | undefined, ...flags: PdfPermissionFlag[]): boolean;
    /**
     * Assert that a document has the required permissions.
     * Applies layered resolution: per-document override → global override → PDF permission.
     * Throws PermissionDeniedError if any flag is missing.
     * @param documentId Document ID (optional, defaults to active document)
     * @param flags Permission flags to require
     */
    protected requirePermission(documentId: string | undefined, ...flags: PdfPermissionFlag[]): void;
}
