import { PdfCaretAnnoObject } from '@embedpdf/models';
import { SelectionHandlerFactory } from './types';
/**
 * Selection handler for the "Insert Text" tool.
 * Creates a single Caret annotation at the end of the text selection
 * with intent "Insert".
 */
export declare const insertTextSelectionHandler: SelectionHandlerFactory<PdfCaretAnnoObject>;
