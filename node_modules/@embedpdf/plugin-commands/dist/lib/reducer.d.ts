import { Reducer } from '@embedpdf/core';
import { CommandsState } from './types';
import { CommandsAction } from './actions';
export declare const initialState: CommandsState;
export declare const commandsReducer: Reducer<CommandsState, CommandsAction>;
