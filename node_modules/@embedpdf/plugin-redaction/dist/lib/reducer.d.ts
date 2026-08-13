import { Reducer } from '@embedpdf/core';
import { RedactionState, RedactionDocumentState } from './types';
import { RedactionAction } from './actions';
export declare const initialDocumentState: RedactionDocumentState;
export declare const initialState: RedactionState;
export declare const redactionReducer: Reducer<RedactionState, RedactionAction>;
