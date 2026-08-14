import { PdfAnnotationSubtype } from '@embedpdf/models';
import { patching } from '@embedpdf/plugin-annotation';
export declare const SIGNATURE_STAMP_TOOL_ID: "signatureStamp";
export declare const SIGNATURE_INK_TOOL_ID: "signatureInk";
export declare const signatureStampTool: {
    readonly id: "signatureStamp";
    readonly name: "Signature Stamp";
    readonly labelKey: "signature.stamp";
    readonly categories: ["annotation", "signature", "insert"];
    readonly matchScore: () => number;
    readonly interaction: {
        readonly exclusive: true;
        readonly cursor: "copy";
        readonly isDraggable: true;
        readonly isResizable: true;
        readonly isRotatable: false;
        readonly lockAspectRatio: true;
        readonly isGroupDraggable: true;
        readonly isGroupResizable: false;
        readonly isGroupRotatable: false;
    };
    readonly defaults: {
        readonly type: PdfAnnotationSubtype.STAMP;
    };
    readonly behavior: {
        readonly deactivateToolAfterCreate: true;
        readonly selectAfterCreate: true;
        readonly insertUpright: true;
        readonly useAppearanceStream: true;
    };
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, "signatureStamp">;
};
export declare const signatureInkTool: {
    readonly id: "signatureInk";
    readonly name: "Signature Ink";
    readonly labelKey: "signature.ink";
    readonly categories: ["annotation", "signature", "insert"];
    readonly matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 20;
    readonly interaction: {
        readonly exclusive: true;
        readonly cursor: "copy";
        readonly isDraggable: true;
        readonly isResizable: true;
        readonly isRotatable: false;
        readonly lockAspectRatio: true;
        readonly isGroupDraggable: true;
        readonly isGroupResizable: false;
        readonly isGroupRotatable: false;
    };
    readonly defaults: {
        readonly type: PdfAnnotationSubtype.INK;
    };
    readonly behavior: {
        readonly deactivateToolAfterCreate: true;
        readonly selectAfterCreate: true;
    };
    readonly transform: patching.PatchFunction<import('@embedpdf/models').PdfInkAnnoObject>;
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfInkAnnoObject, "signatureInk">;
};
export declare const signatureTools: ({
    readonly id: "signatureStamp";
    readonly name: "Signature Stamp";
    readonly labelKey: "signature.stamp";
    readonly categories: ["annotation", "signature", "insert"];
    readonly matchScore: () => number;
    readonly interaction: {
        readonly exclusive: true;
        readonly cursor: "copy";
        readonly isDraggable: true;
        readonly isResizable: true;
        readonly isRotatable: false;
        readonly lockAspectRatio: true;
        readonly isGroupDraggable: true;
        readonly isGroupResizable: false;
        readonly isGroupRotatable: false;
    };
    readonly defaults: {
        readonly type: PdfAnnotationSubtype.STAMP;
    };
    readonly behavior: {
        readonly deactivateToolAfterCreate: true;
        readonly selectAfterCreate: true;
        readonly insertUpright: true;
        readonly useAppearanceStream: true;
    };
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, "signatureStamp">;
} | {
    readonly id: "signatureInk";
    readonly name: "Signature Ink";
    readonly labelKey: "signature.ink";
    readonly categories: ["annotation", "signature", "insert"];
    readonly matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 20;
    readonly interaction: {
        readonly exclusive: true;
        readonly cursor: "copy";
        readonly isDraggable: true;
        readonly isResizable: true;
        readonly isRotatable: false;
        readonly lockAspectRatio: true;
        readonly isGroupDraggable: true;
        readonly isGroupResizable: false;
        readonly isGroupRotatable: false;
    };
    readonly defaults: {
        readonly type: PdfAnnotationSubtype.INK;
    };
    readonly behavior: {
        readonly deactivateToolAfterCreate: true;
        readonly selectAfterCreate: true;
    };
    readonly transform: patching.PatchFunction<import('@embedpdf/models').PdfInkAnnoObject>;
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfInkAnnoObject, "signatureInk">;
})[];
