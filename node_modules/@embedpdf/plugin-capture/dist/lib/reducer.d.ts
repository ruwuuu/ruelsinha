import { Reducer } from '@embedpdf/core';
import { CaptureAction } from './actions';
import { CaptureState, CaptureDocumentState } from './types';
export declare const initialDocumentState: CaptureDocumentState;
export declare const initialState: CaptureState;
export declare const captureReducer: Reducer<CaptureState, CaptureAction>;
