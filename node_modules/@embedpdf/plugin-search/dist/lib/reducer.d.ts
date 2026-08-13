import { Reducer } from '@embedpdf/core';
import { SearchDocumentState, SearchState } from './types';
import { SearchAction } from './actions';
export declare const initialSearchDocumentState: SearchDocumentState;
export declare const initialState: SearchState;
export declare const searchReducer: Reducer<SearchState, SearchAction>;
