import { Reducer } from '@embedpdf/core';
import { AnnotationAction } from './actions';
import { AnnotationPluginConfig, AnnotationState, AnnotationDocumentState } from './types';
export declare const initialDocumentState: (cfg?: AnnotationPluginConfig) => AnnotationDocumentState;
export declare const initialState: (cfg: AnnotationPluginConfig) => AnnotationState;
export declare const reducer: Reducer<AnnotationState, AnnotationAction>;
