import { SelectionMenuRenderFn, SelectionMenuPropsBase } from '../react/utils.ts';
export interface SelectionSelectionContext {
    type: 'selection';
    pageIndex: number;
}
export type SelectionSelectionMenuRenderFn = SelectionMenuRenderFn<SelectionSelectionContext>;
export type SelectionSelectionMenuProps = SelectionMenuPropsBase<SelectionSelectionContext>;
