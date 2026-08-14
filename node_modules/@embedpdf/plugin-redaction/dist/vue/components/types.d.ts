import { SelectionMenuPropsBase, SelectionMenuRenderFn } from '@embedpdf/utils/vue';
import { RedactionItem } from '../../lib';
export interface RedactionSelectionContext {
    type: 'redaction';
    item: RedactionItem;
    pageIndex: number;
}
export type RedactionSelectionMenuProps = SelectionMenuPropsBase<RedactionSelectionContext>;
export type RedactionSelectionMenuRenderFn = SelectionMenuRenderFn<RedactionSelectionContext>;
