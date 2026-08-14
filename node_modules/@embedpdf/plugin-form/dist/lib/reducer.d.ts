import { Reducer } from '@embedpdf/core';
import { FormDocumentState, FormState } from './types';
import { FormAction } from './actions';
export declare const initialDocumentState: FormDocumentState;
export declare const initialState: FormState;
export declare const reducer: Reducer<FormState, FormAction>;
