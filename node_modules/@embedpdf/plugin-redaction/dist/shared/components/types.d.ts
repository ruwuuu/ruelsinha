import { SelectionMenuPropsBase, SelectionMenuRenderFn } from '../../react/utils.ts';
import { RedactionItem } from '../../index.ts';
export interface RedactionSelectionContext {
    type: 'redaction';
    item: RedactionItem;
    pageIndex: number;
}
export type RedactionSelectionMenuProps = SelectionMenuPropsBase<RedactionSelectionContext>;
export type RedactionSelectionMenuRenderFn = SelectionMenuRenderFn<RedactionSelectionContext>;
