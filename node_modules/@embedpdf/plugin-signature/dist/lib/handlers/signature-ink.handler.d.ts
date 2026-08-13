import { PdfInkAnnoObject } from '@embedpdf/models';
import { HandlerFactory } from '@embedpdf/plugin-annotation';
import { SIGNATURE_INK_TOOL_ID } from '../tools';
export declare const signatureInkHandlerFactory: HandlerFactory<PdfInkAnnoObject, typeof SIGNATURE_INK_TOOL_ID>;
