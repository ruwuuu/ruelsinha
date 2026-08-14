import { UIState, UIDocumentState } from './types';
import { UIAction } from './actions';
export declare const initialDocumentState: UIDocumentState;
export declare const initialState: UIState;
export declare const uiReducer: (state: UIState | undefined, action: UIAction) => UIState;
