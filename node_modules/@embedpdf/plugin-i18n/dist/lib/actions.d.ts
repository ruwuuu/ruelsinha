import { Action } from '@embedpdf/core';
import { LocaleCode } from './types';
export declare const SET_LOCALE = "I18N/SET_LOCALE";
export declare const REGISTER_LOCALE = "I18N/REGISTER_LOCALE";
export interface SetLocaleAction extends Action {
    type: typeof SET_LOCALE;
    payload: LocaleCode;
}
export interface RegisterLocaleAction extends Action {
    type: typeof REGISTER_LOCALE;
    payload: LocaleCode;
}
export type I18nAction = SetLocaleAction | RegisterLocaleAction;
export declare const setLocale: (locale: LocaleCode) => SetLocaleAction;
export declare const registerLocale: (locale: LocaleCode) => RegisterLocaleAction;
