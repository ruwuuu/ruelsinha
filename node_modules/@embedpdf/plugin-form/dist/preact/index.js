import { createPluginPackage } from "@embedpdf/core";
import { initialDocumentState, FormPlugin, FormPluginPackage as FormPluginPackage$1 } from "@embedpdf/plugin-form";
export * from "@embedpdf/plugin-form";
import { useIOSZoomPrevention, createRenderer, useRegisterRenderers } from "@embedpdf/plugin-annotation/preact";
import { jsx, jsxs } from "preact/jsx-runtime";
import { PDF_FORM_FIELD_TYPE, PDF_FORM_FIELD_FLAG, standardFontCssProperties, isWidgetChecked, ignore, PdfErrorCode, PdfAnnotationSubtype } from "@embedpdf/models";
import { Fragment } from "preact";
import { useState, useEffect, useMemo, useCallback, useRef } from "preact/hooks";
import { useCapability, usePlugin } from "@embedpdf/core/preact";
const selectProps = (isMultiple, selectedValues) => ({
  value: isMultiple ? void 0 : selectedValues[0] || ""
});
const optionProps = (isMultiple, selectedValues, optionValue) => ({
  selected: isMultiple ? selectedValues.includes(optionValue) : void 0
});
function FormTextField({
  annotation,
  isSelected,
  scale,
  onClick,
  style
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const field = object.field;
  const isTextField = field.type === PDF_FORM_FIELD_TYPE.TEXTFIELD;
  const value = isTextField ? field.value : "";
  const isComb = isTextField && !!(field.flag & PDF_FORM_FIELD_FLAG.TEXT_COMB) && !!field.maxLen;
  const isMultiline = isTextField && !!(field.flag & PDF_FORM_FIELD_FLAG.TEXT_MULTIPLINE);
  const maxLen = isTextField ? field.maxLen : void 0;
  const borderWidth = (object.strokeWidth ?? 1) * scale;
  const fontStyle = {
    fontSize: (object.fontSize ?? 12) * scale,
    ...standardFontCssProperties(object.fontFamily),
    color: object.fontColor ?? "#000000",
    lineHeight: 1.2
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: !isSelected ? onClick : void 0,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        position: "absolute",
        inset: 0,
        background: object.color ?? "rgba(255, 255, 255, 0.9)",
        border: `${borderWidth}px solid ${object.strokeColor ?? "rgba(0, 0, 0, 0.2)"}`,
        outline: isHovered || isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
        outlineOffset: -1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        display: "flex",
        alignItems: isMultiline ? "flex-start" : "center",
        overflow: "hidden",
        ...!isComb ? { padding: `${borderWidth}px ${borderWidth}px` } : {},
        ...style
      },
      children: isComb && maxLen ? /* @__PURE__ */ jsx(
        CombPreview,
        {
          value: value ?? "",
          maxLen,
          scale,
          width: object.rect.size.width,
          fontStyle,
          strokeColor: object.strokeColor ?? "rgba(0, 0, 0, 0.2)"
        }
      ) : /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            ...fontStyle,
            display: "block",
            width: "100%",
            whiteSpace: isMultiline ? "pre-wrap" : "nowrap",
            wordBreak: isMultiline ? "break-word" : "normal",
            overflowWrap: isMultiline ? "break-word" : "normal",
            overflow: "hidden",
            textOverflow: isMultiline ? "clip" : "ellipsis"
          },
          children: value
        }
      )
    }
  );
}
function CombPreview({
  value,
  maxLen,
  scale,
  width,
  fontStyle,
  strokeColor
}) {
  const cellWidth = width * scale / maxLen;
  const chars = value.split("");
  return /* @__PURE__ */ jsx("div", { style: { position: "relative", width: "100%", height: "100%" }, children: Array.from({ length: maxLen }).map((_, i) => /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        position: "absolute",
        top: 0,
        left: i * cellWidth,
        width: cellWidth,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: i < maxLen - 1 ? `1px solid ${strokeColor}` : "none",
        boxSizing: "border-box",
        ...fontStyle
      },
      children: chars[i] || ""
    },
    i
  )) });
}
function FormCheckbox({ annotation, isSelected, scale, onClick, style }) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const isChecked = isWidgetChecked(object);
  return /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: !isSelected ? onClick : void 0,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        position: "absolute",
        inset: 0,
        background: object.color ?? "#FFFFFF",
        border: `${(object.strokeWidth ?? 1) * scale}px solid ${object.strokeColor ?? "#000000"}`,
        outline: isHovered || isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
        outlineOffset: -1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style
      },
      children: isChecked && /* @__PURE__ */ jsx(
        "svg",
        {
          viewBox: "0 0 100 100",
          style: {
            width: "100%",
            height: "100%"
          },
          children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M28 48C27.45 50.21 29.45 63.13 30 67C30.55 69.21 34.58 72 39 72C44.52 71.45 76.55 32.55 76 32C77.1 31.45 76 25 76 25C74.34 22.24 68 25.45 68 26C68 26 43.55 53 43 53C41.34 53 40.55 41.1 40 40C33.37 36.69 29.1 45.79 28 48Z",
              fill: "#000000"
            }
          )
        }
      )
    }
  );
}
function FormRadioButton({
  annotation,
  isSelected,
  scale,
  onClick,
  style
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const isChecked = isWidgetChecked(object);
  return /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: !isSelected ? onClick : void 0,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        position: "absolute",
        inset: 0,
        background: object.color ?? "#FFFFFF",
        border: `${(object.strokeWidth ?? 1) * scale}px solid ${object.strokeColor ?? "#000000"}`,
        borderRadius: "50%",
        outline: isHovered || isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
        outlineOffset: -1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style
      },
      children: isChecked && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background: "#000000"
          }
        }
      )
    }
  );
}
function FormCombobox({ annotation, isSelected, scale, onClick, style }) {
  var _a;
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const field = object.field;
  const options = field.type === PDF_FORM_FIELD_TYPE.COMBOBOX ? field.options : [];
  const selectedLabel = ((_a = options.find((o) => o.isSelected)) == null ? void 0 : _a.label) ?? "";
  const borderWidth = (object.strokeWidth ?? 1) * scale;
  const fontSize = (object.fontSize ?? 12) * scale;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onPointerDown: !isSelected ? onClick : void 0,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        position: "absolute",
        inset: 0,
        background: object.color ?? "#FFFFFF",
        border: `${borderWidth}px solid ${object.strokeColor ?? "#000000"}`,
        outline: isHovered || isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
        outlineOffset: -1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        ...style
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              flex: 1,
              padding: `0 ${4 * scale}px`,
              fontSize,
              ...standardFontCssProperties(object.fontFamily),
              color: object.fontColor ?? "#000000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            },
            children: selectedLabel
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              width: 13 * scale,
              minWidth: 13 * scale,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: `1px solid ${object.strokeColor ?? "#000000"}`
            },
            children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 10 6", style: { width: 8 * scale, height: 5 * scale }, fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M0 0 L5 6 L10 0 Z" }) })
          }
        )
      ]
    }
  );
}
function FormListbox({ annotation, isSelected, scale, onClick, style }) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const field = object.field;
  const options = field.type === PDF_FORM_FIELD_TYPE.LISTBOX ? field.options : [];
  const borderWidth = (object.strokeWidth ?? 1) * scale;
  const fontSize = (object.fontSize ?? 12) * scale;
  const lineHeight = fontSize * 1.2;
  return /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: !isSelected ? onClick : void 0,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        position: "absolute",
        inset: 0,
        background: object.color ?? "#FFFFFF",
        border: `${borderWidth}px solid ${object.strokeColor ?? "#000000"}`,
        outline: isHovered || isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
        outlineOffset: -1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style
      },
      children: options.map((opt, i) => /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            padding: `0 ${4 * scale}px`,
            fontSize,
            lineHeight: `${lineHeight}px`,
            ...standardFontCssProperties(object.fontFamily),
            color: opt.isSelected ? "#FFFFFF" : object.fontColor ?? "#000000",
            background: opt.isSelected ? "rgba(0, 51, 113, 1)" : "transparent",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          },
          children: opt.label
        },
        i
      ))
    }
  );
}
const useFormPlugin = () => usePlugin(FormPlugin.id);
const useFormCapability = () => useCapability(FormPlugin.id);
const useFormDocumentState = (documentId) => {
  var _a;
  const { provides } = useFormCapability();
  const [state, setState] = useState(
    ((_a = provides == null ? void 0 : provides.forDocument(documentId)) == null ? void 0 : _a.getState()) ?? { ...initialDocumentState }
  );
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setState(scope.getState());
    return scope.onStateChange((newState) => {
      setState(newState);
    });
  }, [provides, documentId]);
  return state;
};
function useFormWidgetState(props) {
  const { currentObject: annotation, scale, pageIndex } = props;
  const field = annotation.field;
  const { provides: formProvides } = useFormCapability();
  const [renderKey, setRenderKey] = useState(0);
  const isReadOnly = !!(field.flag & PDF_FORM_FIELD_FLAG.READONLY);
  const scope = useMemo(
    () => formProvides == null ? void 0 : formProvides.forDocument(props.documentId),
    [formProvides, props.documentId]
  );
  useEffect(() => {
    if (!scope) return;
    return scope.onFieldValueChange((event) => {
      if (event.annotationId === annotation.id) {
        setRenderKey((k) => k + 1);
      }
    });
  }, [scope, annotation.id]);
  const handleChangeField = useCallback(
    (newField) => {
      if (!scope) return;
      scope.setFormFieldValues(pageIndex, annotation, newField);
    },
    [scope, pageIndex, annotation]
  );
  return { annotation, field, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly };
}
function RenderWidget({
  pageIndex,
  annotation,
  scaleFactor = 1,
  renderKey = 0,
  style,
  ...props
}) {
  const { provides: formProvides } = useFormCapability();
  const [imageUrl, setImageUrl] = useState(null);
  const urlRef = useRef(null);
  const { width, height } = annotation.rect.size;
  useEffect(() => {
    if (!formProvides) return;
    const task = formProvides.renderWidget({
      pageIndex,
      annotation,
      options: {
        scaleFactor,
        dpr: window.devicePixelRatio
      }
    });
    task.wait((blob) => {
      const url = URL.createObjectURL(blob);
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
      urlRef.current = url;
      setImageUrl(url);
    }, ignore);
    return () => {
      task.abort({
        code: PdfErrorCode.Cancelled,
        message: "canceled render task"
      });
    };
  }, [pageIndex, scaleFactor, formProvides, annotation.id, width, height, renderKey]);
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: imageUrl && /* @__PURE__ */ jsx(
    "img",
    {
      src: imageUrl,
      ...props,
      style: {
        width: "100%",
        height: "100%",
        display: "block",
        ...style || {}
      }
    }
  ) });
}
const baseStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: 0,
  margin: 0,
  width: "100%",
  height: "100%"
};
const baseInputStyle = {
  ...baseStyle,
  borderRadius: 0,
  outline: "none",
  boxSizing: "border-box"
};
const inputStyle = baseInputStyle;
const selectStyle = {
  ...baseInputStyle,
  cursor: "inherit"
};
const textareaStyle = {
  ...baseInputStyle,
  resize: "none",
  lineHeight: 1.14
};
const combContainerStyle = {
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: 0,
  boxSizing: "border-box"
};
const combHiddenInputStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  padding: 0,
  margin: 0,
  border: "none",
  zIndex: 1
};
const combCellStyle = {
  position: "absolute",
  top: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none"
};
const combCaretStyle = {
  position: "absolute",
  top: "15%",
  height: "70%",
  width: 1,
  backgroundColor: "black",
  pointerEvents: "none"
};
function CombField(props) {
  const {
    inputRef,
    required,
    disabled,
    password,
    name,
    value,
    maxLen,
    cellWidth,
    chars,
    caretIndex,
    containerStyle,
    cellFontStyle,
    onFocus,
    onChange,
    onBlur
  } = props;
  const [caretVisible, setCaretVisible] = useState(true);
  useEffect(() => {
    setCaretVisible(true);
    const id = setInterval(() => setCaretVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [caretIndex]);
  const showCaret = caretIndex < maxLen;
  return /* @__PURE__ */ jsxs("div", { style: containerStyle, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        required,
        disabled,
        type: password ? "password" : "text",
        name,
        "aria-label": name,
        value,
        maxLength: maxLen,
        onFocus,
        onChange,
        onBlur,
        style: combHiddenInputStyle
      }
    ),
    Array.from({ length: maxLen }).map((_, i) => /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          ...combCellStyle,
          ...cellFontStyle,
          left: i * cellWidth,
          width: cellWidth
        },
        children: chars[i] || ""
      },
      i
    )),
    showCaret && /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          ...combCaretStyle,
          left: caretIndex * cellWidth + cellWidth / 2,
          opacity: caretVisible ? 1 : 0
        }
      }
    )
  ] });
}
function TextField(props) {
  const {
    annotation,
    isEditable,
    onChangeField,
    onFocus,
    onBlur,
    inputRef,
    scale,
    syncExternalValue = true
  } = props;
  const field = annotation.field;
  const { flag } = field;
  const name = field.name;
  const value = field.value;
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    if (!syncExternalValue) return;
    setLocalValue(value);
  }, [value, syncExternalValue]);
  const changeValue = useCallback(
    (evt) => {
      const newValue = evt.target.value;
      setLocalValue(newValue);
      onChangeField == null ? void 0 : onChangeField({ ...field, value: newValue });
    },
    [onChangeField, field]
  );
  const bw = (annotation.strokeWidth ?? 0) * scale;
  const fontCss = standardFontCssProperties(annotation.fontFamily);
  const { adjustedFontPx, wrapperStyle } = useIOSZoomPrevention(annotation.fontSize * scale, true);
  const visualStyle = useMemo(
    () => ({
      backgroundColor: annotation.color ?? "transparent",
      borderStyle: "solid",
      borderColor: annotation.strokeColor ?? "transparent",
      borderWidth: bw,
      color: annotation.fontColor,
      ...fontCss,
      fontSize: adjustedFontPx,
      padding: `${bw}px ${bw}px`
    }),
    [annotation.color, annotation.strokeColor, annotation.fontColor, adjustedFontPx, bw, fontCss]
  );
  const isDisabled = !isEditable || !!(flag & PDF_FORM_FIELD_FLAG.READONLY);
  const isRequired = !!(flag & PDF_FORM_FIELD_FLAG.REQUIRED);
  const isPassword = !!(flag & PDF_FORM_FIELD_FLAG.TEXT_PASSWORD);
  const isMultipleLine = !!(flag & PDF_FORM_FIELD_FLAG.TEXT_MULTIPLINE);
  const isComb = !!(flag & PDF_FORM_FIELD_FLAG.TEXT_COMB);
  const maxLen = field.maxLen;
  if (isComb && maxLen) {
    const cellWidth = annotation.rect.size.width * scale / maxLen;
    const chars = (localValue || "").split("");
    const caretIndex = chars.length;
    const combContainer = {
      ...combContainerStyle,
      backgroundColor: annotation.color ?? "transparent",
      borderStyle: "solid",
      borderColor: annotation.strokeColor ?? "transparent",
      borderWidth: bw
    };
    const cellFont = {
      color: annotation.fontColor,
      ...fontCss,
      fontSize: adjustedFontPx
    };
    const combContent = /* @__PURE__ */ jsx(
      CombField,
      {
        inputRef,
        required: isRequired,
        disabled: isDisabled,
        password: isPassword,
        name,
        value: localValue,
        maxLen,
        cellWidth,
        chars,
        caretIndex,
        containerStyle: combContainer,
        cellFontStyle: cellFont,
        onFocus,
        onChange: changeValue,
        onBlur
      }
    );
    return wrapperStyle ? /* @__PURE__ */ jsx("div", { style: wrapperStyle, children: combContent }) : combContent;
  }
  const inputContent = isMultipleLine ? /* @__PURE__ */ jsx(
    "textarea",
    {
      ref: inputRef,
      required: isRequired,
      disabled: isDisabled,
      name,
      "aria-label": name,
      value: localValue,
      maxLength: maxLen,
      onFocus,
      onChange: changeValue,
      onBlur,
      style: { ...textareaStyle, ...visualStyle }
    }
  ) : /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      required: isRequired,
      disabled: isDisabled,
      type: isPassword ? "password" : "text",
      name,
      "aria-label": name,
      value: localValue,
      maxLength: maxLen,
      onFocus,
      onChange: changeValue,
      onBlur,
      style: { ...inputStyle, ...visualStyle }
    }
  );
  return wrapperStyle ? /* @__PURE__ */ jsx("div", { style: wrapperStyle, children: inputContent }) : inputContent;
}
function TextFillMode(props) {
  const { annotation, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly } = useFormWidgetState(props);
  const formState = useFormDocumentState(props.documentId);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const isFocused = formState.selectedFieldId === annotation.id;
  useEffect(() => {
    if (isFocused && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  const handleFocus = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
    setEditing(true);
  }, [isReadOnly, scope, annotation.id]);
  const handleBlur = useCallback(() => {
    setEditing(false);
    if ((scope == null ? void 0 : scope.getSelectedFieldId()) === annotation.id) {
      scope == null ? void 0 : scope.deselectField();
    }
  }, [scope, annotation.id]);
  const handleInputRef = useCallback((el) => {
    inputRef.current = el;
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        pointerEvents: "auto",
        outline: "none"
      },
      children: [
        /* @__PURE__ */ jsx(
          RenderWidget,
          {
            pageIndex,
            annotation,
            scaleFactor: scale,
            renderKey,
            style: {
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              visibility: editing ? "hidden" : "visible"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              zIndex: 1,
              opacity: editing ? 1 : 0
            },
            children: /* @__PURE__ */ jsx(
              TextField,
              {
                annotation,
                scale,
                pageIndex,
                isEditable: true,
                onChangeField: handleChangeField,
                syncExternalValue: !editing,
                onFocus: handleFocus,
                onBlur: handleBlur,
                inputRef: handleInputRef
              }
            )
          }
        )
      ]
    }
  );
}
function ToggleFillMode(props) {
  const { annotation, field, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly } = useFormWidgetState(props);
  const formState = useFormDocumentState(props.documentId);
  const wrapperRef = useRef(null);
  const isFocused = formState.selectedFieldId === annotation.id;
  useEffect(() => {
    if (isFocused && wrapperRef.current && document.activeElement !== wrapperRef.current) {
      wrapperRef.current.focus();
    }
  }, [isFocused]);
  const toggle = useCallback(() => {
    if (isReadOnly) return;
    const checked = isWidgetChecked(annotation);
    const newValue = checked ? "Off" : annotation.exportValue ?? "Yes";
    handleChangeField({ ...field, value: newValue });
  }, [isReadOnly, annotation, field, handleChangeField]);
  const handleClick = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
    toggle();
  }, [isReadOnly, scope, annotation.id, toggle]);
  const handleFocus = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
  }, [isReadOnly, scope, annotation.id]);
  const handleBlur = useCallback(() => {
    if ((scope == null ? void 0 : scope.getSelectedFieldId()) === annotation.id) {
      scope == null ? void 0 : scope.deselectField();
    }
  }, [scope, annotation.id]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: wrapperRef,
      tabIndex: isReadOnly ? -1 : 0,
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isReadOnly ? "default" : "pointer",
        pointerEvents: "auto",
        outline: isFocused ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
        outlineOffset: -2
      },
      children: /* @__PURE__ */ jsx(
        RenderWidget,
        {
          pageIndex,
          annotation,
          scaleFactor: scale,
          renderKey,
          style: { pointerEvents: "none" }
        }
      )
    }
  );
}
function RadioButtonFillMode(props) {
  const { annotation, field, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly } = useFormWidgetState(props);
  const formState = useFormDocumentState(props.documentId);
  const wrapperRef = useRef(null);
  const isFocused = formState.selectedFieldId === annotation.id;
  useEffect(() => {
    if (isFocused && wrapperRef.current && document.activeElement !== wrapperRef.current) {
      wrapperRef.current.focus();
    }
  }, [isFocused]);
  const selectRadio = useCallback(() => {
    if (isReadOnly) return;
    if (!isWidgetChecked(annotation) && annotation.exportValue) {
      handleChangeField({ ...field, value: annotation.exportValue });
    }
  }, [isReadOnly, annotation, field, handleChangeField]);
  const handleClick = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
    selectRadio();
  }, [isReadOnly, scope, annotation.id, selectRadio]);
  const handleFocus = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
  }, [isReadOnly, scope, annotation.id]);
  const handleBlur = useCallback(() => {
    if ((scope == null ? void 0 : scope.getSelectedFieldId()) === annotation.id) {
      scope == null ? void 0 : scope.deselectField();
    }
  }, [scope, annotation.id]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectRadio();
      }
    },
    [selectRadio]
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: wrapperRef,
      tabIndex: isReadOnly ? -1 : 0,
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isReadOnly ? "default" : "pointer",
        pointerEvents: "auto",
        outline: isFocused ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
        outlineOffset: -2
      },
      children: /* @__PURE__ */ jsx(
        RenderWidget,
        {
          pageIndex,
          annotation,
          scaleFactor: scale,
          renderKey,
          style: { pointerEvents: "none" }
        }
      )
    }
  );
}
function ComboboxField(props) {
  const { annotation, isEditable, onChangeField, onBlur, inputRef } = props;
  const field = annotation.field;
  const { flag, options } = field;
  const name = field.alternateName || field.name;
  const isDisabled = !isEditable || !!(flag & PDF_FORM_FIELD_FLAG.READONLY);
  const isRequired = !!(flag & PDF_FORM_FIELD_FLAG.REQUIRED);
  const handleChange = useCallback(
    (evt) => {
      const select = evt.target;
      const updatedOptions = options.map((opt, i) => ({
        ...opt,
        isSelected: i === select.selectedIndex
      }));
      onChangeField == null ? void 0 : onChangeField({ ...field, options: updatedOptions });
    },
    [onChangeField, field, options]
  );
  const selectedTexts = options.filter((opt) => opt.isSelected).map((opt) => opt.label);
  return /* @__PURE__ */ jsx(
    "select",
    {
      ref: inputRef,
      required: isRequired,
      disabled: isDisabled,
      name,
      "aria-label": name,
      ...selectProps(false, selectedTexts),
      onChange: handleChange,
      onBlur,
      style: { ...selectStyle, opacity: 0 },
      children: options.map((option, index) => {
        return /* @__PURE__ */ jsx(
          "option",
          {
            value: option.label,
            ...optionProps(false, selectedTexts, option.label),
            children: option.label
          },
          index
        );
      })
    }
  );
}
function ComboboxFillMode(props) {
  const { annotation, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly } = useFormWidgetState(props);
  const formState = useFormDocumentState(props.documentId);
  const wrapperRef = useRef(null);
  const selectElRef = useRef(null);
  const isFocused = formState.selectedFieldId === annotation.id;
  useEffect(() => {
    if (isFocused && wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
      (selectElRef.current ?? wrapperRef.current).focus();
    }
  }, [isFocused]);
  const handleFocus = useCallback(() => {
    scope == null ? void 0 : scope.selectField(annotation.id);
  }, [scope, annotation.id]);
  const handleBlur = useCallback(() => {
    requestAnimationFrame(() => {
      var _a;
      if ((_a = wrapperRef.current) == null ? void 0 : _a.contains(document.activeElement)) return;
      if ((scope == null ? void 0 : scope.getSelectedFieldId()) === annotation.id) {
        scope == null ? void 0 : scope.deselectField();
      }
    });
  }, [scope, annotation.id]);
  const selectInputRef = useCallback((el) => {
    selectElRef.current = el;
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: wrapperRef,
      onFocus: handleFocus,
      onBlur: handleBlur,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isReadOnly ? "default" : "pointer",
        pointerEvents: "auto",
        outline: isFocused ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
        outlineOffset: -2
      },
      children: [
        /* @__PURE__ */ jsx(
          RenderWidget,
          {
            pageIndex,
            annotation,
            scaleFactor: scale,
            renderKey,
            style: { pointerEvents: "none" }
          }
        ),
        /* @__PURE__ */ jsx(
          ComboboxField,
          {
            annotation,
            scale,
            pageIndex,
            isEditable: true,
            onChangeField: handleChangeField,
            inputRef: selectInputRef
          }
        )
      ]
    }
  );
}
function ListboxField(props) {
  const { annotation, isEditable, onChangeField, onBlur, inputRef, scale } = props;
  const field = annotation.field;
  const { flag, options } = field;
  const isDisabled = !isEditable || !!(flag & PDF_FORM_FIELD_FLAG.READONLY);
  const isMultipleChoice = !!(flag & PDF_FORM_FIELD_FLAG.CHOICE_MULTL_SELECT);
  const bw = (annotation.strokeWidth ?? 0) * scale;
  const fontSize = (annotation.fontSize ?? 12) * scale;
  const lineHeight = fontSize * 1.2;
  const fontCss = standardFontCssProperties(annotation.fontFamily);
  const containerStyle = useMemo(
    () => ({
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: annotation.color ?? "#FFFFFF",
      borderStyle: "solid",
      borderColor: annotation.strokeColor ?? "#000000",
      borderWidth: bw,
      boxSizing: "border-box",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      outline: "none"
    }),
    [annotation.color, annotation.strokeColor, bw]
  );
  const handleOptionClick = useCallback(
    (clickedIndex) => {
      if (isDisabled) return;
      const updatedOptions = options.map((opt, i) => ({
        ...opt,
        isSelected: isMultipleChoice ? i === clickedIndex ? !opt.isSelected : opt.isSelected : i === clickedIndex
      }));
      onChangeField == null ? void 0 : onChangeField({ ...field, options: updatedOptions });
    },
    [isDisabled, isMultipleChoice, options, field, onChangeField]
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: inputRef,
      onBlur,
      style: containerStyle,
      children: options.map((opt, i) => /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => handleOptionClick(i),
          style: {
            padding: `0 ${4 * scale}px`,
            fontSize,
            lineHeight: `${lineHeight}px`,
            ...fontCss,
            color: opt.isSelected ? "#FFFFFF" : annotation.fontColor ?? "#000000",
            background: opt.isSelected ? "rgba(0, 51, 113, 1)" : "transparent",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: isDisabled ? "default" : "pointer"
          },
          children: opt.label
        },
        i
      ))
    }
  );
}
function ListboxFillMode(props) {
  const { annotation, scale, pageIndex, scope, handleChangeField, renderKey, isReadOnly } = useFormWidgetState(props);
  const formState = useFormDocumentState(props.documentId);
  const [editing, setEditing] = useState(false);
  const wrapperRef = useRef(null);
  const isFocused = formState.selectedFieldId === annotation.id;
  useEffect(() => {
    if (isFocused && wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
      wrapperRef.current.focus();
    }
  }, [isFocused]);
  const handleFocus = useCallback(() => {
    if (isReadOnly) return;
    scope == null ? void 0 : scope.selectField(annotation.id);
    setEditing(true);
  }, [isReadOnly, scope, annotation.id]);
  const handleBlur = useCallback(() => {
    requestAnimationFrame(() => {
      var _a;
      if ((_a = wrapperRef.current) == null ? void 0 : _a.contains(document.activeElement)) return;
      setEditing(false);
      if ((scope == null ? void 0 : scope.getSelectedFieldId()) === annotation.id) {
        scope == null ? void 0 : scope.deselectField();
      }
    });
  }, [scope, annotation.id]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: wrapperRef,
      tabIndex: isReadOnly ? -1 : 0,
      onFocus: handleFocus,
      onBlur: handleBlur,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isReadOnly ? "default" : "pointer",
        pointerEvents: "auto",
        outline: isFocused && !editing ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
        outlineOffset: -2
      },
      children: [
        /* @__PURE__ */ jsx(
          ListboxField,
          {
            annotation,
            scale,
            pageIndex,
            isEditable: true,
            onChangeField: handleChangeField
          }
        ),
        !editing && /* @__PURE__ */ jsx(
          RenderWidget,
          {
            pageIndex,
            annotation,
            scaleFactor: scale,
            renderKey,
            style: { pointerEvents: "none" }
          }
        )
      ]
    }
  );
}
const formRenderers = [
  createRenderer({
    id: "formTextField",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.TEXTFIELD;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      FormTextField,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    renderPreview: ({ bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          border: "1px dashed rgba(66, 133, 244, 0.6)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: `0 ${2 * scale}px`,
          overflow: "hidden"
        }
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: (props) => /* @__PURE__ */ jsx(TextFillMode, { ...props })
  }),
  createRenderer({
    id: "formCheckbox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.CHECKBOX;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      FormCheckbox,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    renderPreview: ({ bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          border: "1px dashed rgba(66, 133, 244, 0.6)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: (props) => /* @__PURE__ */ jsx(ToggleFillMode, { ...props })
  }),
  createRenderer({
    id: "formRadioButton",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.RADIOBUTTON;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      FormRadioButton,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    renderPreview: ({ bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          border: "1px dashed rgba(66, 133, 244, 0.6)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "50%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: (props) => /* @__PURE__ */ jsx(RadioButtonFillMode, { ...props })
  }),
  createRenderer({
    id: "formCombobox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.COMBOBOX;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      FormCombobox,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    renderPreview: ({ bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          border: "1px dashed rgba(66, 133, 244, 0.6)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: `0 ${2 * scale}px`,
          overflow: "hidden"
        }
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: (props) => /* @__PURE__ */ jsx(ComboboxFillMode, { ...props })
  }),
  createRenderer({
    id: "formListbox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.LISTBOX;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      FormListbox,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    renderPreview: ({ bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          border: "1px dashed rgba(66, 133, 244, 0.6)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: (props) => /* @__PURE__ */ jsx(ListboxFillMode, { ...props })
  })
];
function FormRendererRegistration() {
  useRegisterRenderers(formRenderers);
  return null;
}
const FormPluginPackage = createPluginPackage(FormPluginPackage$1).addUtility(FormRendererRegistration).build();
export {
  FormPluginPackage,
  FormRendererRegistration,
  formRenderers,
  useFormCapability,
  useFormDocumentState,
  useFormPlugin
};
//# sourceMappingURL=index.js.map
