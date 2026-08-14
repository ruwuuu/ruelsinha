import { SelectionMenuPropsBase, SelectionMenuRenderFn, SelectionMenuRenderResult } from '@embedpdf/utils/svelte';
import { RedactionItem } from '../lib/index.ts';
export interface RedactionSelectionContext {
    type: 'redaction';
    item: RedactionItem;
    pageIndex: number;
}
export type RedactionSelectionMenuProps = SelectionMenuPropsBase<RedactionSelectionContext>;
export type RedactionSelectionMenuRenderFn = SelectionMenuRenderFn<RedactionSelectionContext>;
export type { SelectionMenuRenderResult };
