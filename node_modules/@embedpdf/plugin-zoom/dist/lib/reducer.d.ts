import { Reducer } from '@embedpdf/core';
import { ZoomAction } from './actions';
import { ZoomState, ZoomDocumentState } from './types';
export declare const initialDocumentState: ZoomDocumentState;
export declare const initialState: ZoomState;
export declare const zoomReducer: Reducer<ZoomState, ZoomAction>;
