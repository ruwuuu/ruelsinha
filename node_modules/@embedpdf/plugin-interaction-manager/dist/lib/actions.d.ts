import { Action } from '@embedpdf/core';
import { InteractionExclusionRules, InteractionDocumentState } from './types';
export declare const INIT_INTERACTION_STATE = "INTERACTION/INIT_STATE";
export declare const CLEANUP_INTERACTION_STATE = "INTERACTION/CLEANUP_STATE";
export declare const ACTIVATE_MODE = "INTERACTION/ACTIVATE_MODE";
export declare const PAUSE_INTERACTION = "INTERACTION/PAUSE";
export declare const RESUME_INTERACTION = "INTERACTION/RESUME";
export declare const SET_CURSOR = "INTERACTION/SET_CURSOR";
export declare const SET_ACTIVE_DOCUMENT = "INTERACTION/SET_ACTIVE_DOCUMENT";
export declare const SET_DEFAULT_MODE = "INTERACTION/SET_DEFAULT_MODE";
export declare const SET_EXCLUSION_RULES = "INTERACTION/SET_EXCLUSION_RULES";
export declare const ADD_EXCLUSION_CLASS = "INTERACTION/ADD_EXCLUSION_CLASS";
export declare const REMOVE_EXCLUSION_CLASS = "INTERACTION/REMOVE_EXCLUSION_CLASS";
export declare const ADD_EXCLUSION_ATTRIBUTE = "INTERACTION/ADD_EXCLUSION_ATTRIBUTE";
export declare const REMOVE_EXCLUSION_ATTRIBUTE = "INTERACTION/REMOVE_EXCLUSION_ATTRIBUTE";
export interface InitInteractionStateAction extends Action {
    type: typeof INIT_INTERACTION_STATE;
    payload: {
        documentId: string;
        state: InteractionDocumentState;
    };
}
export interface CleanupInteractionStateAction extends Action {
    type: typeof CLEANUP_INTERACTION_STATE;
    payload: string;
}
export interface SetActiveDocumentAction extends Action {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string | null;
}
export interface ActivateModeAction extends Action {
    type: typeof ACTIVATE_MODE;
    payload: {
        documentId: string;
        mode: string;
    };
}
export interface PauseInteractionAction extends Action {
    type: typeof PAUSE_INTERACTION;
    payload: string;
}
export interface ResumeInteractionAction extends Action {
    type: typeof RESUME_INTERACTION;
    payload: string;
}
export interface SetCursorAction extends Action {
    type: typeof SET_CURSOR;
    payload: {
        documentId: string;
        cursor: string;
    };
}
export interface SetDefaultModeAction extends Action {
    type: typeof SET_DEFAULT_MODE;
    payload: {
        mode: string;
    };
}
export interface SetExclusionRulesAction extends Action {
    type: typeof SET_EXCLUSION_RULES;
    payload: {
        rules: InteractionExclusionRules;
    };
}
export interface AddExclusionClassAction extends Action {
    type: typeof ADD_EXCLUSION_CLASS;
    payload: {
        className: string;
    };
}
export interface RemoveExclusionClassAction extends Action {
    type: typeof REMOVE_EXCLUSION_CLASS;
    payload: {
        className: string;
    };
}
export interface AddExclusionAttributeAction extends Action {
    type: typeof ADD_EXCLUSION_ATTRIBUTE;
    payload: {
        attribute: string;
    };
}
export interface RemoveExclusionAttributeAction extends Action {
    type: typeof REMOVE_EXCLUSION_ATTRIBUTE;
    payload: {
        attribute: string;
    };
}
export type InteractionManagerAction = InitInteractionStateAction | CleanupInteractionStateAction | SetActiveDocumentAction | ActivateModeAction | PauseInteractionAction | ResumeInteractionAction | SetCursorAction | SetDefaultModeAction | SetExclusionRulesAction | AddExclusionClassAction | RemoveExclusionClassAction | AddExclusionAttributeAction | RemoveExclusionAttributeAction;
export declare function initInteractionState(documentId: string, state: InteractionDocumentState): InitInteractionStateAction;
export declare function cleanupInteractionState(documentId: string): CleanupInteractionStateAction;
export declare function setActiveDocument(documentId: string | null): SetActiveDocumentAction;
export declare function activateMode(documentId: string, mode: string): ActivateModeAction;
export declare function pauseInteraction(documentId: string): PauseInteractionAction;
export declare function resumeInteraction(documentId: string): ResumeInteractionAction;
export declare function setCursor(documentId: string, cursor: string): SetCursorAction;
export declare function setDefaultMode(mode: string): SetDefaultModeAction;
export declare function setExclusionRules(rules: InteractionExclusionRules): SetExclusionRulesAction;
export declare function addExclusionClass(className: string): AddExclusionClassAction;
export declare function removeExclusionClass(className: string): RemoveExclusionClassAction;
export declare function addExclusionAttribute(attribute: string): AddExclusionAttributeAction;
export declare function removeExclusionAttribute(attribute: string): RemoveExclusionAttributeAction;
