import { Reducer } from '@embedpdf/core';
import { PanAction } from './actions';
import { PanState, PanDocumentState } from './types';
export declare const initialDocumentState: PanDocumentState;
export declare const initialState: PanState;
export declare const panReducer: Reducer<PanState, PanAction>;
