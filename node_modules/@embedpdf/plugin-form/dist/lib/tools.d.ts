import { PdfAnnotationObject, PdfAnnotationSubtype, PDF_FORM_FIELD_TYPE, PDF_FORM_FIELD_FLAG, PdfWidgetAnnoObject, PdfStandardFont } from '@embedpdf/models';
export declare const formTextFieldTool: {
    id: "formTextField";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.TEXTFIELD;
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
};
export declare const formCheckboxTool: {
    id: "formCheckbox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.CHECKBOX;
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
};
export declare const formRadioButtonTool: {
    id: "formRadioButton";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        lockAspectRatio: true;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: number;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.RADIOBUTTON;
            options: never[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
};
export declare const formComboboxTool: {
    id: "formCombobox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.COMBOBOX;
            options: ({
                label: string;
                isSelected: true;
            } | {
                label: string;
                isSelected: false;
            })[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
};
export declare const formListboxTool: {
    id: "formListbox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.LISTBOX;
            options: ({
                label: string;
                isSelected: true;
            } | {
                label: string;
                isSelected: false;
            })[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
};
export declare const formTools: ({
    id: "formTextField";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.TEXTFIELD;
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
} | {
    id: "formCheckbox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.CHECKBOX;
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
} | {
    id: "formRadioButton";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        lockAspectRatio: true;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: number;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.RADIOBUTTON;
            options: never[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
} | {
    id: "formCombobox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.COMBOBOX;
            options: ({
                label: string;
                isSelected: true;
            } | {
                label: string;
                isSelected: false;
            })[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
} | {
    id: "formListbox";
    name: string;
    labelKey: string;
    categories: string[];
    matchScore: (a: PdfAnnotationObject) => 0 | 10;
    interaction: {
        exclusive: false;
        cursor: string;
        isDraggable: true;
        isResizable: true;
        isRotatable: false;
        isGroupDraggable: true;
        isGroupResizable: false;
        isGroupRotatable: false;
    };
    defaults: {
        type: PdfAnnotationSubtype.WIDGET;
        fontFamily: PdfStandardFont.Helvetica;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        color: string;
        strokeWidth: number;
        field: {
            flag: PDF_FORM_FIELD_FLAG.NONE;
            name: string;
            alternateName: string;
            value: string;
            type: PDF_FORM_FIELD_TYPE.LISTBOX;
            options: ({
                label: string;
                isSelected: true;
            } | {
                label: string;
                isSelected: false;
            })[];
        };
    };
    behavior: {
        useAppearanceStream: false;
    };
    clickBehavior: {
        enabled: true;
        defaultSize: {
            width: number;
            height: number;
        };
    };
    pointerHandler: import('@embedpdf/plugin-annotation').HandlerFactory<PdfWidgetAnnoObject, string>;
})[];
