import { PdfStampAnnoObject } from '@embedpdf/models';
import { HandlerFactory } from '@embedpdf/plugin-annotation';
import { SIGNATURE_STAMP_TOOL_ID } from '../tools';
export declare const signatureStampHandlerFactory: HandlerFactory<PdfStampAnnoObject, typeof SIGNATURE_STAMP_TOOL_ID>;
