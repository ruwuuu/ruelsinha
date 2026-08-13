import { PdfStrikeOutAnnoObject } from '@embedpdf/models';
import { SelectionHandlerFactory } from './types';
/**
 * Selection handler for the "Replace Text" tool.
 * Creates a Caret annotation (group leader, intent "Replace") at the end
 * of the selection, plus a StrikeOut annotation (intent "StrikeOutTextEdit")
 * over the full selection, linked to the Caret via IRT/RT=Group.
 */
export declare const replaceTextSelectionHandler: SelectionHandlerFactory<PdfStrikeOutAnnoObject>;
