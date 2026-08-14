import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { FieldGroupEntry, FormCapability, FormPluginConfig, FormState } from './types';
import { FormAction } from './actions';
export declare class FormPlugin extends BasePlugin<FormPluginConfig, FormCapability, FormState, FormAction> {
    static readonly id: "form";
    private readonly FORM_HISTORY_TOPIC;
    private annotation;
    private history;
    private readonly state$;
    private readonly fieldValueChange$;
    private readonly formReady$;
    /** Per-document logical field index: documentId → (fieldKey → FieldGroupEntry[]) */
    private readonly fieldGroupIndex;
    /** Per-document name-based index: documentId → (fieldName → FieldGroupEntry[]) */
    private readonly fieldNameIndex;
    /** Per-document tab-order sorted widget list: documentId → FieldGroupEntry[] */
    private readonly orderedFieldIndex;
    /** IDs currently being propagated to siblings; prevents recursive loops */
    private readonly propagationInProgress;
    constructor(id: string, registry: PluginRegistry, _config: FormPluginConfig);
    initialize(): Promise<void>;
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    onStoreUpdated(prev: FormState, next: FormState): void;
    protected buildCapability(): FormCapability;
    private createFormScope;
    private handleAnnotationEvent;
    private propagateFieldLevelChanges;
    private buildFieldGroupIndex;
    private getDocumentState;
    private getDocIndex;
    private getFieldKey;
    private resolveWidgetAnnotation;
    getFieldGroup(annotationId: string, documentId?: string): FieldGroupEntry[];
    getFieldSiblings(annotationId: string, documentId?: string): FieldGroupEntry[];
    private getFormValuesMethod;
    private getFormFieldsMethod;
    private setFormValuesMethod;
    private buildImportField;
    private isToggleField;
    private shouldRegenerateWidgetAppearances;
    private getFieldBatchTarget;
    private readFieldWidgets;
    private syncFieldBatch;
    private resolveWidgetPage;
    private getPageFormAnnoWidgets;
    private setFormFieldValues;
    private findConflictingFieldGroups;
    private renameFieldMethod;
    private shareFieldMethod;
    private selectFieldMethod;
    private deselectFieldMethod;
    private getSelectedFieldId;
    private selectNextFieldMethod;
    private selectPreviousFieldMethod;
    private activateFieldMethod;
    private renderWidget;
    destroy(): Promise<void>;
}
