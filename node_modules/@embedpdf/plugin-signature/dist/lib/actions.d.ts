import { Action } from '@embedpdf/core';
export declare const ADD_SIGNATURE_ENTRY = "SIGNATURE/ADD_ENTRY";
export declare const REMOVE_SIGNATURE_ENTRY = "SIGNATURE/REMOVE_ENTRY";
export interface AddSignatureEntryAction extends Action {
    type: typeof ADD_SIGNATURE_ENTRY;
    payload: string;
}
export interface RemoveSignatureEntryAction extends Action {
    type: typeof REMOVE_SIGNATURE_ENTRY;
    payload: string;
}
export type SignatureAction = AddSignatureEntryAction | RemoveSignatureEntryAction;
export declare function addSignatureEntry(id: string): AddSignatureEntryAction;
export declare function removeSignatureEntry(id: string): RemoveSignatureEntryAction;
