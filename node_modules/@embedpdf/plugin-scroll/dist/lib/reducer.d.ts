import { Reducer, CoreState } from '@embedpdf/core';
import { ScrollState, ScrollPluginConfig, PageChangeState } from './types';
import { ScrollAction } from './actions';
export declare const defaultPageChangeState: PageChangeState;
export declare const initialState: (coreState: CoreState, config: ScrollPluginConfig) => ScrollState;
export declare const scrollReducer: Reducer<ScrollState, ScrollAction>;
