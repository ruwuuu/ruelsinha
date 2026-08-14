import { Reducer } from '@embedpdf/core';
import { InteractionManagerAction } from './actions';
import { InteractionManagerState, InteractionDocumentState } from './types';
export declare const initialDocumentState: InteractionDocumentState;
export declare const initialState: InteractionManagerState;
export declare const reducer: Reducer<InteractionManagerState, InteractionManagerAction>;
