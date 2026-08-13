import { PdfAnnotationBorderStyle, PdfAnnotationLineEnding, PdfAnnotationSubtype, PdfBlendMode, PdfStandardFont, PdfTextAlignment, PdfVerticalAlignment } from '@embedpdf/models';
import { ToolMapFromList } from './types';
export declare const defaultTools: ({
    id: "highlight";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        textSelection: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.HIGHLIGHT;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode: PdfBlendMode.Multiply;
    };
} | {
    id: "underline";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        textSelection: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.UNDERLINE;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
} | {
    id: "strikeout";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        textSelection: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.STRIKEOUT;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
} | {
    id: "squiggly";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        textSelection: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.SQUIGGLY;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
} | {
    id: "insertText";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1 | 2;
    interaction: {
        exclusive: false;
        textSelection: true;
        showSelectionRects: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.CARET;
        strokeColor: string;
        opacity: number;
        intent: string;
    };
    selectionHandler: import('..').SelectionHandlerFactory<import('@embedpdf/models').PdfCaretAnnoObject>;
} | {
    id: "replaceText";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 2;
    interaction: {
        exclusive: false;
        textSelection: true;
        isDraggable: false;
        isResizable: false;
        isRotatable: false;
        isGroupDraggable: false;
        isGroupResizable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.STRIKEOUT;
        strokeColor: string;
        opacity: number;
        intent: string;
    };
    selectionHandler: import('..').SelectionHandlerFactory<import('@embedpdf/models').PdfStrikeOutAnnoObject>;
} | {
    id: "ink";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 5;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: false;
        lockGroupAspectRatio?: undefined;
    };
    defaults: {
        type: PdfAnnotationSubtype.INK;
        strokeColor: string;
        color: string;
        opacity: number;
        strokeWidth: number;
        intent?: undefined;
        blendMode?: undefined;
    };
    behavior: {
        commitDelay: number;
        smartLineRecognition?: undefined;
        smartLineThreshold?: undefined;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfInkAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfInkAnnoObject, string>;
} | {
    id: "inkHighlighter";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: false;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.INK;
        intent: string;
        strokeColor: string;
        color: string;
        opacity: number;
        strokeWidth: number;
        blendMode: PdfBlendMode.Multiply;
    };
    behavior: {
        commitDelay: number;
        smartLineRecognition: true;
        smartLineThreshold: number;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfInkAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfInkAnnoObject, string>;
} | {
    id: "circle";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: false;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.CIRCLE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        strokeStyle: PdfAnnotationBorderStyle.SOLID;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfCircleAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfCircleAnnoObject, string>;
} | {
    id: "square";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: false;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.SQUARE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        strokeStyle: PdfAnnotationBorderStyle.SOLID;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfSquareAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfSquareAnnoObject, string>;
} | {
    id: "line";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 5;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        lockAspectRatio: false;
        isGroupResizable: true;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.LINE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        intent?: undefined;
        lineEndings?: undefined;
    };
    clickBehavior: {
        enabled: true;
        defaultLength: number;
        defaultAngle: number;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfLineAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfLineAnnoObject, string>;
} | {
    id: "lineArrow";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        lockAspectRatio: false;
        isGroupResizable: true;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.LINE;
        intent: string;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        lineEndings: {
            start: PdfAnnotationLineEnding.None;
            end: PdfAnnotationLineEnding.OpenArrow;
        };
    };
    clickBehavior: {
        enabled: true;
        defaultLength: number;
        defaultAngle: number;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfLineAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfLineAnnoObject, string>;
} | {
    id: "polyline";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        lockAspectRatio: false;
        isGroupResizable: true;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.POLYLINE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfPolylineAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfPolylineAnnoObject, string>;
} | {
    id: "polygon";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        lockAspectRatio: false;
        isGroupResizable: true;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.POLYGON;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfPolygonAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfPolygonAnnoObject, string>;
} | {
    id: "textComment";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        isRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.TEXT;
        strokeColor: string;
        opacity: number;
    };
    behavior: {
        selectAfterCreate: true;
    };
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfTextAnnoObject, string>;
} | {
    id: "freeText";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: false;
        lockGroupAspectRatio: (a: import('@embedpdf/models').PdfAnnotationObject) => boolean;
    };
    defaults: {
        type: PdfAnnotationSubtype.FREETEXT;
        contents: string;
        fontSize: number;
        fontColor: string;
        fontFamily: PdfStandardFont.Helvetica;
        textAlign: PdfTextAlignment.Left;
        verticalAlign: PdfVerticalAlignment.Top;
        color: string;
        backgroundColor: string;
        opacity: number;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
        defaultContent: string;
    };
    behavior: {
        insertUpright: true;
        editAfterCreate: true;
        selectAfterCreate: true;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfFreeTextAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfFreeTextAnnoObject, string>;
} | {
    id: "freeTextCallout";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: false;
        isRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.FREETEXT;
        intent: string;
        contents: string;
        fontSize: number;
        fontColor: string;
        fontFamily: PdfStandardFont.Helvetica;
        textAlign: PdfTextAlignment.Left;
        verticalAlign: PdfVerticalAlignment.Top;
        color: string;
        opacity: number;
        lineEnding: PdfAnnotationLineEnding.OpenArrow;
        strokeColor: string;
        strokeWidth: number;
    };
    behavior: {
        insertUpright: true;
        editAfterCreate: true;
        selectAfterCreate: true;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfFreeTextAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfFreeTextAnnoObject, string>;
} | {
    id: "stamp";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        lockAspectRatio: true;
        lockGroupAspectRatio: true;
    };
    defaults: {
        type: PdfAnnotationSubtype.STAMP;
    };
    behavior: {
        insertUpright: true;
        useAppearanceStream: false;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfStampAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, string>;
} | {
    id: "link";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: import('@embedpdf/models').PdfAnnotationObject) => 0 | 1;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.LINK;
        strokeColor: string;
        strokeWidth: number;
        strokeStyle: PdfAnnotationBorderStyle.UNDERLINE;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfLinkAnnoObject, string>;
})[];
export type DefaultAnnotationTool = (typeof defaultTools)[number];
export type DefaultAnnotationToolMap = ToolMapFromList<typeof defaultTools>;
