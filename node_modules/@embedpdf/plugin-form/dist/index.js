import { clamp, BasePlugin, createScopedEmitter } from "@embedpdf/core";
import { PdfAnnotationSubtype, PdfStandardFont, uuidV4, PDF_FORM_FIELD_FLAG, PDF_FORM_FIELD_TYPE, PdfTaskHelper, PdfErrorCode, Task, isWidgetChecked, TaskSequence } from "@embedpdf/models";
import { HistoryPlugin } from "@embedpdf/plugin-history";
import { useState, useClickDetector, defineAnnotationTool } from "@embedpdf/plugin-annotation";
const FORM_PLUGIN_ID = "form";
const manifest = {
  id: FORM_PLUGIN_ID,
  name: "Form Plugin",
  version: "1.0.0",
  provides: ["form"],
  requires: ["interaction-manager"],
  optional: ["history", "annotation"],
  defaultConfig: {
    enabled: true
  }
};
const INIT_FORM_STATE = "FORM/INIT_STATE";
const CLEANUP_FORM_STATE = "FORM/CLEANUP_STATE";
const SELECT_FIELD = "FORM/SELECT_FIELD";
const DESELECT_FIELD = "FORM/DESELECT_FIELD";
function initFormState(documentId, state) {
  return { type: INIT_FORM_STATE, payload: { documentId, state } };
}
function cleanupFormState(documentId) {
  return { type: CLEANUP_FORM_STATE, payload: documentId };
}
function selectField(documentId, annotationId) {
  return { type: SELECT_FIELD, payload: { documentId, annotationId } };
}
function deselectField(documentId) {
  return { type: DESELECT_FIELD, payload: documentId };
}
const initialDocumentState = {
  selectedFieldId: null
};
const initialState = {
  documents: {}
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_FORM_STATE:
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.payload.documentId]: action.payload.state
        }
      };
    case CLEANUP_FORM_STATE: {
      const documentId = action.payload;
      const { [documentId]: _, ...remaining } = state.documents;
      return {
        ...state,
        documents: remaining
      };
    }
    case SELECT_FIELD: {
      const { documentId, annotationId } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selectedFieldId: annotationId
          }
        }
      };
    }
    case DESELECT_FIELD: {
      const documentId = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selectedFieldId: null
          }
        }
      };
    }
    default:
      return state;
  }
};
const textFieldHandlerFactory = {
  annotationType: PdfAnnotationSubtype.WIDGET,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        fontFamily: tool.defaults.fontFamily ?? PdfStandardFont.Helvetica,
        fontSize: tool.defaults.fontSize ?? 12,
        fontColor: tool.defaults.fontColor ?? "#000000",
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        color: tool.defaults.color ?? "#FFFFFF",
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        field: tool.defaults.field
      };
    };
    const buildRect = (start, end) => {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
      return {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
    };
    const buildAnnotation = (rect) => {
      var _a;
      const defaults = getDefaults();
      const fieldName = `TextField_${uuidV4().slice(0, 8)}`;
      return {
        ...defaults,
        type: PdfAnnotationSubtype.WIDGET,
        id: uuidV4(),
        pageIndex,
        rect,
        created: /* @__PURE__ */ new Date(),
        fontFamily: defaults.fontFamily,
        fontSize: defaults.fontSize,
        fontColor: defaults.fontColor,
        strokeColor: defaults.strokeColor,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        field: {
          type: PDF_FORM_FIELD_TYPE.TEXTFIELD,
          flag: ((_a = defaults.field) == null ? void 0 : _a.flag) ?? PDF_FORM_FIELD_FLAG.NONE,
          name: fieldName,
          alternateName: fieldName,
          value: ""
        }
      };
    };
    const clickDetector = useClickDetector({
      getTool,
      onClickDetected: (pos) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const tool = getTool();
        const clickConfig = tool == null ? void 0 : tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const x = clamp(pos.x - width / 2, 0, pageSize.width - width);
        const y = clamp(pos.y - height / 2, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        onCommit(buildAnnotation(rect));
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = buildRect(start, current);
      return {
        type: PdfAnnotationSubtype.WIDGET,
        bounds: rect,
        data: { rect, ...defaults }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const rect = buildRect(start, clampedPos);
          if (rect.size.width > 5 && rect.size.height > 5) {
            onCommit(buildAnnotation(rect));
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const checkboxHandlerFactory = {
  annotationType: PdfAnnotationSubtype.WIDGET,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        color: tool.defaults.color ?? "#FFFFFF",
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        field: tool.defaults.field
      };
    };
    const buildRect = (start, end) => {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
      return {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
    };
    const buildAnnotation = (rect) => {
      var _a;
      const defaults = getDefaults();
      const fieldName = `Checkbox_${uuidV4().slice(0, 8)}`;
      return {
        ...defaults,
        type: PdfAnnotationSubtype.WIDGET,
        id: uuidV4(),
        pageIndex,
        rect,
        created: /* @__PURE__ */ new Date(),
        strokeColor: defaults.strokeColor,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        exportValue: "Yes",
        field: {
          type: PDF_FORM_FIELD_TYPE.CHECKBOX,
          flag: ((_a = defaults.field) == null ? void 0 : _a.flag) ?? PDF_FORM_FIELD_FLAG.NONE,
          name: fieldName,
          alternateName: fieldName,
          value: "Off"
        }
      };
    };
    const clickDetector = useClickDetector({
      getTool,
      onClickDetected: (pos) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const tool = getTool();
        const clickConfig = tool == null ? void 0 : tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const x = clamp(pos.x - width / 2, 0, pageSize.width - width);
        const y = clamp(pos.y - height / 2, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        onCommit(buildAnnotation(rect));
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = buildRect(start, current);
      return {
        type: PdfAnnotationSubtype.WIDGET,
        bounds: rect,
        data: { rect, ...defaults }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const rect = buildRect(start, clampedPos);
          if (rect.size.width > 5 && rect.size.height > 5) {
            onCommit(buildAnnotation(rect));
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const radioButtonHandlerFactory = {
  annotationType: PdfAnnotationSubtype.WIDGET,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        color: tool.defaults.color ?? "#FFFFFF",
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        field: tool.defaults.field
      };
    };
    const buildRect = (start, end) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const side = Math.max(Math.abs(dx), Math.abs(dy));
      const sx = dx < 0 ? -side : side;
      const sy = dy < 0 ? -side : side;
      const minX = Math.min(start.x, start.x + sx);
      const minY = Math.min(start.y, start.y + sy);
      return {
        origin: { x: minX, y: minY },
        size: { width: side, height: side }
      };
    };
    const buildAnnotation = (rect) => {
      var _a;
      const defaults = getDefaults();
      const fieldName = `RadioButton_${uuidV4().slice(0, 8)}`;
      const id = uuidV4();
      return {
        ...defaults,
        type: PdfAnnotationSubtype.WIDGET,
        id,
        pageIndex,
        rect,
        created: /* @__PURE__ */ new Date(),
        strokeColor: defaults.strokeColor,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        exportValue: id,
        field: {
          type: PDF_FORM_FIELD_TYPE.RADIOBUTTON,
          flag: ((_a = defaults.field) == null ? void 0 : _a.flag) ?? PDF_FORM_FIELD_FLAG.BUTTON_RADIO | PDF_FORM_FIELD_FLAG.BUTTON_NOTOGGLETOOFF,
          name: fieldName,
          alternateName: fieldName,
          value: "Off",
          options: []
        }
      };
    };
    const clickDetector = useClickDetector({
      getTool,
      onClickDetected: (pos) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const tool = getTool();
        const clickConfig = tool == null ? void 0 : tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const x = clamp(pos.x - width / 2, 0, pageSize.width - width);
        const y = clamp(pos.y - height / 2, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        onCommit(buildAnnotation(rect));
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = buildRect(start, current);
      return {
        type: PdfAnnotationSubtype.WIDGET,
        bounds: rect,
        data: { rect, ...defaults }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const rect = buildRect(start, clampedPos);
          if (rect.size.width > 5 && rect.size.height > 5) {
            onCommit(buildAnnotation(rect));
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const comboboxHandlerFactory = {
  annotationType: PdfAnnotationSubtype.WIDGET,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        fontFamily: tool.defaults.fontFamily ?? PdfStandardFont.Helvetica,
        fontSize: tool.defaults.fontSize ?? 12,
        fontColor: tool.defaults.fontColor ?? "#000000",
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        color: tool.defaults.color ?? "#FFFFFF",
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        field: tool.defaults.field
      };
    };
    const buildRect = (start, end) => {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
      return {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
    };
    const buildAnnotation = (rect) => {
      var _a;
      const defaults = getDefaults();
      const fieldName = `Combobox_${uuidV4().slice(0, 8)}`;
      return {
        ...defaults,
        type: PdfAnnotationSubtype.WIDGET,
        id: uuidV4(),
        pageIndex,
        rect,
        created: /* @__PURE__ */ new Date(),
        fontFamily: defaults.fontFamily,
        fontSize: defaults.fontSize,
        fontColor: defaults.fontColor,
        strokeColor: defaults.strokeColor,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        field: {
          type: PDF_FORM_FIELD_TYPE.COMBOBOX,
          flag: ((_a = defaults.field) == null ? void 0 : _a.flag) ?? PDF_FORM_FIELD_FLAG.NONE,
          name: fieldName,
          alternateName: fieldName,
          value: "",
          options: [
            { label: "Option 1", isSelected: true },
            { label: "Option 2", isSelected: false },
            { label: "Option 3", isSelected: false }
          ]
        }
      };
    };
    const clickDetector = useClickDetector({
      getTool,
      onClickDetected: (pos) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const tool = getTool();
        const clickConfig = tool == null ? void 0 : tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const x = clamp(pos.x - width / 2, 0, pageSize.width - width);
        const y = clamp(pos.y - height / 2, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        onCommit(buildAnnotation(rect));
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = buildRect(start, current);
      return {
        type: PdfAnnotationSubtype.WIDGET,
        bounds: rect,
        data: { rect, ...defaults }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const rect = buildRect(start, clampedPos);
          if (rect.size.width > 5 && rect.size.height > 5) {
            onCommit(buildAnnotation(rect));
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const listboxHandlerFactory = {
  annotationType: PdfAnnotationSubtype.WIDGET,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        fontFamily: tool.defaults.fontFamily ?? PdfStandardFont.Helvetica,
        fontSize: tool.defaults.fontSize ?? 12,
        fontColor: tool.defaults.fontColor ?? "#000000",
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        color: tool.defaults.color ?? "#FFFFFF",
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        field: tool.defaults.field
      };
    };
    const buildRect = (start, end) => {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
      return {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
    };
    const buildAnnotation = (rect) => {
      var _a;
      const defaults = getDefaults();
      const fieldName = `Listbox_${uuidV4().slice(0, 8)}`;
      return {
        ...defaults,
        type: PdfAnnotationSubtype.WIDGET,
        id: uuidV4(),
        pageIndex,
        rect,
        created: /* @__PURE__ */ new Date(),
        fontFamily: defaults.fontFamily,
        fontSize: defaults.fontSize,
        fontColor: defaults.fontColor,
        strokeColor: defaults.strokeColor,
        color: defaults.color,
        strokeWidth: defaults.strokeWidth,
        field: {
          type: PDF_FORM_FIELD_TYPE.LISTBOX,
          flag: ((_a = defaults.field) == null ? void 0 : _a.flag) ?? PDF_FORM_FIELD_FLAG.NONE,
          name: fieldName,
          alternateName: fieldName,
          value: "",
          options: [
            { label: "Option 1", isSelected: true },
            { label: "Option 2", isSelected: false },
            { label: "Option 3", isSelected: false }
          ]
        }
      };
    };
    const clickDetector = useClickDetector({
      getTool,
      onClickDetected: (pos) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const tool = getTool();
        const clickConfig = tool == null ? void 0 : tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const x = clamp(pos.x - width / 2, 0, pageSize.width - width);
        const y = clamp(pos.y - height / 2, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        onCommit(buildAnnotation(rect));
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = buildRect(start, current);
      return {
        type: PdfAnnotationSubtype.WIDGET,
        bounds: rect,
        data: { rect, ...defaults }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const rect = buildRect(start, clampedPos);
          if (rect.size.width > 5 && rect.size.height > 5) {
            onCommit(buildAnnotation(rect));
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const formTextFieldTool = defineAnnotationTool({
  id: "formTextField",
  name: "Text Field",
  labelKey: "form.textfield",
  categories: ["annotation", "form"],
  matchScore: (a) => {
    var _a;
    if (a.type !== PdfAnnotationSubtype.WIDGET) return 0;
    const widget = a;
    return ((_a = widget.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.TEXTFIELD ? 10 : 0;
  },
  interaction: {
    exclusive: false,
    cursor: "crosshair",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.WIDGET,
    fontFamily: PdfStandardFont.Helvetica,
    fontSize: 12,
    fontColor: "#000000",
    strokeColor: "#000000",
    color: "#FFFFFF",
    strokeWidth: 1,
    field: {
      flag: PDF_FORM_FIELD_FLAG.NONE,
      name: "TextField",
      alternateName: "TextField",
      value: "",
      type: PDF_FORM_FIELD_TYPE.TEXTFIELD
    }
  },
  behavior: {
    useAppearanceStream: false
  },
  clickBehavior: {
    enabled: true,
    defaultSize: { width: 150, height: 24 }
  },
  pointerHandler: textFieldHandlerFactory
});
const formCheckboxTool = defineAnnotationTool({
  id: "formCheckbox",
  name: "Checkbox",
  labelKey: "form.checkbox",
  categories: ["annotation", "form"],
  matchScore: (a) => {
    var _a;
    if (a.type !== PdfAnnotationSubtype.WIDGET) return 0;
    const widget = a;
    return ((_a = widget.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.CHECKBOX ? 10 : 0;
  },
  interaction: {
    exclusive: false,
    cursor: "crosshair",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.WIDGET,
    strokeColor: "#000000",
    color: "#FFFFFF",
    strokeWidth: 1,
    field: {
      flag: PDF_FORM_FIELD_FLAG.NONE,
      name: "Checkbox",
      alternateName: "Checkbox",
      value: "Off",
      type: PDF_FORM_FIELD_TYPE.CHECKBOX
    }
  },
  behavior: {
    useAppearanceStream: false
  },
  clickBehavior: {
    enabled: true,
    defaultSize: { width: 20, height: 20 }
  },
  pointerHandler: checkboxHandlerFactory
});
const formRadioButtonTool = defineAnnotationTool({
  id: "formRadioButton",
  name: "Radio Button",
  labelKey: "form.radiobutton",
  categories: ["annotation", "form"],
  matchScore: (a) => {
    var _a;
    if (a.type !== PdfAnnotationSubtype.WIDGET) return 0;
    const widget = a;
    return ((_a = widget.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.RADIOBUTTON ? 10 : 0;
  },
  interaction: {
    exclusive: false,
    cursor: "crosshair",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    lockAspectRatio: true,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.WIDGET,
    strokeColor: "#000000",
    color: "#FFFFFF",
    strokeWidth: 1,
    field: {
      flag: PDF_FORM_FIELD_FLAG.BUTTON_RADIO | PDF_FORM_FIELD_FLAG.BUTTON_NOTOGGLETOOFF,
      name: "RadioButton",
      alternateName: "RadioButton",
      value: "Off",
      type: PDF_FORM_FIELD_TYPE.RADIOBUTTON,
      options: []
    }
  },
  behavior: {
    useAppearanceStream: false
  },
  clickBehavior: {
    enabled: true,
    defaultSize: { width: 20, height: 20 }
  },
  pointerHandler: radioButtonHandlerFactory
});
const formComboboxTool = defineAnnotationTool({
  id: "formCombobox",
  name: "Combo Box",
  labelKey: "form.combobox",
  categories: ["annotation", "form"],
  matchScore: (a) => {
    var _a;
    if (a.type !== PdfAnnotationSubtype.WIDGET) return 0;
    const widget = a;
    return ((_a = widget.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.COMBOBOX ? 10 : 0;
  },
  interaction: {
    exclusive: false,
    cursor: "crosshair",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.WIDGET,
    fontFamily: PdfStandardFont.Helvetica,
    fontSize: 12,
    fontColor: "#000000",
    strokeColor: "#000000",
    color: "#FFFFFF",
    strokeWidth: 1,
    field: {
      flag: PDF_FORM_FIELD_FLAG.NONE,
      name: "ComboBox",
      alternateName: "ComboBox",
      value: "",
      type: PDF_FORM_FIELD_TYPE.COMBOBOX,
      options: [
        { label: "Option 1", isSelected: true },
        { label: "Option 2", isSelected: false },
        { label: "Option 3", isSelected: false }
      ]
    }
  },
  behavior: {
    useAppearanceStream: false
  },
  clickBehavior: {
    enabled: true,
    defaultSize: { width: 200, height: 40 }
  },
  pointerHandler: comboboxHandlerFactory
});
const formListboxTool = defineAnnotationTool({
  id: "formListbox",
  name: "List Box",
  labelKey: "form.listbox",
  categories: ["annotation", "form"],
  matchScore: (a) => {
    var _a;
    if (a.type !== PdfAnnotationSubtype.WIDGET) return 0;
    const widget = a;
    return ((_a = widget.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.LISTBOX ? 10 : 0;
  },
  interaction: {
    exclusive: false,
    cursor: "crosshair",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.WIDGET,
    fontFamily: PdfStandardFont.Helvetica,
    fontSize: 12,
    fontColor: "#000000",
    strokeColor: "#000000",
    color: "#FFFFFF",
    strokeWidth: 1,
    field: {
      flag: PDF_FORM_FIELD_FLAG.NONE,
      name: "ListBox",
      alternateName: "ListBox",
      value: "",
      type: PDF_FORM_FIELD_TYPE.LISTBOX,
      options: [
        { label: "Option 1", isSelected: true },
        { label: "Option 2", isSelected: false },
        { label: "Option 3", isSelected: false }
      ]
    }
  },
  behavior: {
    useAppearanceStream: false
  },
  clickBehavior: {
    enabled: true,
    defaultSize: { width: 150, height: 150 }
  },
  pointerHandler: listboxHandlerFactory
});
const formTools = [
  formTextFieldTool,
  formCheckboxTool,
  formRadioButtonTool,
  formComboboxTool,
  formListboxTool
];
const _FormPlugin = class _FormPlugin extends BasePlugin {
  constructor(id, registry, _config) {
    var _a, _b;
    super(id, registry);
    this.FORM_HISTORY_TOPIC = "form-fields";
    this.annotation = null;
    this.history = null;
    this.state$ = createScopedEmitter(
      (documentId, state) => ({ documentId, state })
    );
    this.fieldValueChange$ = createScopedEmitter((_, event) => event, { cache: false });
    this.formReady$ = createScopedEmitter(
      (documentId, fields) => ({ documentId, fields }),
      { cache: false }
    );
    this.fieldGroupIndex = /* @__PURE__ */ new Map();
    this.fieldNameIndex = /* @__PURE__ */ new Map();
    this.orderedFieldIndex = /* @__PURE__ */ new Map();
    this.propagationInProgress = /* @__PURE__ */ new Set();
    this.annotation = ((_a = registry.getPlugin("annotation")) == null ? void 0 : _a.provides()) ?? null;
    this.history = ((_b = registry.getPlugin(HistoryPlugin.id)) == null ? void 0 : _b.provides()) ?? null;
    if (this.annotation) {
      for (const tool of formTools) {
        this.annotation.addTool(tool);
      }
      this.annotation.onAnnotationEvent((event) => this.handleAnnotationEvent(event));
    }
  }
  async initialize() {
  }
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initFormState(documentId, { ...initialDocumentState }));
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupFormState(documentId));
    this.fieldGroupIndex.delete(documentId);
    this.fieldNameIndex.delete(documentId);
    this.orderedFieldIndex.delete(documentId);
    this.state$.clearScope(documentId);
    this.fieldValueChange$.clearScope(documentId);
    this.formReady$.clearScope(documentId);
  }
  onStoreUpdated(prev, next) {
    for (const documentId in next.documents) {
      const prevDoc = prev.documents[documentId];
      const nextDoc = next.documents[documentId];
      if (prevDoc !== nextDoc) {
        this.state$.emit(documentId, nextDoc);
      }
    }
  }
  buildCapability() {
    return {
      getPageFormAnnoWidgets: (pageIndex, documentId) => this.getPageFormAnnoWidgets(pageIndex, documentId),
      setFormFieldValues: (pageIndex, annotation, newField, documentId) => this.setFormFieldValues(pageIndex, annotation, newField, documentId),
      renameField: (annotationId, name, documentId) => this.renameFieldMethod(annotationId, name, documentId),
      shareField: (annotationId, targetAnnotationId, documentId) => this.shareFieldMethod(annotationId, targetAnnotationId, documentId),
      renderWidget: (options, documentId) => this.renderWidget(options, documentId),
      selectField: (annotationId, documentId) => this.selectFieldMethod(annotationId, documentId),
      deselectField: (documentId) => this.deselectFieldMethod(documentId),
      getSelectedFieldId: (documentId) => this.getSelectedFieldId(documentId),
      selectNextField: (documentId) => this.selectNextFieldMethod(documentId),
      selectPreviousField: (documentId) => this.selectPreviousFieldMethod(documentId),
      activateField: (documentId) => this.activateFieldMethod(documentId),
      getState: (documentId) => this.getDocumentState(documentId),
      getFieldGroup: (annotationId, documentId) => this.getFieldGroup(annotationId, documentId),
      getFieldSiblings: (annotationId, documentId) => this.getFieldSiblings(annotationId, documentId),
      getFormValues: (documentId) => this.getFormValuesMethod(documentId),
      getFormFields: (documentId) => this.getFormFieldsMethod(documentId),
      setFormValues: (values, documentId) => this.setFormValuesMethod(values, documentId),
      forDocument: (documentId) => this.createFormScope(documentId),
      onStateChange: this.state$.onGlobal,
      onFieldValueChange: this.fieldValueChange$.onGlobal,
      onFormReady: this.formReady$.onGlobal
    };
  }
  createFormScope(documentId) {
    return {
      getPageFormAnnoWidgets: (pageIndex) => this.getPageFormAnnoWidgets(pageIndex, documentId),
      setFormFieldValues: (pageIndex, annotation, newField) => this.setFormFieldValues(pageIndex, annotation, newField, documentId),
      renameField: (annotationId, name) => this.renameFieldMethod(annotationId, name, documentId),
      shareField: (annotationId, targetAnnotationId) => this.shareFieldMethod(annotationId, targetAnnotationId, documentId),
      renderWidget: (options) => this.renderWidget(options, documentId),
      selectField: (annotationId) => this.selectFieldMethod(annotationId, documentId),
      deselectField: () => this.deselectFieldMethod(documentId),
      getSelectedFieldId: () => this.getSelectedFieldId(documentId),
      selectNextField: () => this.selectNextFieldMethod(documentId),
      selectPreviousField: () => this.selectPreviousFieldMethod(documentId),
      activateField: () => this.activateFieldMethod(documentId),
      getState: () => this.getDocumentState(documentId),
      getFieldGroup: (annotationId) => this.getFieldGroup(annotationId, documentId),
      getFieldSiblings: (annotationId) => this.getFieldSiblings(annotationId, documentId),
      getFormValues: () => this.getFormValuesMethod(documentId),
      getFormFields: () => this.getFormFieldsMethod(documentId),
      setFormValues: (values) => this.setFormValuesMethod(values, documentId),
      onStateChange: this.state$.forScope(documentId),
      onFieldValueChange: this.fieldValueChange$.forScope(documentId),
      onFormReady: this.formReady$.forScope(documentId)
    };
  }
  handleAnnotationEvent(event) {
    switch (event.type) {
      case "loaded":
        this.buildFieldGroupIndex(event.documentId);
        this.formReady$.emit(event.documentId, this.getFormFieldsMethod(event.documentId));
        break;
      case "create":
      case "delete": {
        if (event.annotation.type !== PdfAnnotationSubtype.WIDGET) break;
        this.buildFieldGroupIndex(event.documentId);
        break;
      }
      case "update": {
        if (!event.committed) break;
        const anno = event.annotation;
        if (anno.type !== PdfAnnotationSubtype.WIDGET) break;
        if (this.propagationInProgress.has(anno.id)) {
          this.propagationInProgress.delete(anno.id);
          break;
        }
        const patch = event.patch;
        this.buildFieldGroupIndex(event.documentId);
        this.propagateFieldLevelChanges(event.documentId, anno, patch);
        break;
      }
    }
  }
  propagateFieldLevelChanges(documentId, annotation, patch) {
    if (!this.annotation || !patch.field) return;
    const fieldPatch = patch.field;
    const siblings = this.getFieldSiblings(annotation.id, documentId);
    if (siblings.length === 0) return;
    const siblingPatches = [];
    for (const sibling of siblings) {
      this.propagationInProgress.add(sibling.annotationId);
      siblingPatches.push({
        pageIndex: sibling.pageIndex,
        id: sibling.annotationId,
        patch: { field: { ...fieldPatch } }
      });
    }
    this.annotation.forDocument(documentId).updateAnnotations(siblingPatches);
  }
  buildFieldGroupIndex(documentId) {
    if (!this.annotation) return;
    const annoState = this.annotation.forDocument(documentId).getState();
    if (!annoState) return;
    const idx = /* @__PURE__ */ new Map();
    const allWidgets = [];
    for (const [pageStr, uids] of Object.entries(annoState.pages)) {
      const pageIndex = Number(pageStr);
      for (const uid of uids) {
        const tracked = annoState.byUid[uid];
        if (!tracked || tracked.object.type !== PdfAnnotationSubtype.WIDGET) continue;
        const widget = tracked.object;
        const entry = { annotationId: uid, pageIndex };
        allWidgets.push({ entry, widget });
        const fieldKey = this.getFieldKey(widget.field);
        if (!fieldKey) continue;
        const group = idx.get(fieldKey) ?? [];
        group.push(entry);
        idx.set(fieldKey, group);
      }
    }
    this.fieldGroupIndex.set(documentId, idx);
    const nameIdx = /* @__PURE__ */ new Map();
    for (const { entry, widget } of allWidgets) {
      const name = widget.field.name.trim();
      if (!name) continue;
      const group = nameIdx.get(name) ?? [];
      group.push(entry);
      nameIdx.set(name, group);
    }
    this.fieldNameIndex.set(documentId, nameIdx);
    const navigable = allWidgets.filter(
      ({ widget }) => !(widget.field.flag & PDF_FORM_FIELD_FLAG.READONLY)
    );
    this.orderedFieldIndex.set(
      documentId,
      navigable.map(({ entry }) => entry)
    );
  }
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? { ...initialDocumentState };
  }
  // ─────────────────────────────────────────────────────────
  // Field Group Index
  // ─────────────────────────────────────────────────────────
  getDocIndex(documentId) {
    let idx = this.fieldGroupIndex.get(documentId);
    if (!idx) {
      idx = /* @__PURE__ */ new Map();
      this.fieldGroupIndex.set(documentId, idx);
    }
    return idx;
  }
  getFieldKey(field) {
    if (typeof field.fieldObjectId === "number" && field.fieldObjectId > 0) {
      return `field:${field.fieldObjectId}`;
    }
    const normalizedName = field.name.trim();
    if (!normalizedName) return null;
    return `legacy:${field.type}:${normalizedName}`;
  }
  resolveWidgetAnnotation(annotationId, documentId) {
    if (!this.annotation) return null;
    const annoState = this.annotation.forDocument(documentId).getState();
    const tracked = annoState == null ? void 0 : annoState.byUid[annotationId];
    if (!tracked || tracked.object.type !== PdfAnnotationSubtype.WIDGET) {
      return null;
    }
    return tracked.object;
  }
  getFieldGroup(annotationId, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const widget = this.resolveWidgetAnnotation(annotationId, docId);
    if (!widget) return [];
    const fieldKey = this.getFieldKey(widget.field);
    if (!fieldKey) {
      return [{ annotationId: widget.id, pageIndex: widget.pageIndex }];
    }
    return this.getDocIndex(docId).get(fieldKey) ?? [
      { annotationId: widget.id, pageIndex: widget.pageIndex }
    ];
  }
  getFieldSiblings(annotationId, documentId) {
    return this.getFieldGroup(annotationId, documentId).filter(
      (e) => e.annotationId !== annotationId
    );
  }
  // ─────────────────────────────────────────────────────────
  // Form Values API
  // ─────────────────────────────────────────────────────────
  getFormValuesMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const nameIdx = this.fieldNameIndex.get(docId);
    if (!nameIdx) return {};
    const values = {};
    for (const [name, entries] of nameIdx) {
      const widget = this.resolveWidgetAnnotation(entries[0].annotationId, docId);
      if (widget) {
        values[name] = widget.field.value;
      }
    }
    return values;
  }
  getFormFieldsMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const nameIdx = this.fieldNameIndex.get(docId);
    if (!nameIdx) return [];
    const fields = [];
    for (const [name, entries] of nameIdx) {
      const widget = this.resolveWidgetAnnotation(entries[0].annotationId, docId);
      if (!widget) continue;
      fields.push({
        name,
        type: widget.field.type,
        value: widget.field.value,
        readOnly: !!(widget.field.flag & PDF_FORM_FIELD_FLAG.READONLY),
        ..."options" in widget.field && widget.field.options ? { options: widget.field.options } : {}
      });
    }
    return fields;
  }
  setFormValuesMethod(values, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const nameIdx = this.fieldNameIndex.get(docId);
    if (!nameIdx) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "no form fields indexed for this document"
      });
    }
    const entries = Object.entries(values);
    if (entries.length === 0) {
      return PdfTaskHelper.resolve(true);
    }
    const resultTask = new Task();
    let pending = entries.length;
    let failed = false;
    const onComplete = () => {
      pending--;
      if (pending === 0 && !failed) {
        resultTask.resolve(true);
      }
    };
    const onError = (err) => {
      if (!failed) {
        failed = true;
        resultTask.reject(err);
      }
    };
    for (const [name, value] of entries) {
      const fieldEntries = nameIdx.get(name);
      if (!fieldEntries || fieldEntries.length === 0) {
        onComplete();
        continue;
      }
      let targetEntry = fieldEntries[0];
      let widget = this.resolveWidgetAnnotation(targetEntry.annotationId, docId);
      if (!widget) {
        onComplete();
        continue;
      }
      if (widget.field.type === PDF_FORM_FIELD_TYPE.RADIOBUTTON || widget.field.type === PDF_FORM_FIELD_TYPE.CHECKBOX) {
        for (const entry of fieldEntries) {
          const w = this.resolveWidgetAnnotation(entry.annotationId, docId);
          if (w && w.exportValue === value) {
            widget = w;
            targetEntry = entry;
            break;
          }
        }
      }
      this.setFormFieldValues(
        targetEntry.pageIndex,
        widget,
        this.buildImportField(widget, value),
        docId
      ).wait(
        () => onComplete(),
        (error) => onError(error.reason)
      );
    }
    return resultTask;
  }
  buildImportField(widget, value) {
    const field = widget.field;
    if ((field.type === PDF_FORM_FIELD_TYPE.COMBOBOX || field.type === PDF_FORM_FIELD_TYPE.LISTBOX) && "options" in field) {
      return {
        ...field,
        value,
        options: field.options.map((opt) => ({
          ...opt,
          isSelected: opt.label === value
        }))
      };
    }
    if (field.type === PDF_FORM_FIELD_TYPE.CHECKBOX) {
      const normalizedValue = value === "Off" ? "Off" : widget.exportValue ?? "Yes";
      return { ...field, value: normalizedValue };
    }
    return { ...field, value };
  }
  isToggleField(field) {
    return field.type === PDF_FORM_FIELD_TYPE.CHECKBOX || field.type === PDF_FORM_FIELD_TYPE.RADIOBUTTON;
  }
  shouldRegenerateWidgetAppearances(field) {
    return !this.isToggleField(field);
  }
  getFieldBatchTarget(batch) {
    const entries = [...batch.values()];
    const checkedToggleEntry = entries.find(
      (entry) => this.isToggleField(entry.widget.field) && isWidgetChecked(entry.widget)
    );
    return checkedToggleEntry ?? entries[0];
  }
  async readFieldWidgets(doc, groupEntries, seq, regenerateAppearances) {
    const pageSet = new Set(groupEntries.map((entry) => entry.pageIndex));
    const memberIds = new Set(groupEntries.map((entry) => entry.annotationId));
    const batch = /* @__PURE__ */ new Map();
    for (const pageIndex of pageSet) {
      const page = doc.pages.find((entry) => entry.index === pageIndex);
      if (!page) continue;
      const pageMemberIds = groupEntries.filter((entry) => entry.pageIndex === pageIndex).map((entry) => entry.annotationId);
      if (regenerateAppearances) {
        await seq.run(() => this.engine.regenerateWidgetAppearances(doc, page, pageMemberIds));
      }
      const widgets = await seq.run(() => this.engine.getPageAnnoWidgets(doc, page));
      for (const widget of widgets) {
        if (memberIds.has(widget.id)) {
          batch.set(widget.id, { widget, pageIndex });
        }
      }
    }
    return batch;
  }
  syncFieldBatch(documentId, batch, options = {}) {
    if (!this.annotation) return;
    for (const [id, { widget, pageIndex }] of batch) {
      this.annotation.syncAnnotationObject(id, widget, documentId);
      this.annotation.invalidatePageAppearances(pageIndex, documentId);
      if (options.emitFieldValueChanges) {
        this.fieldValueChange$.emit(documentId, {
          documentId,
          pageIndex,
          annotationId: id,
          widget
        });
      }
    }
    this.buildFieldGroupIndex(documentId);
  }
  resolveWidgetPage(annotationId, documentId, doc) {
    const widget = this.resolveWidgetAnnotation(annotationId, documentId);
    if (!widget) return null;
    const page = doc.pages.find((entry) => entry.index === widget.pageIndex);
    if (!page) return null;
    return { widget, page };
  }
  getPageFormAnnoWidgets(pageIndex, documentId) {
    const docState = this.getCoreDocumentOrThrow(documentId);
    const doc = docState.document;
    if (!doc) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: "document is not open"
      });
    }
    const page = doc.pages.find((p) => p.index === pageIndex);
    if (!page) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "page does not exist"
      });
    }
    return this.engine.getPageAnnoWidgets(doc, page);
  }
  setFormFieldValues(pageIndex, annotation, newField, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.getCoreDocumentOrThrow(docId);
    const doc = coreDoc.document;
    if (!doc) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: "document is not open"
      });
    }
    const page = doc.pages.find((p) => p.index === pageIndex);
    if (!page) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "page does not exist"
      });
    }
    const resultTask = new Task();
    const seq = new TaskSequence(resultTask);
    seq.execute(
      async () => {
        const groupEntries = this.getFieldGroup(annotation.id, docId);
        const beforeEntries = await this.readFieldWidgets(doc, groupEntries, seq, false);
        await seq.run(() => this.engine.setFormFieldState(doc, page, annotation, newField));
        const afterEntries = await this.readFieldWidgets(
          doc,
          groupEntries,
          seq,
          this.shouldRegenerateWidgetAppearances(newField)
        );
        let isFirstExecution = true;
        const applyToEngine = async (batch) => {
          const target = this.getFieldBatchTarget(batch);
          if (!target) return;
          const pg = doc.pages.find((p) => p.index === target.pageIndex);
          if (!pg) return;
          await new Promise((resolve) => {
            this.engine.setFormFieldState(doc, pg, target.widget, target.widget.field).wait(
              () => resolve(),
              () => resolve()
            );
          });
          if (this.shouldRegenerateWidgetAppearances(target.widget.field)) {
            for (const pi of new Set([...batch.values()].map((entry) => entry.pageIndex))) {
              const p = doc.pages.find((pp) => pp.index === pi);
              if (!p) continue;
              const ids = [...batch.entries()].filter(([, entry]) => entry.pageIndex === pi).map(([id]) => id);
              await new Promise((resolve) => {
                this.engine.regenerateWidgetAppearances(doc, p, ids).wait(
                  () => resolve(),
                  () => resolve()
                );
              });
            }
          }
        };
        const command = {
          execute: () => {
            const skipEngine = isFirstExecution;
            isFirstExecution = false;
            if (skipEngine) {
              this.syncFieldBatch(docId, afterEntries, { emitFieldValueChanges: true });
            } else {
              applyToEngine(afterEntries).then(
                () => this.syncFieldBatch(docId, afterEntries, { emitFieldValueChanges: true })
              );
            }
          },
          undo: () => {
            applyToEngine(beforeEntries).then(
              () => this.syncFieldBatch(docId, beforeEntries, { emitFieldValueChanges: true })
            );
          }
        };
        if (this.history) {
          this.history.forDocument(docId).register(command, this.FORM_HISTORY_TOPIC);
        } else {
          command.execute();
        }
        resultTask.resolve(true);
      },
      (err) => ({ code: PdfErrorCode.Unknown, message: String(err) })
    );
    return resultTask;
  }
  findConflictingFieldGroups(normalizedName, sourceAnnotationId, documentId) {
    const result = /* @__PURE__ */ new Map();
    if (!this.annotation) return result;
    const annoState = this.annotation.forDocument(documentId).getState();
    if (!annoState) return result;
    const sourceFieldKey = (() => {
      const w = this.resolveWidgetAnnotation(sourceAnnotationId, documentId);
      return w ? this.getFieldKey(w.field) : null;
    })();
    for (const [pageStr, uids] of Object.entries(annoState.pages)) {
      const pageIndex = Number(pageStr);
      for (const uid of uids) {
        const tracked = annoState.byUid[uid];
        if (!tracked || tracked.object.type !== PdfAnnotationSubtype.WIDGET) continue;
        const widget = tracked.object;
        if (widget.field.name.trim() !== normalizedName) continue;
        const fieldKey = this.getFieldKey(widget.field);
        if (!fieldKey || fieldKey === sourceFieldKey) continue;
        if (!result.has(fieldKey)) {
          result.set(fieldKey, { entries: [], widget });
        }
        result.get(fieldKey).entries.push({ annotationId: uid, pageIndex });
      }
    }
    return result;
  }
  renameFieldMethod(annotationId, name, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const normalizedName = name.trim();
    if (!normalizedName) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.Unknown,
        message: "Field name must not be empty."
      });
    }
    const coreDoc = this.getCoreDocumentOrThrow(docId);
    const doc = coreDoc.document;
    if (!doc) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: "document is not open"
      });
    }
    const source = this.resolveWidgetPage(annotationId, docId, doc);
    if (!source) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "widget annotation not found"
      });
    }
    if (source.widget.field.name.trim() === normalizedName) {
      return PdfTaskHelper.resolve({ outcome: "no-op" });
    }
    const conflicts = this.findConflictingFieldGroups(normalizedName, annotationId, docId);
    if (conflicts.size > 0) {
      if (conflicts.size > 1) {
        return PdfTaskHelper.reject({
          code: PdfErrorCode.Unknown,
          message: "That field name is used by multiple fields. Choose a unique name."
        });
      }
      const [, match] = [...conflicts.entries()][0];
      if (match.widget.field.type !== source.widget.field.type) {
        return PdfTaskHelper.reject({
          code: PdfErrorCode.Unknown,
          message: "That field name is already used by a different widget type."
        });
      }
      return PdfTaskHelper.resolve({
        outcome: "conflict",
        targetAnnotationId: match.entries[0].annotationId,
        fieldName: normalizedName
      });
    }
    const resultTask = new Task();
    const seq = new TaskSequence(resultTask);
    seq.execute(
      async () => {
        const groupEntries = this.getFieldGroup(annotationId, docId);
        await seq.run(
          () => this.engine.renameWidgetField(doc, source.page, source.widget, normalizedName)
        );
        const syncedEntries = await this.readFieldWidgets(doc, groupEntries, seq, false);
        this.syncFieldBatch(docId, syncedEntries);
        resultTask.resolve({ outcome: "renamed" });
      },
      (err) => ({ code: PdfErrorCode.Unknown, message: String(err) })
    );
    return resultTask;
  }
  shareFieldMethod(annotationId, targetAnnotationId, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (annotationId === targetAnnotationId) {
      return PdfTaskHelper.resolve(true);
    }
    const coreDoc = this.getCoreDocumentOrThrow(docId);
    const doc = coreDoc.document;
    if (!doc) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.DocNotOpen,
        message: "document is not open"
      });
    }
    const source = this.resolveWidgetPage(annotationId, docId, doc);
    const target = this.resolveWidgetPage(targetAnnotationId, docId, doc);
    if (!source || !target) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "widget annotation not found"
      });
    }
    if (source.widget.field.type !== target.widget.field.type) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.Unknown,
        message: "cannot share fields with different widget types"
      });
    }
    if (source.widget.field.fieldObjectId && target.widget.field.fieldObjectId && source.widget.field.fieldObjectId === target.widget.field.fieldObjectId) {
      return PdfTaskHelper.resolve(true);
    }
    const affectedEntryMap = /* @__PURE__ */ new Map();
    for (const entry of this.getFieldGroup(annotationId, docId)) {
      affectedEntryMap.set(entry.annotationId, entry);
    }
    for (const entry of this.getFieldGroup(targetAnnotationId, docId)) {
      affectedEntryMap.set(entry.annotationId, entry);
    }
    const affectedEntries = [...affectedEntryMap.values()];
    const resultTask = new Task();
    const seq = new TaskSequence(resultTask);
    seq.execute(
      async () => {
        await seq.run(
          () => this.engine.shareWidgetField(doc, source.page, source.widget, target.page, target.widget)
        );
        const syncedEntries = await this.readFieldWidgets(
          doc,
          affectedEntries,
          seq,
          this.shouldRegenerateWidgetAppearances(target.widget.field)
        );
        this.syncFieldBatch(docId, syncedEntries);
        resultTask.resolve(true);
      },
      (err) => ({ code: PdfErrorCode.Unknown, message: String(err) })
    );
    return resultTask;
  }
  selectFieldMethod(annotationId, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(selectField(docId, annotationId));
  }
  deselectFieldMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(deselectField(docId));
  }
  getSelectedFieldId(documentId) {
    return this.getDocumentState(documentId).selectedFieldId;
  }
  selectNextFieldMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ordered = this.orderedFieldIndex.get(docId);
    if (!ordered || ordered.length === 0) return;
    const currentId = this.getSelectedFieldId(docId);
    let nextIndex = 0;
    if (currentId) {
      const currentIndex = ordered.findIndex((e) => e.annotationId === currentId);
      nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ordered.length : 0;
    }
    const next = ordered[nextIndex];
    this.dispatch(selectField(docId, next.annotationId));
  }
  selectPreviousFieldMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ordered = this.orderedFieldIndex.get(docId);
    if (!ordered || ordered.length === 0) return;
    const currentId = this.getSelectedFieldId(docId);
    let prevIndex = ordered.length - 1;
    if (currentId) {
      const currentIndex = ordered.findIndex((e) => e.annotationId === currentId);
      prevIndex = currentIndex >= 0 ? (currentIndex - 1 + ordered.length) % ordered.length : ordered.length - 1;
    }
    const prev = ordered[prevIndex];
    this.dispatch(selectField(docId, prev.annotationId));
  }
  activateFieldMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const selectedId = this.getSelectedFieldId(docId);
    if (!selectedId) return;
    const widget = this.resolveWidgetAnnotation(selectedId, docId);
    if (!widget) return;
    const field = widget.field;
    if (field.type === PDF_FORM_FIELD_TYPE.CHECKBOX) {
      const checked = isWidgetChecked(widget);
      const newValue = checked ? "Off" : widget.exportValue ?? "Yes";
      this.setFormFieldValues(widget.pageIndex, widget, { ...field, value: newValue }, docId);
    } else if (field.type === PDF_FORM_FIELD_TYPE.RADIOBUTTON) {
      if (!isWidgetChecked(widget) && widget.exportValue) {
        this.setFormFieldValues(
          widget.pageIndex,
          widget,
          { ...field, value: widget.exportValue },
          docId
        );
      }
    }
  }
  renderWidget(options, documentId) {
    if (!this.annotation) {
      return PdfTaskHelper.reject({
        code: PdfErrorCode.NotFound,
        message: "annotation plugin not found"
      });
    }
    const id = documentId ?? this.getActiveDocumentId();
    return this.annotation.forDocument(id).renderAnnotation(options);
  }
  async destroy() {
    this.state$.clear();
    this.fieldValueChange$.clear();
    this.formReady$.clear();
    super.destroy();
  }
};
_FormPlugin.id = "form";
let FormPlugin = _FormPlugin;
const FormPluginPackage = {
  manifest,
  create: (registry, config) => new FormPlugin(FORM_PLUGIN_ID, registry, config),
  reducer,
  initialState
};
export {
  FORM_PLUGIN_ID,
  FormPlugin,
  FormPluginPackage,
  formCheckboxTool,
  formComboboxTool,
  formListboxTool,
  formRadioButtonTool,
  formTextFieldTool,
  formTools,
  initialDocumentState,
  initialState,
  manifest
};
//# sourceMappingURL=index.js.map
