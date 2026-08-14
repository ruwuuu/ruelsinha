import { Action } from '@embedpdf/core';
export declare const SET_DISABLED_CATEGORIES = "COMMANDS/SET_DISABLED_CATEGORIES";
export interface SetDisabledCategoriesAction extends Action {
    type: typeof SET_DISABLED_CATEGORIES;
    payload: string[];
}
export type CommandsAction = SetDisabledCategoriesAction;
export declare const setDisabledCategories: (categories: string[]) => SetDisabledCategoriesAction;
