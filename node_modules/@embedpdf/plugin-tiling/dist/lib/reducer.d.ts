import { Reducer } from '@embedpdf/core';
import { TilingAction } from './actions';
import { TilingDocumentState, TilingState } from './types';
export declare const initialTilingDocumentState: TilingDocumentState;
export declare const initialState: TilingState;
export declare const tilingReducer: Reducer<TilingState, TilingAction>;
