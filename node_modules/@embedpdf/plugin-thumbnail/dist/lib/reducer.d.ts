import { Reducer } from '@embedpdf/core';
import { ThumbnailAction } from './actions';
import { ThumbnailState, ThumbnailDocumentState } from './types';
export declare const initialDocumentState: ThumbnailDocumentState;
export declare const initialState: ThumbnailState;
export declare const thumbnailReducer: Reducer<ThumbnailState, ThumbnailAction>;
