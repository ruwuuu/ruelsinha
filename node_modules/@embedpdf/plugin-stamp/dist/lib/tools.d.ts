import { PdfAnnotationSubtype } from '@embedpdf/models';
export declare const RUBBER_STAMP_TOOL_ID: "rubberStamp";
export declare const rubberStampTool: {
    readonly id: "rubberStamp";
    readonly name: "Rubber Stamp";
    readonly labelKey: "stamp.rubberStamp";
    readonly categories: ["annotation", "stamp", "insert"];
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
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, "rubberStamp">;
};
export declare const stampTools: {
    readonly id: "rubberStamp";
    readonly name: "Rubber Stamp";
    readonly labelKey: "stamp.rubberStamp";
    readonly categories: ["annotation", "stamp", "insert"];
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
    readonly pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, "rubberStamp">;
}[];
