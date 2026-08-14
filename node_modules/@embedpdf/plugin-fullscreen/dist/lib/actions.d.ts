import { Action } from '@embedpdf/core';
export declare const SET_FULLSCREEN = "SET_FULLSCREEN";
export interface SetFullscreenAction extends Action {
    type: typeof SET_FULLSCREEN;
    payload: boolean;
}
export type FullscreenAction = SetFullscreenAction;
export declare function setFullscreen(payload: boolean): SetFullscreenAction;
