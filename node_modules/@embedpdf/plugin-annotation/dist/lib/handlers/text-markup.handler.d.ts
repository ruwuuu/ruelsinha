import { SelectionHandlerFactory } from './types';
/**
 * Default selection handler for text-markup tools (highlight, underline,
 * strikeout, squiggly). Used as a fallback when no tool-specific
 * SelectionHandlerFactory is registered.
 */
export declare const textMarkupSelectionHandler: SelectionHandlerFactory;
