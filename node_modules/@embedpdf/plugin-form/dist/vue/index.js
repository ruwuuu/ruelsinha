import { createPluginPackage } from "@embedpdf/core";
import { initialDocumentState, FormPlugin, FormPluginPackage as FormPluginPackage$1 } from "@embedpdf/plugin-form";
export * from "@embedpdf/plugin-form";
import { defineComponent, ref, computed, openBlock, createElementBlock, normalizeStyle, Fragment, renderList, toDisplayString, createElementVNode, createCommentVNode, watch, toValue, watchEffect, unref, createVNode, createBlock, renderSlot } from "vue";
import { useIOSZoomPrevention, createRenderer, useRegisterRenderers } from "@embedpdf/plugin-annotation/vue";
import { PDF_FORM_FIELD_TYPE, PDF_FORM_FIELD_FLAG, standardFontCssProperties, isWidgetChecked, ignore, PdfErrorCode, PdfAnnotationSubtype } from "@embedpdf/models";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
import { deepToRaw } from "@embedpdf/utils/vue";
const _hoisted_1$a = {
  key: 0,
  style: { "position": "relative", "width": "100%", "height": "100%" }
};
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "form-text-field",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isHovered = ref(false);
    const object = computed(() => props.currentObject);
    const field = computed(() => object.value.field);
    const isTextField = computed(() => field.value.type === PDF_FORM_FIELD_TYPE.TEXTFIELD);
    const value = computed(
      () => isTextField.value ? field.value.value : ""
    );
    const isComb = computed(
      () => isTextField.value && !!(field.value.flag & PDF_FORM_FIELD_FLAG.TEXT_COMB) && !!field.value.maxLen
    );
    const isMultiline = computed(
      () => isTextField.value && !!(field.value.flag & PDF_FORM_FIELD_FLAG.TEXT_MULTIPLINE)
    );
    const maxLen = computed(
      () => isTextField.value ? field.value.maxLen : void 0
    );
    const borderWidth = computed(() => (object.value.strokeWidth ?? 1) * props.scale);
    const fontCss = computed(() => standardFontCssProperties(object.value.fontFamily));
    const fontSize = computed(() => (object.value.fontSize ?? 12) * props.scale);
    const fontColor = computed(() => object.value.fontColor ?? "#000000");
    const cellWidth = computed(
      () => isComb.value && maxLen.value ? object.value.rect.size.width * props.scale / maxLen.value : 0
    );
    const chars = computed(() => (value.value ?? "").split(""));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!props.isSelected) (_a = props.onClick) == null ? void 0 : _a.call(props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle({
          position: "absolute",
          inset: "0",
          background: object.value.color ?? "rgba(255, 255, 255, 0.9)",
          border: `${borderWidth.value}px solid ${object.value.strokeColor ?? "rgba(0, 0, 0, 0.2)"}`,
          outline: isHovered.value || props.isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
          outlineOffset: "-1px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          cursor: props.isSelected ? "move" : "pointer",
          display: "flex",
          alignItems: isMultiline.value ? "flex-start" : "center",
          overflow: "hidden",
          padding: !isComb.value ? `${borderWidth.value}px ${borderWidth.value}px` : void 0
        })
      }, [
        isComb.value && maxLen.value ? (openBlock(), createElementBlock("div", _hoisted_1$a, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(Array.from({ length: maxLen.value }), (_, i) => {
            return openBlock(), createElementBlock("span", {
              key: i,
              style: normalizeStyle({
                position: "absolute",
                top: "0",
                left: `${i * cellWidth.value}px`,
                width: `${cellWidth.value}px`,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: i < maxLen.value - 1 ? `1px solid ${object.value.strokeColor ?? "rgba(0, 0, 0, 0.2)"}` : "none",
                boxSizing: "border-box",
                fontSize: `${fontSize.value}px`,
                fontFamily: fontCss.value.fontFamily,
                fontWeight: fontCss.value.fontWeight,
                fontStyle: fontCss.value.fontStyle,
                color: fontColor.value,
                lineHeight: "1.2"
              })
            }, toDisplayString(chars.value[i] || ""), 5);
          }), 128))
        ])) : (openBlock(), createElementBlock("span", {
          key: 1,
          style: normalizeStyle({
            fontSize: `${fontSize.value}px`,
            fontFamily: fontCss.value.fontFamily,
            fontWeight: fontCss.value.fontWeight,
            fontStyle: fontCss.value.fontStyle,
            color: fontColor.value,
            lineHeight: "1.2",
            display: "block",
            width: "100%",
            whiteSpace: isMultiline.value ? "pre-wrap" : "nowrap",
            wordBreak: isMultiline.value ? "break-word" : "normal",
            overflowWrap: isMultiline.value ? "break-word" : "normal",
            overflow: "hidden",
            textOverflow: isMultiline.value ? "clip" : "ellipsis"
          })
        }, toDisplayString(value.value), 5))
      ], 36);
    };
  }
});
const _hoisted_1$9 = {
  key: 0,
  viewBox: "0 0 100 100",
  style: { "width": "100%", "height": "100%" }
};
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "form-checkbox",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isHovered = ref(false);
    const object = computed(() => props.currentObject);
    const isChecked = computed(() => isWidgetChecked(object.value));
    const borderWidth = computed(() => (object.value.strokeWidth ?? 1) * props.scale);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!props.isSelected) (_a = props.onClick) == null ? void 0 : _a.call(props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle({
          position: "absolute",
          inset: "0",
          background: object.value.color ?? "#FFFFFF",
          border: `${borderWidth.value}px solid ${object.value.strokeColor ?? "#000000"}`,
          outline: isHovered.value || props.isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
          outlineOffset: "-1px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          cursor: props.isSelected ? "move" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        })
      }, [
        isChecked.value ? (openBlock(), createElementBlock("svg", _hoisted_1$9, [..._cache[3] || (_cache[3] = [
          createElementVNode("path", {
            d: "M28 48C27.45 50.21 29.45 63.13 30 67C30.55 69.21 34.58 72 39 72C44.52 71.45 76.55 32.55 76 32C77.1 31.45 76 25 76 25C74.34 22.24 68 25.45 68 26C68 26 43.55 53 43 53C41.34 53 40.55 41.1 40 40C33.37 36.69 29.1 45.79 28 48Z",
            fill: "#000000"
          }, null, -1)
        ])])) : createCommentVNode("", true)
      ], 36);
    };
  }
});
const _hoisted_1$8 = {
  key: 0,
  style: {
    width: "50%",
    height: "50%",
    borderRadius: "50%",
    background: "#000000"
  }
};
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "form-radio-button",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isHovered = ref(false);
    const object = computed(() => props.currentObject);
    const isChecked = computed(() => isWidgetChecked(object.value));
    const borderWidth = computed(() => (object.value.strokeWidth ?? 1) * props.scale);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!props.isSelected) (_a = props.onClick) == null ? void 0 : _a.call(props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle({
          position: "absolute",
          inset: "0",
          background: object.value.color ?? "#FFFFFF",
          border: `${borderWidth.value}px solid ${object.value.strokeColor ?? "#000000"}`,
          borderRadius: "50%",
          outline: isHovered.value || props.isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
          outlineOffset: "-1px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          cursor: props.isSelected ? "move" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        })
      }, [
        isChecked.value ? (openBlock(), createElementBlock("div", _hoisted_1$8)) : createCommentVNode("", true)
      ], 36);
    };
  }
});
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "form-combobox",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isHovered = ref(false);
    const object = computed(() => props.currentObject);
    const field = computed(() => object.value.field);
    const options = computed(
      () => field.value.type === PDF_FORM_FIELD_TYPE.COMBOBOX ? field.value.options : []
    );
    const selectedLabel = computed(() => {
      var _a;
      return ((_a = options.value.find((o) => o.isSelected)) == null ? void 0 : _a.label) ?? "";
    });
    const borderWidth = computed(() => (object.value.strokeWidth ?? 1) * props.scale);
    const fontSize = computed(() => (object.value.fontSize ?? 12) * props.scale);
    const fontCss = computed(() => standardFontCssProperties(object.value.fontFamily));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!props.isSelected) (_a = props.onClick) == null ? void 0 : _a.call(props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle({
          position: "absolute",
          inset: "0",
          background: object.value.color ?? "#FFFFFF",
          border: `${borderWidth.value}px solid ${object.value.strokeColor ?? "#000000"}`,
          outline: isHovered.value || props.isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
          outlineOffset: "-1px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          cursor: props.isSelected ? "move" : "pointer",
          display: "flex",
          alignItems: "center",
          overflow: "hidden"
        })
      }, [
        createElementVNode("span", {
          style: normalizeStyle({
            flex: "1",
            padding: `0 ${4 * props.scale}px`,
            fontSize: `${fontSize.value}px`,
            fontFamily: fontCss.value.fontFamily,
            fontWeight: fontCss.value.fontWeight,
            fontStyle: fontCss.value.fontStyle,
            color: object.value.fontColor ?? "#000000",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          })
        }, toDisplayString(selectedLabel.value), 5),
        createElementVNode("div", {
          style: normalizeStyle({
            width: `${13 * props.scale}px`,
            minWidth: `${13 * props.scale}px`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: `1px solid ${object.value.strokeColor ?? "#000000"}`
          })
        }, [
          (openBlock(), createElementBlock("svg", {
            viewBox: "0 0 10 6",
            style: normalizeStyle({ width: `${8 * props.scale}px`, height: `${5 * props.scale}px` }),
            fill: "currentColor"
          }, [..._cache[3] || (_cache[3] = [
            createElementVNode("path", { d: "M0 0 L5 6 L10 0 Z" }, null, -1)
          ])], 4))
        ], 4)
      ], 36);
    };
  }
});
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "form-listbox",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const isHovered = ref(false);
    const object = computed(() => props.currentObject);
    const field = computed(() => object.value.field);
    const options = computed(
      () => field.value.type === PDF_FORM_FIELD_TYPE.LISTBOX ? field.value.options : []
    );
    const borderWidth = computed(() => (object.value.strokeWidth ?? 1) * props.scale);
    const fontSize = computed(() => (object.value.fontSize ?? 12) * props.scale);
    const lineHeight = computed(() => fontSize.value * 1.2);
    const fontCss = computed(() => standardFontCssProperties(object.value.fontFamily));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!props.isSelected) (_a = props.onClick) == null ? void 0 : _a.call(props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle({
          position: "absolute",
          inset: "0",
          background: object.value.color ?? "#FFFFFF",
          border: `${borderWidth.value}px solid ${object.value.strokeColor ?? "#000000"}`,
          outline: isHovered.value || props.isSelected ? "1px solid rgba(66, 133, 244, 0.5)" : "none",
          outlineOffset: "-1px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          cursor: props.isSelected ? "move" : "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        })
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(options.value, (opt, i) => {
          return openBlock(), createElementBlock("div", {
            key: i,
            style: normalizeStyle({
              padding: `0 ${4 * props.scale}px`,
              fontSize: `${fontSize.value}px`,
              lineHeight: `${lineHeight.value}px`,
              fontFamily: fontCss.value.fontFamily,
              fontWeight: fontCss.value.fontWeight,
              fontStyle: fontCss.value.fontStyle,
              color: opt.isSelected ? "#FFFFFF" : object.value.fontColor ?? "#000000",
              background: opt.isSelected ? "rgba(0, 51, 113, 1)" : "transparent",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            })
          }, toDisplayString(opt.label), 5);
        }), 128))
      ], 36);
    };
  }
});
const useFormPlugin = () => usePlugin(FormPlugin.id);
const useFormCapability = () => useCapability(FormPlugin.id);
const useFormDocumentState = (documentId) => {
  const { provides } = useFormCapability();
  const state = ref({ ...initialDocumentState });
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (providesValue && docId) {
        const scope = providesValue.forDocument(docId);
        state.value = scope.getState();
        const unsubscribe = scope.onStateChange((newState) => {
          state.value = newState;
        });
        onCleanup(unsubscribe);
      } else {
        state.value = { ...initialDocumentState };
      }
    },
    { immediate: true }
  );
  return {
    state,
    provides: computed(() => {
      var _a;
      return ((_a = provides.value) == null ? void 0 : _a.forDocument(toValue(documentId))) ?? null;
    })
  };
};
function useFormWidgetState(props) {
  const { provides: formProvides } = useFormCapability();
  const renderKey = ref(0);
  const scope = computed(() => {
    var _a;
    return ((_a = formProvides.value) == null ? void 0 : _a.forDocument(props.documentId)) ?? null;
  });
  const annotation = computed(() => props.currentObject);
  const field = computed(() => annotation.value.field);
  const scale = computed(() => props.scale);
  const pageIndex = computed(() => props.pageIndex);
  const isReadOnly = computed(() => !!(field.value.flag & PDF_FORM_FIELD_FLAG.READONLY));
  watchEffect((onCleanup) => {
    const s = scope.value;
    if (!s) return;
    const id = annotation.value.id;
    const unsubscribe = s.onFieldValueChange((event) => {
      if (event.annotationId === id) {
        renderKey.value++;
      }
    });
    onCleanup(unsubscribe);
  });
  function handleChangeField(newField) {
    const s = scope.value;
    if (!s) return;
    s.setFormFieldValues(pageIndex.value, annotation.value, newField);
  }
  return {
    annotation,
    field,
    scale,
    pageIndex,
    scope,
    handleChangeField,
    renderKey,
    isReadOnly
  };
}
const _hoisted_1$7 = ["src"];
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "render-widget",
  props: {
    pageIndex: {},
    annotation: {},
    scaleFactor: { default: 1 },
    renderKey: { default: 0 },
    style: { default: () => ({}) }
  },
  setup(__props) {
    const props = __props;
    const { provides: formProvides } = useFormCapability();
    const imageUrl = ref(null);
    let prevUrl = null;
    const annotationId = computed(() => props.annotation.id);
    const rectWidth = computed(() => props.annotation.rect.size.width);
    const rectHeight = computed(() => props.annotation.rect.size.height);
    watch(
      () => [
        props.pageIndex,
        props.scaleFactor,
        props.renderKey,
        annotationId.value,
        rectWidth.value,
        rectHeight.value,
        formProvides.value
      ],
      (_, __, onCleanup) => {
        const fp = formProvides.value;
        if (!fp) return;
        const task = fp.renderWidget({
          pageIndex: props.pageIndex,
          annotation: deepToRaw(props.annotation),
          options: {
            scaleFactor: props.scaleFactor,
            dpr: window.devicePixelRatio
          }
        });
        task.wait((blob) => {
          const url = URL.createObjectURL(blob);
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          prevUrl = url;
          imageUrl.value = url;
        }, ignore);
        onCleanup(() => {
          task.abort({
            code: PdfErrorCode.Cancelled,
            message: "canceled render task"
          });
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
            prevUrl = null;
          }
        });
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return imageUrl.value ? (openBlock(), createElementBlock("img", {
        key: 0,
        src: imageUrl.value,
        alt: "",
        style: normalizeStyle({ width: "100%", height: "100%", display: "block", ...__props.style })
      }, null, 12, _hoisted_1$7)) : createCommentVNode("", true);
    };
  }
});
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
const _hoisted_1$6 = ["required", "disabled", "type", "name", "aria-label", "value", "maxlength"];
const _hoisted_2$1 = ["required", "disabled", "type", "name", "aria-label", "value", "maxlength"];
const _hoisted_3 = ["required", "disabled", "name", "aria-label", "value", "maxlength"];
const _hoisted_4 = ["required", "disabled", "name", "aria-label", "value", "maxlength"];
const _hoisted_5 = ["required", "disabled", "type", "name", "aria-label", "value", "maxlength"];
const _hoisted_6 = ["required", "disabled", "type", "name", "aria-label", "value", "maxlength"];
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "text-field",
  props: {
    scale: {},
    pageIndex: {},
    isEditable: { type: Boolean },
    onChangeField: { type: Function },
    onFocus: { type: Function },
    onBlur: { type: Function },
    inputRef: { type: Function },
    syncExternalValue: { type: Boolean },
    annotation: {}
  },
  setup(__props) {
    const props = __props;
    const field = computed(() => props.annotation.field);
    const flag = computed(() => field.value.flag);
    const name = computed(() => field.value.name);
    const value = computed(() => field.value.value);
    const localValue = ref(value.value);
    watch(value, (v) => {
      if (!props.syncExternalValue) return;
      localValue.value = v;
    });
    function changeValue(evt) {
      var _a;
      const newValue = evt.target.value;
      localValue.value = newValue;
      (_a = props.onChangeField) == null ? void 0 : _a.call(props, { ...field.value, value: newValue });
    }
    const bw = computed(() => (props.annotation.strokeWidth ?? 0) * props.scale);
    const fontCss = computed(() => standardFontCssProperties(props.annotation.fontFamily));
    const computedFontPx = computed(() => props.annotation.fontSize * props.scale);
    const iosCompensation = useIOSZoomPrevention(computedFontPx, true);
    const visualStyle = computed(() => ({
      backgroundColor: props.annotation.color ?? "transparent",
      borderStyle: "solid",
      borderColor: props.annotation.strokeColor ?? "transparent",
      borderWidth: `${bw.value}px`,
      color: props.annotation.fontColor,
      ...fontCss.value,
      fontSize: `${iosCompensation.value.adjustedFontPx}px`,
      padding: `${bw.value}px ${bw.value}px`
    }));
    const isDisabled = computed(
      () => !props.isEditable || !!(flag.value & PDF_FORM_FIELD_FLAG.READONLY)
    );
    const isRequired = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.REQUIRED));
    const isPassword = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.TEXT_PASSWORD));
    const isMultipleLine = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.TEXT_MULTIPLINE));
    const isComb = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.TEXT_COMB));
    const maxLen = computed(() => field.value.maxLen);
    const cellWidth = computed(
      () => isComb.value && maxLen.value ? props.annotation.rect.size.width * props.scale / maxLen.value : 0
    );
    const chars = computed(() => (localValue.value || "").split(""));
    const caretIndex = computed(() => chars.value.length);
    const caretVisible = ref(true);
    let caretInterval;
    watch(
      caretIndex,
      () => {
        caretVisible.value = true;
        clearInterval(caretInterval);
        caretInterval = setInterval(() => {
          caretVisible.value = !caretVisible.value;
        }, 530);
      },
      { immediate: true }
    );
    const combContainerStyle = computed(() => ({
      position: "relative",
      width: "100%",
      height: "100%",
      borderRadius: 0,
      boxSizing: "border-box",
      backgroundColor: props.annotation.color ?? "transparent",
      borderStyle: "solid",
      borderColor: props.annotation.strokeColor ?? "transparent",
      borderWidth: `${bw.value}px`
    }));
    const cellFontStyle = computed(() => ({
      color: props.annotation.fontColor,
      ...fontCss.value,
      fontSize: `${iosCompensation.value.adjustedFontPx}px`
    }));
    function setInputRef(el) {
      var _a;
      (_a = props.inputRef) == null ? void 0 : _a.call(props, el);
    }
    return (_ctx, _cache) => {
      return isComb.value && maxLen.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        unref(iosCompensation).wrapperStyle ? (openBlock(), createElementBlock("div", {
          key: 0,
          style: normalizeStyle(unref(iosCompensation).wrapperStyle)
        }, [
          createElementVNode("div", {
            style: normalizeStyle(combContainerStyle.value)
          }, [
            createElementVNode("input", {
              ref: setInputRef,
              required: isRequired.value,
              disabled: isDisabled.value,
              type: isPassword.value ? "password" : "text",
              name: name.value,
              "aria-label": name.value,
              value: localValue.value,
              maxlength: maxLen.value,
              onFocus: _cache[0] || (_cache[0] = ($event) => {
                var _a;
                return (_a = props.onFocus) == null ? void 0 : _a.call(props);
              }),
              onInput: changeValue,
              onBlur: _cache[1] || (_cache[1] = ($event) => {
                var _a;
                return (_a = props.onBlur) == null ? void 0 : _a.call(props);
              }),
              style: {
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
              }
            }, null, 40, _hoisted_1$6),
            (openBlock(true), createElementBlock(Fragment, null, renderList(Array.from({ length: maxLen.value }), (_, i) => {
              return openBlock(), createElementBlock("span", {
                key: i,
                style: normalizeStyle({
                  ...cellFontStyle.value,
                  position: "absolute",
                  top: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  left: `${i * cellWidth.value}px`,
                  width: `${cellWidth.value}px`
                })
              }, toDisplayString(chars.value[i] || ""), 5);
            }), 128)),
            caretIndex.value < maxLen.value ? (openBlock(), createElementBlock("span", {
              key: 0,
              style: normalizeStyle({
                position: "absolute",
                top: "15%",
                height: "70%",
                width: "1px",
                backgroundColor: "black",
                pointerEvents: "none",
                left: `${caretIndex.value * cellWidth.value + cellWidth.value / 2}px`,
                opacity: caretVisible.value ? 1 : 0
              })
            }, null, 4)) : createCommentVNode("", true)
          ], 4)
        ], 4)) : (openBlock(), createElementBlock("div", {
          key: 1,
          style: normalizeStyle(combContainerStyle.value)
        }, [
          createElementVNode("input", {
            ref: setInputRef,
            required: isRequired.value,
            disabled: isDisabled.value,
            type: isPassword.value ? "password" : "text",
            name: name.value,
            "aria-label": name.value,
            value: localValue.value,
            maxlength: maxLen.value,
            onFocus: _cache[2] || (_cache[2] = ($event) => {
              var _a;
              return (_a = props.onFocus) == null ? void 0 : _a.call(props);
            }),
            onInput: changeValue,
            onBlur: _cache[3] || (_cache[3] = ($event) => {
              var _a;
              return (_a = props.onBlur) == null ? void 0 : _a.call(props);
            }),
            style: {
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
            }
          }, null, 40, _hoisted_2$1),
          (openBlock(true), createElementBlock(Fragment, null, renderList(Array.from({ length: maxLen.value }), (_, i) => {
            return openBlock(), createElementBlock("span", {
              key: i,
              style: normalizeStyle({
                ...cellFontStyle.value,
                position: "absolute",
                top: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                left: `${i * cellWidth.value}px`,
                width: `${cellWidth.value}px`
              })
            }, toDisplayString(chars.value[i] || ""), 5);
          }), 128)),
          caretIndex.value < maxLen.value ? (openBlock(), createElementBlock("span", {
            key: 0,
            style: normalizeStyle({
              position: "absolute",
              top: "15%",
              height: "70%",
              width: "1px",
              backgroundColor: "black",
              pointerEvents: "none",
              left: `${caretIndex.value * cellWidth.value + cellWidth.value / 2}px`,
              opacity: caretVisible.value ? 1 : 0
            })
          }, null, 4)) : createCommentVNode("", true)
        ], 4))
      ], 64)) : isMultipleLine.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        unref(iosCompensation).wrapperStyle ? (openBlock(), createElementBlock("div", {
          key: 0,
          style: normalizeStyle(unref(iosCompensation).wrapperStyle)
        }, [
          createElementVNode("textarea", {
            ref: setInputRef,
            required: isRequired.value,
            disabled: isDisabled.value,
            name: name.value,
            "aria-label": name.value,
            value: localValue.value,
            maxlength: maxLen.value,
            onFocus: _cache[4] || (_cache[4] = ($event) => {
              var _a;
              return (_a = props.onFocus) == null ? void 0 : _a.call(props);
            }),
            onInput: changeValue,
            onBlur: _cache[5] || (_cache[5] = ($event) => {
              var _a;
              return (_a = props.onBlur) == null ? void 0 : _a.call(props);
            }),
            style: normalizeStyle({ ...unref(textareaStyle), ...visualStyle.value })
          }, null, 44, _hoisted_3)
        ], 4)) : (openBlock(), createElementBlock("textarea", {
          key: 1,
          ref: setInputRef,
          required: isRequired.value,
          disabled: isDisabled.value,
          name: name.value,
          "aria-label": name.value,
          value: localValue.value,
          maxlength: maxLen.value,
          onFocus: _cache[6] || (_cache[6] = ($event) => {
            var _a;
            return (_a = props.onFocus) == null ? void 0 : _a.call(props);
          }),
          onInput: changeValue,
          onBlur: _cache[7] || (_cache[7] = ($event) => {
            var _a;
            return (_a = props.onBlur) == null ? void 0 : _a.call(props);
          }),
          style: normalizeStyle({ ...unref(textareaStyle), ...visualStyle.value })
        }, null, 44, _hoisted_4))
      ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
        unref(iosCompensation).wrapperStyle ? (openBlock(), createElementBlock("div", {
          key: 0,
          style: normalizeStyle(unref(iosCompensation).wrapperStyle)
        }, [
          createElementVNode("input", {
            ref: setInputRef,
            required: isRequired.value,
            disabled: isDisabled.value,
            type: isPassword.value ? "password" : "text",
            name: name.value,
            "aria-label": name.value,
            value: localValue.value,
            maxlength: maxLen.value,
            onFocus: _cache[8] || (_cache[8] = ($event) => {
              var _a;
              return (_a = props.onFocus) == null ? void 0 : _a.call(props);
            }),
            onInput: changeValue,
            onBlur: _cache[9] || (_cache[9] = ($event) => {
              var _a;
              return (_a = props.onBlur) == null ? void 0 : _a.call(props);
            }),
            style: normalizeStyle({ ...unref(inputStyle), ...visualStyle.value })
          }, null, 44, _hoisted_5)
        ], 4)) : (openBlock(), createElementBlock("input", {
          key: 1,
          ref: setInputRef,
          required: isRequired.value,
          disabled: isDisabled.value,
          type: isPassword.value ? "password" : "text",
          name: name.value,
          "aria-label": name.value,
          value: localValue.value,
          maxlength: maxLen.value,
          onFocus: _cache[10] || (_cache[10] = ($event) => {
            var _a;
            return (_a = props.onFocus) == null ? void 0 : _a.call(props);
          }),
          onInput: changeValue,
          onBlur: _cache[11] || (_cache[11] = ($event) => {
            var _a;
            return (_a = props.onBlur) == null ? void 0 : _a.call(props);
          }),
          style: normalizeStyle({ ...unref(inputStyle), ...visualStyle.value })
        }, null, 44, _hoisted_6))
      ], 64));
    };
  }
});
const _hoisted_1$5 = { style: {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  pointerEvents: "auto",
  outline: "none"
} };
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "text-fill-mode",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const ws = useFormWidgetState(props);
    const { state: formState } = useFormDocumentState(() => props.documentId);
    const editing = ref(false);
    const inputEl = ref(null);
    const isFocused = computed(() => formState.value.selectedFieldId === ws.annotation.value.id);
    watch(isFocused, (focused) => {
      if (focused && inputEl.value && document.activeElement !== inputEl.value) {
        inputEl.value.focus();
      }
    });
    function handleFocus() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
      editing.value = true;
    }
    function handleBlur() {
      var _a, _b;
      editing.value = false;
      if (((_a = ws.scope.value) == null ? void 0 : _a.getSelectedFieldId()) === ws.annotation.value.id) {
        (_b = ws.scope.value) == null ? void 0 : _b.deselectField();
      }
    }
    function handleInputRef(el) {
      inputEl.value = el;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createVNode(_sfc_main$d, {
          pageIndex: unref(ws).pageIndex.value,
          annotation: unref(ws).annotation.value,
          scaleFactor: unref(ws).scale.value,
          renderKey: unref(ws).renderKey.value,
          style: normalizeStyle({
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            visibility: editing.value ? "hidden" : "visible"
          })
        }, null, 8, ["pageIndex", "annotation", "scaleFactor", "renderKey", "style"]),
        createElementVNode("div", {
          style: normalizeStyle({
            position: "absolute",
            inset: "0",
            zIndex: 1,
            opacity: editing.value ? 1 : 0
          })
        }, [
          createVNode(_sfc_main$c, {
            annotation: unref(ws).annotation.value,
            scale: unref(ws).scale.value,
            pageIndex: unref(ws).pageIndex.value,
            isEditable: true,
            onChangeField: unref(ws).handleChangeField,
            syncExternalValue: !editing.value,
            onFocus: handleFocus,
            onBlur: handleBlur,
            inputRef: handleInputRef
          }, null, 8, ["annotation", "scale", "pageIndex", "onChangeField", "syncExternalValue"])
        ], 4)
      ]);
    };
  }
});
const _hoisted_1$4 = ["tabindex"];
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "toggle-fill-mode",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const ws = useFormWidgetState(props);
    const { state: formState } = useFormDocumentState(() => props.documentId);
    const wrapperEl = ref(null);
    const isFocused = computed(() => formState.value.selectedFieldId === ws.annotation.value.id);
    watch(isFocused, (focused) => {
      if (focused && wrapperEl.value && document.activeElement !== wrapperEl.value) {
        wrapperEl.value.focus();
      }
    });
    function toggle() {
      if (ws.isReadOnly.value) return;
      const checked = isWidgetChecked(ws.annotation.value);
      const newValue = checked ? "Off" : ws.annotation.value.exportValue ?? "Yes";
      ws.handleChangeField({ ...ws.field.value, value: newValue });
    }
    function handleClick() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
      toggle();
    }
    function handleFocus() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
    }
    function handleBlur() {
      var _a, _b;
      if (((_a = ws.scope.value) == null ? void 0 : _a.getSelectedFieldId()) === ws.annotation.value.id) {
        (_b = ws.scope.value) == null ? void 0 : _b.deselectField();
      }
    }
    function handleKeyDown(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperEl",
        ref: wrapperEl,
        tabindex: unref(ws).isReadOnly.value ? -1 : 0,
        onClick: handleClick,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeydown: handleKeyDown,
        style: normalizeStyle({
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: unref(ws).isReadOnly.value ? "default" : "pointer",
          pointerEvents: "auto",
          outline: isFocused.value ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
          outlineOffset: "-2px"
        })
      }, [
        createVNode(_sfc_main$d, {
          pageIndex: unref(ws).pageIndex.value,
          annotation: unref(ws).annotation.value,
          scaleFactor: unref(ws).scale.value,
          renderKey: unref(ws).renderKey.value,
          style: { pointerEvents: "none" }
        }, null, 8, ["pageIndex", "annotation", "scaleFactor", "renderKey"])
      ], 44, _hoisted_1$4);
    };
  }
});
const _hoisted_1$3 = ["tabindex"];
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "radio-button-fill-mode",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const ws = useFormWidgetState(props);
    const { state: formState } = useFormDocumentState(() => props.documentId);
    const wrapperEl = ref(null);
    const isFocused = computed(() => formState.value.selectedFieldId === ws.annotation.value.id);
    watch(isFocused, (focused) => {
      if (focused && wrapperEl.value && document.activeElement !== wrapperEl.value) {
        wrapperEl.value.focus();
      }
    });
    function selectRadio() {
      if (ws.isReadOnly.value) return;
      if (!isWidgetChecked(ws.annotation.value) && ws.annotation.value.exportValue) {
        ws.handleChangeField({ ...ws.field.value, value: ws.annotation.value.exportValue });
      }
    }
    function handleClick() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
      selectRadio();
    }
    function handleFocus() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
    }
    function handleBlur() {
      var _a, _b;
      if (((_a = ws.scope.value) == null ? void 0 : _a.getSelectedFieldId()) === ws.annotation.value.id) {
        (_b = ws.scope.value) == null ? void 0 : _b.deselectField();
      }
    }
    function handleKeyDown(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectRadio();
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperEl",
        ref: wrapperEl,
        tabindex: unref(ws).isReadOnly.value ? -1 : 0,
        onClick: handleClick,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeydown: handleKeyDown,
        style: normalizeStyle({
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: unref(ws).isReadOnly.value ? "default" : "pointer",
          pointerEvents: "auto",
          outline: isFocused.value ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
          outlineOffset: "-2px"
        })
      }, [
        createVNode(_sfc_main$d, {
          pageIndex: unref(ws).pageIndex.value,
          annotation: unref(ws).annotation.value,
          scaleFactor: unref(ws).scale.value,
          renderKey: unref(ws).renderKey.value,
          style: { pointerEvents: "none" }
        }, null, 8, ["pageIndex", "annotation", "scaleFactor", "renderKey"])
      ], 44, _hoisted_1$3);
    };
  }
});
const _hoisted_1$2 = ["required", "disabled", "name", "aria-label"];
const _hoisted_2 = ["value", "selected"];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "combobox-field",
  props: {
    scale: {},
    pageIndex: {},
    isEditable: { type: Boolean },
    onChangeField: { type: Function },
    onFocus: { type: Function },
    onBlur: { type: Function },
    inputRef: { type: Function },
    syncExternalValue: { type: Boolean },
    annotation: {}
  },
  setup(__props) {
    const props = __props;
    const field = computed(() => props.annotation.field);
    const flag = computed(() => field.value.flag);
    const options = computed(() => field.value.options);
    const name = computed(() => field.value.alternateName || field.value.name);
    const isDisabled = computed(
      () => !props.isEditable || !!(flag.value & PDF_FORM_FIELD_FLAG.READONLY)
    );
    const isRequired = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.REQUIRED));
    const selectedIndex = computed(() => options.value.findIndex((o) => o.isSelected));
    function handleChange(evt) {
      var _a;
      const select = evt.target;
      const updatedOptions = options.value.map((opt, i) => ({
        ...opt,
        isSelected: i === select.selectedIndex
      }));
      (_a = props.onChangeField) == null ? void 0 : _a.call(props, { ...field.value, options: updatedOptions });
    }
    function setInputRef(el) {
      var _a;
      (_a = props.inputRef) == null ? void 0 : _a.call(props, el);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("select", {
        ref: setInputRef,
        required: isRequired.value,
        disabled: isDisabled.value,
        name: name.value,
        "aria-label": name.value,
        onChange: handleChange,
        onBlur: _cache[0] || (_cache[0] = ($event) => {
          var _a;
          return (_a = props.onBlur) == null ? void 0 : _a.call(props);
        }),
        style: normalizeStyle({ ...unref(selectStyle), opacity: 0 })
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(options.value, (option, index) => {
          return openBlock(), createElementBlock("option", {
            key: index,
            value: option.label,
            selected: index === selectedIndex.value
          }, toDisplayString(option.label), 9, _hoisted_2);
        }), 128))
      ], 44, _hoisted_1$2);
    };
  }
});
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "combobox-fill-mode",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const ws = useFormWidgetState(props);
    const { state: formState } = useFormDocumentState(() => props.documentId);
    const wrapperEl = ref(null);
    const selectEl = ref(null);
    const isFocused = computed(() => formState.value.selectedFieldId === ws.annotation.value.id);
    watch(isFocused, (focused) => {
      if (focused && wrapperEl.value && !wrapperEl.value.contains(document.activeElement)) {
        (selectEl.value ?? wrapperEl.value).focus();
      }
    });
    function handleFocus() {
      var _a;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
    }
    function handleBlur() {
      requestAnimationFrame(() => {
        var _a, _b, _c;
        if ((_a = wrapperEl.value) == null ? void 0 : _a.contains(document.activeElement)) return;
        if (((_b = ws.scope.value) == null ? void 0 : _b.getSelectedFieldId()) === ws.annotation.value.id) {
          (_c = ws.scope.value) == null ? void 0 : _c.deselectField();
        }
      });
    }
    function selectInputRef(el) {
      selectEl.value = el;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperEl",
        ref: wrapperEl,
        onFocus: handleFocus,
        onBlur: handleBlur,
        style: normalizeStyle({
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: unref(ws).isReadOnly.value ? "default" : "pointer",
          pointerEvents: "auto",
          outline: isFocused.value ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
          outlineOffset: "-2px"
        })
      }, [
        createVNode(_sfc_main$d, {
          pageIndex: unref(ws).pageIndex.value,
          annotation: unref(ws).annotation.value,
          scaleFactor: unref(ws).scale.value,
          renderKey: unref(ws).renderKey.value,
          style: { pointerEvents: "none" }
        }, null, 8, ["pageIndex", "annotation", "scaleFactor", "renderKey"]),
        createVNode(_sfc_main$8, {
          annotation: unref(ws).annotation.value,
          scale: unref(ws).scale.value,
          pageIndex: unref(ws).pageIndex.value,
          isEditable: true,
          onChangeField: unref(ws).handleChangeField,
          inputRef: selectInputRef
        }, null, 8, ["annotation", "scale", "pageIndex", "onChangeField"])
      ], 36);
    };
  }
});
const _hoisted_1$1 = ["onClick"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "listbox-field",
  props: {
    scale: {},
    pageIndex: {},
    isEditable: { type: Boolean },
    onChangeField: { type: Function },
    onFocus: { type: Function },
    onBlur: { type: Function },
    inputRef: { type: Function },
    syncExternalValue: { type: Boolean },
    annotation: {}
  },
  setup(__props) {
    const props = __props;
    const field = computed(() => props.annotation.field);
    const flag = computed(() => field.value.flag);
    const options = computed(() => field.value.options);
    const isDisabled = computed(
      () => !props.isEditable || !!(flag.value & PDF_FORM_FIELD_FLAG.READONLY)
    );
    const isMultipleChoice = computed(() => !!(flag.value & PDF_FORM_FIELD_FLAG.CHOICE_MULTL_SELECT));
    const bw = computed(() => (props.annotation.strokeWidth ?? 0) * props.scale);
    const fontSize = computed(() => (props.annotation.fontSize ?? 12) * props.scale);
    const lineHeight = computed(() => fontSize.value * 1.2);
    const fontCss = computed(() => standardFontCssProperties(props.annotation.fontFamily));
    const containerStyle = computed(() => ({
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: props.annotation.color ?? "#FFFFFF",
      borderStyle: "solid",
      borderColor: props.annotation.strokeColor ?? "#000000",
      borderWidth: `${bw.value}px`,
      boxSizing: "border-box",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      outline: "none"
    }));
    function handleOptionClick(clickedIndex) {
      var _a;
      if (isDisabled.value) return;
      const updatedOptions = options.value.map((opt, i) => ({
        ...opt,
        isSelected: isMultipleChoice.value ? i === clickedIndex ? !opt.isSelected : opt.isSelected : i === clickedIndex
      }));
      (_a = props.onChangeField) == null ? void 0 : _a.call(props, { ...field.value, options: updatedOptions });
    }
    function setInputRef(el) {
      var _a;
      (_a = props.inputRef) == null ? void 0 : _a.call(props, el);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref: setInputRef,
        onBlur: _cache[0] || (_cache[0] = ($event) => {
          var _a;
          return (_a = props.onBlur) == null ? void 0 : _a.call(props);
        }),
        style: normalizeStyle(containerStyle.value)
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(options.value, (opt, i) => {
          return openBlock(), createElementBlock("div", {
            key: i,
            onClick: ($event) => handleOptionClick(i),
            style: normalizeStyle({
              padding: `0 ${4 * props.scale}px`,
              fontSize: `${fontSize.value}px`,
              lineHeight: `${lineHeight.value}px`,
              fontFamily: fontCss.value.fontFamily,
              fontWeight: fontCss.value.fontWeight,
              fontStyle: fontCss.value.fontStyle,
              color: opt.isSelected ? "#FFFFFF" : props.annotation.fontColor ?? "#000000",
              background: opt.isSelected ? "rgba(0, 51, 113, 1)" : "transparent",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: isDisabled.value ? "default" : "pointer"
            })
          }, toDisplayString(opt.label), 13, _hoisted_1$1);
        }), 128))
      ], 36);
    };
  }
});
const _hoisted_1 = ["tabindex"];
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "listbox-fill-mode",
  props: {
    annotation: {},
    currentObject: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    scale: {},
    pageIndex: {},
    documentId: {},
    onClick: { type: Function },
    appearanceActive: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const ws = useFormWidgetState(props);
    const { state: formState } = useFormDocumentState(() => props.documentId);
    const editing = ref(false);
    const wrapperEl = ref(null);
    const isFocused = computed(() => formState.value.selectedFieldId === ws.annotation.value.id);
    watch(isFocused, (focused) => {
      if (focused && wrapperEl.value && !wrapperEl.value.contains(document.activeElement)) {
        wrapperEl.value.focus();
      }
    });
    function handleFocus() {
      var _a;
      if (ws.isReadOnly.value) return;
      (_a = ws.scope.value) == null ? void 0 : _a.selectField(ws.annotation.value.id);
      editing.value = true;
    }
    function handleBlur() {
      requestAnimationFrame(() => {
        var _a, _b, _c;
        if ((_a = wrapperEl.value) == null ? void 0 : _a.contains(document.activeElement)) return;
        editing.value = false;
        if (((_b = ws.scope.value) == null ? void 0 : _b.getSelectedFieldId()) === ws.annotation.value.id) {
          (_c = ws.scope.value) == null ? void 0 : _c.deselectField();
        }
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperEl",
        ref: wrapperEl,
        tabindex: unref(ws).isReadOnly.value ? -1 : 0,
        onFocus: handleFocus,
        onBlur: handleBlur,
        style: normalizeStyle({
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: unref(ws).isReadOnly.value ? "default" : "pointer",
          pointerEvents: "auto",
          outline: isFocused.value && !editing.value ? "2px solid rgba(66, 133, 244, 0.8)" : "none",
          outlineOffset: "-2px"
        })
      }, [
        createVNode(_sfc_main$6, {
          annotation: unref(ws).annotation.value,
          scale: unref(ws).scale.value,
          pageIndex: unref(ws).pageIndex.value,
          isEditable: true,
          onChangeField: unref(ws).handleChangeField
        }, null, 8, ["annotation", "scale", "pageIndex", "onChangeField"]),
        !editing.value ? (openBlock(), createBlock(_sfc_main$d, {
          key: 0,
          pageIndex: unref(ws).pageIndex.value,
          annotation: unref(ws).annotation.value,
          scaleFactor: unref(ws).scale.value,
          renderKey: unref(ws).renderKey.value,
          style: { pointerEvents: "none" }
        }, null, 8, ["pageIndex", "annotation", "scaleFactor", "renderKey"])) : createCommentVNode("", true)
      ], 44, _hoisted_1);
    };
  }
});
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "text-field-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const style = computed(() => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: `${props.bounds.size.width * props.scale}px`,
      height: `${props.bounds.size.height * props.scale}px`,
      border: "1px dashed rgba(66, 133, 244, 0.6)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      padding: `0 ${2 * props.scale}px`,
      overflow: "hidden"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "checkbox-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const style = computed(() => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: `${props.bounds.size.width * props.scale}px`,
      height: `${props.bounds.size.height * props.scale}px`,
      border: "1px dashed rgba(66, 133, 244, 0.6)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "radio-button-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const style = computed(() => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: `${props.bounds.size.width * props.scale}px`,
      height: `${props.bounds.size.height * props.scale}px`,
      border: "1px dashed rgba(66, 133, 244, 0.6)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: "50%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "listbox-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const style = computed(() => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: `${props.bounds.size.width * props.scale}px`,
      height: `${props.bounds.size.height * props.scale}px`,
      border: "1px dashed rgba(66, 133, 244, 0.6)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const formRenderers = [
  createRenderer({
    id: "formTextField",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.TEXTFIELD;
    },
    component: _sfc_main$i,
    renderPreview: _sfc_main$4,
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: _sfc_main$b
  }),
  createRenderer({
    id: "formCheckbox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.CHECKBOX;
    },
    component: _sfc_main$h,
    renderPreview: _sfc_main$3,
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: _sfc_main$a
  }),
  createRenderer({
    id: "formRadioButton",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.RADIOBUTTON;
    },
    component: _sfc_main$g,
    renderPreview: _sfc_main$2,
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: _sfc_main$9
  }),
  createRenderer({
    id: "formCombobox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.COMBOBOX;
    },
    component: _sfc_main$f,
    renderPreview: _sfc_main$4,
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: _sfc_main$7
  }),
  createRenderer({
    id: "formListbox",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.WIDGET && ((_a = a.field) == null ? void 0 : _a.type) === PDF_FORM_FIELD_TYPE.LISTBOX;
    },
    component: _sfc_main$e,
    renderPreview: _sfc_main$1,
    interactionDefaults: { isDraggable: false, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    renderLocked: _sfc_main$5
  })
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "form-renderer-registration",
  setup(__props) {
    useRegisterRenderers(formRenderers);
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});
const FormPluginPackage = createPluginPackage(FormPluginPackage$1).addUtility(_sfc_main).build();
export {
  FormPluginPackage,
  useFormCapability,
  useFormDocumentState,
  useFormPlugin,
  useFormWidgetState
};
//# sourceMappingURL=index.js.map
