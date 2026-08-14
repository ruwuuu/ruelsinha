import { ToolMapFromList } from './types';
import { defaultTools } from './default-tools';
export type ToolMap = ToolMapFromList<typeof defaultTools>;
/**
 * A factory that creates a type-safe predicate function for a specific tool ID.
 * This is more reliable for TypeScript's type inference than a single generic function.
 */
export declare function createToolPredicate<K extends keyof ToolMap>(id: K): (tool: {
    id: string;
} | undefined) => tool is ToolMap[K];
export declare const isHighlightTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.HIGHLIGHT;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode: import("@embedpdf/models").PdfBlendMode.Multiply;
    };
};
export declare const isSquigglyTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.SQUIGGLY;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
};
export declare const isUnderlineTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.UNDERLINE;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
};
export declare const isStrikeoutTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.STRIKEOUT;
        strokeColor: string;
        color: string;
        opacity: number;
        blendMode?: undefined;
    };
};
export declare const isInkTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.INK;
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
};
export declare const isInkHighlighterTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.INK;
        intent: string;
        strokeColor: string;
        color: string;
        opacity: number;
        strokeWidth: number;
        blendMode: import("@embedpdf/models").PdfBlendMode.Multiply;
    };
    behavior: {
        commitDelay: number;
        smartLineRecognition: true;
        smartLineThreshold: number;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfInkAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfInkAnnoObject, string>;
};
export declare const isSquareTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.SQUARE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        strokeStyle: import("@embedpdf/models").PdfAnnotationBorderStyle.SOLID;
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
};
export declare const isCircleTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.CIRCLE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
        strokeStyle: import("@embedpdf/models").PdfAnnotationBorderStyle.SOLID;
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
};
export declare const isLineTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.LINE;
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
};
export declare const isPolylineTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.POLYLINE;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfPolylineAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfPolylineAnnoObject, string>;
};
export declare const isPolygonTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.POLYGON;
        color: string;
        opacity: number;
        strokeWidth: number;
        strokeColor: string;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfPolygonAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfPolygonAnnoObject, string>;
};
export declare const isFreeTextTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.FREETEXT;
        contents: string;
        fontSize: number;
        fontColor: string;
        fontFamily: import("@embedpdf/models").PdfStandardFont.Helvetica;
        textAlign: import("@embedpdf/models").PdfTextAlignment.Left;
        verticalAlign: import("@embedpdf/models").PdfVerticalAlignment.Top;
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
};
export declare const isStampTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.STAMP;
    };
    behavior: {
        insertUpright: true;
        useAppearanceStream: false;
    };
    transform: import('..').PatchFunction<import('@embedpdf/models').PdfStampAnnoObject>;
    pointerHandler: import('..').HandlerFactory<import('@embedpdf/models').PdfStampAnnoObject, string>;
};
export declare const isInsertTextTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.CARET;
        strokeColor: string;
        opacity: number;
        intent: string;
    };
    selectionHandler: import('..').SelectionHandlerFactory<import('@embedpdf/models').PdfCaretAnnoObject>;
};
export declare const isReplaceTextTool: (tool: {
    id: string;
} | undefined) => tool is {
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
        type: import("@embedpdf/models").PdfAnnotationSubtype.STRIKEOUT;
        strokeColor: string;
        opacity: number;
        intent: string;
    };
    selectionHandler: import('..').SelectionHandlerFactory<import('@embedpdf/models').PdfStrikeOutAnnoObject>;
};
