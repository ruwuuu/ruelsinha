import { Reducer } from '@embedpdf/core';
import { RotateAction } from './actions';
import { RotateState, RotateDocumentState } from './types';
export declare const initialDocumentState: RotateDocumentState;
export declare const initialState: RotateState;
export declare const rotateReducer: Reducer<RotateState, RotateAction>;
