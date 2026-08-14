import { PdfAnnotationObject, PdfAnnotationSubtype } from '@embedpdf/models';
import { RedactionMode } from './types';
/**
 * Unified Redact tool - handles both text-based and area-based redactions.
 * Dynamically determines isDraggable/isResizable based on whether it has segmentRects.
 */
export declare const redactTool: {
    id: string;
    name: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        mode: RedactionMode;
        exclusive: false;
        cursor: string;
        textSelection: true;
        isDraggable: (anno: PdfAnnotationObject) => boolean;
        isResizable: (anno: PdfAnnotationObject) => boolean;
        isRotatable: false;
        lockAspectRatio: false;
        isGroupDraggable: false;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.REDACT;
        color: string;
        overlayColor: string;
        strokeColor: string;
        opacity: number;
    };
    behavior: {
        useAppearanceStream: false;
    };
};
export declare const redactTools: {
    id: string;
    name: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        mode: RedactionMode;
        exclusive: false;
        cursor: string;
        textSelection: true;
        isDraggable: (anno: PdfAnnotationObject) => boolean;
        isResizable: (anno: PdfAnnotationObject) => boolean;
        isRotatable: false;
        lockAspectRatio: false;
        isGroupDraggable: false;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.REDACT;
        color: string;
        overlayColor: string;
        strokeColor: string;
        opacity: number;
    };
    behavior: {
        useAppearanceStream: false;
    };
}[];
