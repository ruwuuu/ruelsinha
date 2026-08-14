import { PdfStampAnnoObject } from '@embedpdf/models';
import { HandlerFactory } from '@embedpdf/plugin-annotation';
import { RUBBER_STAMP_TOOL_ID } from '../tools';
export declare const rubberStampHandlerFactory: HandlerFactory<PdfStampAnnoObject, typeof RUBBER_STAMP_TOOL_ID>;
