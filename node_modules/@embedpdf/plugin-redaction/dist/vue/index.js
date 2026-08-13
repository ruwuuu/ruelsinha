import { createPluginPackage } from "@embedpdf/core";
import { RedactionPlugin, initialDocumentState, RedactionPluginPackage as RedactionPluginPackage$1 } from "@embedpdf/plugin-redaction";
export * from "@embedpdf/plugin-redaction";
import { defineComponent, openBlock, createElementBlock, Fragment, renderList, mergeProps, unref, ref, watch, toValue, computed, normalizeClass, normalizeStyle, createCommentVNode, createVNode, useSlots, createElementVNode, createBlock, withCtx, resolveDynamicComponent, renderSlot, normalizeProps, guardReactiveProps, toDisplayString } from "vue";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/vue";
import { Rotation, PdfStandardFont, PdfTextAlignment, textAlignmentToCss, standardFontCssProperties, PdfAnnotationSubtype } from "@embedpdf/models";
import { CounterRotate } from "@embedpdf/utils/vue";
import { createRenderer, useRegisterRenderers } from "@embedpdf/plugin-annotation/vue";
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "highlight",
  props: {
    color: { default: "#FFFF00" },
    opacity: { default: 1 },
    border: { default: "1px solid red" },
    rects: {},
    rect: {},
    scale: {},
    onClick: {}
  },
  setup(__props) {
    const props = __props;
    const boundingRect = props.rect;
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.rects, (rect, i) => {
        return openBlock(), createElementBlock("div", mergeProps({
          key: i,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: {
            position: "absolute",
            border: __props.border,
            left: `${(unref(boundingRect) ? rect.origin.x - unref(boundingRect).origin.x : rect.origin.x) * __props.scale}px`,
            top: `${(unref(boundingRect) ? rect.origin.y - unref(boundingRect).origin.y : rect.origin.y) * __props.scale}px`,
            width: `${rect.size.width * __props.scale}px`,
            height: `${rect.size.height * __props.scale}px`,
            background: __props.color,
            opacity: __props.opacity,
            pointerEvents: __props.onClick ? "auto" : "none",
            cursor: __props.onClick ? "pointer" : "default",
            zIndex: __props.onClick ? 1 : void 0
          }
        }, { ref_for: true }, _ctx.$attrs), null, 16);
      }), 128);
    };
  }
});
const useRedactionPlugin = () => usePlugin(RedactionPlugin.id);
const useRedactionCapability = () => useCapability(RedactionPlugin.id);
const useRedaction = (documentId) => {
  const { provides } = useRedactionCapability();
  const state = ref(initialDocumentState);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        state.value = initialDocumentState;
        return;
      }
      const scope = providesValue.forDocument(docId);
      try {
        state.value = scope.getState();
      } catch (e) {
        state.value = initialDocumentState;
      }
      const unsubscribe = scope.onStateChange((newState) => {
        state.value = newState;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  const scopedProvides = computed(() => {
    var _a;
    const docId = toValue(documentId);
    return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
  });
  return {
    state,
    provides: scopedProvides
  };
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "marquee-redact",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    className: {},
    stroke: { default: "red" },
    fill: { default: "transparent" }
  },
  setup(__props) {
    const props = __props;
    const { plugin: redactionPlugin } = useRedactionPlugin();
    const documentState = useDocumentState(() => props.documentId);
    const rect = ref(null);
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    const strokeColor = computed(
      () => {
        var _a;
        return props.stroke ?? ((_a = redactionPlugin.value) == null ? void 0 : _a.getPreviewStrokeColor()) ?? "red";
      }
    );
    watch(
      [redactionPlugin, () => props.documentId, () => props.pageIndex],
      ([plugin, docId, pageIdx], _, onCleanup) => {
        if (!plugin || !docId) return;
        const unsubscribe = plugin.onRedactionMarqueeChange(docId, (data) => {
          rect.value = data.pageIndex === pageIdx ? data.rect : null;
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return rect.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        style: normalizeStyle({
          position: "absolute",
          pointerEvents: "none",
          left: `${rect.value.origin.x * actualScale.value}px`,
          top: `${rect.value.origin.y * actualScale.value}px`,
          width: `${rect.value.size.width * actualScale.value}px`,
          height: `${rect.value.size.height * actualScale.value}px`,
          border: `1px solid ${strokeColor.value}`,
          background: __props.fill,
          boxSizing: "border-box"
        }),
        class: normalizeClass(__props.className)
      }, null, 6)) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$1 = {
  key: 0,
  style: {
    mixBlendMode: "normal",
    pointerEvents: "none",
    position: "absolute",
    inset: 0
  }
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "selection-redact",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const { plugin: redactionPlugin } = useRedactionPlugin();
    const rects = ref([]);
    const boundingRect = ref(null);
    const strokeColor = computed(() => {
      var _a;
      return ((_a = redactionPlugin.value) == null ? void 0 : _a.getPreviewStrokeColor()) ?? "red";
    });
    watch(
      [redactionPlugin, () => props.documentId, () => props.pageIndex],
      ([plugin, docId, pageIdx], _, onCleanup) => {
        if (!plugin) {
          rects.value = [];
          boundingRect.value = null;
          return;
        }
        const unsubscribe = plugin.onRedactionSelectionChange(docId, (formattedSelection) => {
          const selection = formattedSelection.find((s) => s.pageIndex === pageIdx);
          rects.value = (selection == null ? void 0 : selection.segmentRects) ?? [];
          boundingRect.value = (selection == null ? void 0 : selection.rect) ?? null;
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return boundingRect.value ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(_sfc_main$7, {
          color: "transparent",
          opacity: 1,
          rects: rects.value,
          scale: __props.scale,
          border: `1px solid ${strokeColor.value}`
        }, null, 8, ["rects", "scale", "border"])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1 = {
  key: 0,
  style: { position: "absolute", inset: 0, pointerEvents: "none" }
};
const _hoisted_2 = ["onPointerdown"];
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "pending-redactions",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: { default: Rotation.Degree0 },
    bboxStroke: { default: "rgba(0,0,0,0.8)" },
    selectionMenu: {}
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const { provides: redaction } = useRedactionCapability();
    const items = ref([]);
    const selectedId = ref(null);
    watch(
      [redaction, () => props.documentId, () => props.pageIndex],
      ([redactionValue, docId, pageIdx], _, onCleanup) => {
        if (!redactionValue) {
          items.value = [];
          selectedId.value = null;
          return;
        }
        const scoped = redactionValue.forDocument(docId);
        const currentState = scoped.getState();
        items.value = (currentState.pending[pageIdx] ?? []).filter((it) => it.source === "legacy");
        selectedId.value = currentState.selected && currentState.selected.page === pageIdx ? currentState.selected.id : null;
        const off1 = scoped.onPendingChange((map) => {
          items.value = (map[pageIdx] ?? []).filter((it) => it.source === "legacy");
        });
        const off2 = scoped.onSelectedChange((sel) => {
          selectedId.value = sel && sel.page === pageIdx ? sel.id : null;
        });
        onCleanup(() => {
          off1 == null ? void 0 : off1();
          off2 == null ? void 0 : off2();
        });
      },
      { immediate: true }
    );
    const select = (e, id) => {
      e.stopPropagation();
      const redactionValue = redaction.value;
      if (!redactionValue) return;
      redactionValue.forDocument(props.documentId).selectPending(props.pageIndex, id);
    };
    const shouldShowMenu = (itemId) => {
      const isSelected = selectedId.value === itemId;
      return isSelected && (!!props.selectionMenu || !!slots["selection-menu"]);
    };
    const buildContext = (item) => ({
      type: "redaction",
      item,
      pageIndex: props.pageIndex
    });
    const menuPlacement = {
      suggestTop: false,
      spaceAbove: 0,
      spaceBelow: 0
    };
    const renderSelectionMenu = (item, rect, menuWrapperProps) => {
      if (!props.selectionMenu) return null;
      return props.selectionMenu({
        rect,
        menuWrapperProps,
        selected: selectedId.value === item.id,
        placement: menuPlacement,
        context: buildContext(item)
      });
    };
    return (_ctx, _cache) => {
      return items.value.length ? (openBlock(), createElementBlock("div", _hoisted_1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(items.value, (item) => {
          return openBlock(), createElementBlock(Fragment, {
            key: item.id
          }, [
            item.kind === "area" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createElementVNode("div", {
                style: normalizeStyle({
                  position: "absolute",
                  left: `${item.rect.origin.x * __props.scale}px`,
                  top: `${item.rect.origin.y * __props.scale}px`,
                  width: `${item.rect.size.width * __props.scale}px`,
                  height: `${item.rect.size.height * __props.scale}px`,
                  background: "transparent",
                  outline: selectedId.value === item.id ? `1px solid ${__props.bboxStroke}` : "none",
                  outlineOffset: "2px",
                  border: `1px solid red`,
                  pointerEvents: "auto",
                  cursor: "pointer"
                }),
                onPointerdown: (e) => select(e, item.id)
              }, null, 44, _hoisted_2),
              shouldShowMenu(item.id) ? (openBlock(), createBlock(unref(CounterRotate), {
                key: 0,
                rect: {
                  origin: { x: item.rect.origin.x * __props.scale, y: item.rect.origin.y * __props.scale },
                  size: { width: item.rect.size.width * __props.scale, height: item.rect.size.height * __props.scale }
                },
                rotation: __props.rotation
              }, {
                default: withCtx(({ rect, menuWrapperProps }) => [
                  __props.selectionMenu ? (openBlock(), createBlock(resolveDynamicComponent(renderSelectionMenu(item, rect, menuWrapperProps)), { key: 0 })) : renderSlot(_ctx.$slots, "selection-menu", {
                    key: 1,
                    context: buildContext(item),
                    selected: selectedId.value === item.id,
                    rect,
                    placement: menuPlacement,
                    menuWrapperProps
                  })
                ]),
                _: 2
              }, 1032, ["rect", "rotation"])) : createCommentVNode("", true)
            ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createElementVNode("div", {
                style: normalizeStyle({
                  position: "absolute",
                  left: `${item.rect.origin.x * __props.scale}px`,
                  top: `${item.rect.origin.y * __props.scale}px`,
                  width: `${item.rect.size.width * __props.scale}px`,
                  height: `${item.rect.size.height * __props.scale}px`,
                  background: "transparent",
                  outline: selectedId.value === item.id ? `1px solid ${__props.bboxStroke}` : "none",
                  outlineOffset: "2px",
                  pointerEvents: "auto",
                  cursor: selectedId.value === item.id ? "pointer" : "default"
                })
              }, [
                createVNode(_sfc_main$7, {
                  rect: item.rect,
                  rects: item.rects,
                  color: "transparent",
                  border: "1px solid red",
                  scale: __props.scale,
                  "on-click": (e) => select(e, item.id)
                }, null, 8, ["rect", "rects", "scale", "on-click"])
              ], 4),
              shouldShowMenu(item.id) ? (openBlock(), createBlock(unref(CounterRotate), {
                key: 0,
                rect: {
                  origin: {
                    x: item.rect.origin.x * __props.scale,
                    y: item.rect.origin.y * __props.scale
                  },
                  size: {
                    width: item.rect.size.width * __props.scale,
                    height: item.rect.size.height * __props.scale
                  }
                },
                rotation: __props.rotation
              }, {
                default: withCtx(({ rect, menuWrapperProps }) => [
                  __props.selectionMenu ? (openBlock(), createBlock(resolveDynamicComponent(renderSelectionMenu(item, rect, menuWrapperProps)), { key: 0 })) : renderSlot(_ctx.$slots, "selection-menu", {
                    key: 1,
                    context: buildContext(item),
                    selected: selectedId.value === item.id,
                    rect,
                    placement: menuPlacement,
                    menuWrapperProps
                  })
                ]),
                _: 2
              }, 1032, ["rect", "rotation"])) : createCommentVNode("", true)
            ], 64))
          ], 64);
        }), 128))
      ])) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "redaction-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: {},
    bboxStroke: { default: "rgba(0,0,0,0.8)" },
    selectionMenu: {}
  },
  setup(__props) {
    const props = __props;
    const documentState = useDocumentState(() => props.documentId);
    const page = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = documentState.value) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[props.pageIndex];
    });
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    const actualRotation = computed(() => {
      var _a, _b;
      if (props.rotation !== void 0) return props.rotation;
      const pageRotation = ((_a = page.value) == null ? void 0 : _a.rotation) ?? 0;
      const docRotation = ((_b = documentState.value) == null ? void 0 : _b.rotation) ?? 0;
      return (pageRotation + docRotation) % 4;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(_sfc_main$4, {
          "document-id": __props.documentId,
          "page-index": __props.pageIndex,
          scale: actualScale.value,
          rotation: actualRotation.value,
          "bbox-stroke": __props.bboxStroke,
          "selection-menu": __props.selectionMenu
        }, {
          "selection-menu": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "selection-menu", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          _: 3
        }, 8, ["document-id", "page-index", "scale", "rotation", "bbox-stroke", "selection-menu"]),
        createVNode(_sfc_main$6, {
          "document-id": __props.documentId,
          "page-index": __props.pageIndex,
          scale: actualScale.value
        }, null, 8, ["document-id", "page-index", "scale"]),
        createVNode(_sfc_main$5, {
          "document-id": __props.documentId,
          "page-index": __props.pageIndex,
          scale: actualScale.value
        }, null, 8, ["document-id", "page-index", "scale"])
      ], 64);
    };
  }
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "redact-highlight",
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
    const segmentRects = computed(() => props.annotation.object.segmentRects ?? []);
    const rect = computed(() => props.annotation.object.rect);
    const strokeColor = computed(() => props.annotation.object.strokeColor ?? "#FF0000");
    const color = computed(() => props.annotation.object.color ?? "#000000");
    const opacity = computed(() => props.annotation.object.opacity ?? 1);
    const textColor = computed(
      () => props.annotation.object.fontColor ?? props.annotation.object.overlayColor ?? "#FFFFFF"
    );
    const overlayText = computed(() => props.annotation.object.overlayText);
    const overlayTextRepeat = computed(() => props.annotation.object.overlayTextRepeat ?? false);
    const fontSize = computed(() => props.annotation.object.fontSize ?? 12);
    const fontFamily = computed(() => props.annotation.object.fontFamily ?? PdfStandardFont.Helvetica);
    const textAlign = computed(() => props.annotation.object.textAlign ?? PdfTextAlignment.Center);
    const renderedOverlayText = computed(() => {
      if (!overlayText.value) return "";
      if (!overlayTextRepeat.value) return overlayText.value;
      const reps = 10;
      return Array(reps).fill(overlayText.value).join(" ");
    });
    const getSegmentStyle = (b) => ({
      position: "absolute",
      left: `${(rect.value ? b.origin.x - rect.value.origin.x : b.origin.x) * props.scale}px`,
      top: `${(rect.value ? b.origin.y - rect.value.origin.y : b.origin.y) * props.scale}px`,
      width: `${b.size.width * props.scale}px`,
      height: `${b.size.height * props.scale}px`,
      // Default: transparent background with strokeColor (C) border
      // Hovered: color (IC) background fill, no border
      background: isHovered.value ? color.value : "transparent",
      border: !isHovered.value ? `2px solid ${strokeColor.value}` : "none",
      opacity: isHovered.value ? opacity.value : 1,
      boxSizing: "border-box",
      pointerEvents: "auto",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: textAlign.value === PdfTextAlignment.Left ? "flex-start" : textAlign.value === PdfTextAlignment.Right ? "flex-end" : "center",
      overflow: "hidden"
    });
    const getTextStyle = (b) => ({
      color: textColor.value,
      fontSize: `${Math.min(fontSize.value * props.scale, b.size.height * props.scale * 0.8)}px`,
      ...standardFontCssProperties(fontFamily.value),
      textAlign: textAlignmentToCss(textAlign.value),
      whiteSpace: overlayTextRepeat.value ? "normal" : "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: { position: "absolute", inset: 0 }
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(segmentRects.value, (b, i) => {
          return openBlock(), createElementBlock("div", {
            key: i,
            onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => __props.onClick && __props.onClick(...args)),
            style: normalizeStyle(getSegmentStyle(b))
          }, [
            isHovered.value && overlayText.value ? (openBlock(), createElementBlock("span", {
              key: 0,
              style: normalizeStyle(getTextStyle(b))
            }, toDisplayString(renderedOverlayText.value), 5)) : createCommentVNode("", true)
          ], 36);
        }), 128))
      ], 32);
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "redact-area",
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
    const strokeColor = computed(() => props.annotation.object.strokeColor ?? "#FF0000");
    const color = computed(() => props.annotation.object.color ?? "#000000");
    const opacity = computed(() => props.annotation.object.opacity ?? 1);
    const textColor = computed(
      () => props.annotation.object.fontColor ?? props.annotation.object.overlayColor ?? "#FFFFFF"
    );
    const overlayText = computed(() => props.annotation.object.overlayText);
    const overlayTextRepeat = computed(() => props.annotation.object.overlayTextRepeat ?? false);
    const fontSize = computed(() => props.annotation.object.fontSize ?? 12);
    const fontFamily = computed(() => props.annotation.object.fontFamily ?? PdfStandardFont.Helvetica);
    const textAlign = computed(() => props.annotation.object.textAlign ?? PdfTextAlignment.Center);
    const renderedOverlayText = computed(() => {
      if (!overlayText.value) return "";
      if (!overlayTextRepeat.value) return overlayText.value;
      const reps = 10;
      return Array(reps).fill(overlayText.value).join(" ");
    });
    const containerStyle = computed(() => ({
      position: "absolute",
      inset: 0,
      // Default: transparent background with strokeColor (C) border
      // Hovered: color (IC) background fill, no border
      background: isHovered.value ? color.value : "transparent",
      border: !isHovered.value ? `2px solid ${strokeColor.value}` : "none",
      opacity: isHovered.value ? opacity.value : 1,
      boxSizing: "border-box",
      pointerEvents: "auto",
      cursor: props.isSelected ? "move" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: textAlign.value === PdfTextAlignment.Left ? "flex-start" : textAlign.value === PdfTextAlignment.Right ? "flex-end" : "center",
      overflow: "hidden"
    }));
    const textStyle = computed(() => ({
      color: textColor.value,
      fontSize: `${fontSize.value * props.scale}px`,
      ...standardFontCssProperties(fontFamily.value),
      textAlign: textAlignmentToCss(textAlign.value),
      whiteSpace: overlayTextRepeat.value ? "normal" : "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: "4px"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onPointerdown: _cache[0] || (_cache[0] = (e) => {
          var _a;
          if (!__props.isSelected) (_a = __props.onClick) == null ? void 0 : _a.call(__props, e);
        }),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => isHovered.value = true),
        onMouseleave: _cache[2] || (_cache[2] = ($event) => isHovered.value = false),
        style: normalizeStyle(containerStyle.value)
      }, [
        isHovered.value && overlayText.value ? (openBlock(), createElementBlock("span", {
          key: 0,
          style: normalizeStyle(textStyle.value)
        }, toDisplayString(renderedOverlayText.value), 5)) : createCommentVNode("", true)
      ], 36);
    };
  }
});
const redactRenderers = [
  createRenderer({
    id: "redactHighlight",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && "segmentRects" in a && (((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0) > 0;
    },
    component: _sfc_main$2,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  }),
  createRenderer({
    id: "redactArea",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && (!("segmentRects" in a) || !(((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0));
    },
    component: _sfc_main$1,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  })
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "redact-renderer-registration",
  setup(__props) {
    useRegisterRenderers(redactRenderers);
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});
const RedactionPluginPackage = createPluginPackage(RedactionPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main$7 as Highlight,
  _sfc_main$6 as MarqueeRedact,
  _sfc_main$4 as PendingRedactions,
  _sfc_main$1 as RedactArea,
  _sfc_main$2 as RedactHighlight,
  _sfc_main as RedactRendererRegistration,
  _sfc_main$3 as RedactionLayer,
  RedactionPluginPackage,
  _sfc_main$5 as SelectionRedact,
  redactRenderers,
  useRedaction,
  useRedactionCapability,
  useRedactionPlugin
};
//# sourceMappingURL=index.js.map
