import { Reducer } from '@embedpdf/core';
import { SignatureAction } from './actions';
import { SignatureState } from './types';
export declare const initialState: SignatureState;
export declare const signatureReducer: Reducer<SignatureState, SignatureAction>;
