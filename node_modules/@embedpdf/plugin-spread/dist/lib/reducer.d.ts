import { Reducer } from '@embedpdf/core';
import { SpreadAction } from './actions';
import { SpreadState, SpreadDocumentState } from './types';
export declare const initialDocumentState: SpreadDocumentState;
export declare const initialState: SpreadState;
export declare const spreadReducer: Reducer<SpreadState, SpreadAction>;
