import { createPluginPackage } from "@embedpdf/core";
import { SelectionPlugin, SelectionPluginPackage as SelectionPluginPackage$1 } from "@embedpdf/plugin-selection";
export * from "@embedpdf/plugin-selection";
import { defineComponent, useSlots, computed, ref, watch, openBlock, createElementBlock, Fragment, createElementVNode, normalizeStyle, renderList, createBlock, unref, withCtx, resolveDynamicComponent, renderSlot, createCommentVNode, normalizeClass, createVNode, normalizeProps, guardReactiveProps, watchEffect } from "vue";
import { Rotation } from "@embedpdf/models";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/vue";
import { CounterRotate } from "@embedpdf/utils/vue";
const useSelectionCapability = () => useCapability(SelectionPlugin.id);
const useSelectionPlugin = () => usePlugin(SelectionPlugin.id);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "text-selection",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: { default: Rotation.Degree0 },
    background: { default: "rgba(33,150,243)" },
    selectionMenu: {}
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const { plugin: selPlugin } = useSelectionPlugin();
    const documentState = useDocumentState(() => props.documentId);
    const page = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = documentState.value) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[props.pageIndex];
    });
    const rects = ref([]);
    const boundingRect = ref(null);
    const placement = ref(null);
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
    const shouldRenderMenu = computed(() => {
      if (!placement.value) return false;
      if (placement.value.pageIndex !== props.pageIndex) return false;
      if (!placement.value.isVisible) return false;
      return !!props.selectionMenu || !!slots["selection-menu"];
    });
    watch(
      [() => selPlugin.value, () => props.documentId, () => props.pageIndex],
      ([plugin, docId, pageIdx], _, onCleanup) => {
        if (!plugin || !docId) {
          rects.value = [];
          boundingRect.value = null;
          return;
        }
        const unregister = plugin.registerSelectionOnPage({
          documentId: docId,
          pageIndex: pageIdx,
          onRectsChange: ({ rects: newRects, boundingRect: newBoundingRect }) => {
            rects.value = newRects;
            boundingRect.value = newBoundingRect;
          }
        });
        onCleanup(unregister);
      },
      { immediate: true }
    );
    watch(
      [() => selPlugin.value, () => props.documentId],
      ([plugin, docId], _, onCleanup) => {
        if (!plugin || !docId) {
          placement.value = null;
          return;
        }
        const unsubscribe = plugin.onMenuPlacement(docId, (newPlacement) => {
          placement.value = newPlacement;
        });
        onCleanup(unsubscribe);
      },
      { immediate: true }
    );
    const buildContext = () => ({
      type: "selection",
      pageIndex: props.pageIndex
    });
    const buildMenuPlacement = () => {
      var _a, _b, _c;
      return {
        suggestTop: ((_a = placement.value) == null ? void 0 : _a.suggestTop) ?? false,
        spaceAbove: ((_b = placement.value) == null ? void 0 : _b.spaceAbove) ?? 0,
        spaceBelow: ((_c = placement.value) == null ? void 0 : _c.spaceBelow) ?? 0
      };
    };
    const renderSelectionMenu = (rect, menuWrapperProps) => {
      if (!props.selectionMenu) return null;
      return props.selectionMenu({
        rect,
        menuWrapperProps,
        selected: true,
        // Selection is always "selected" when visible
        placement: buildMenuPlacement(),
        context: buildContext()
      });
    };
    return (_ctx, _cache) => {
      return boundingRect.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        createElementVNode("div", {
          style: normalizeStyle({
            position: "absolute",
            left: `${boundingRect.value.origin.x * actualScale.value}px`,
            top: `${boundingRect.value.origin.y * actualScale.value}px`,
            width: `${boundingRect.value.size.width * actualScale.value}px`,
            height: `${boundingRect.value.size.height * actualScale.value}px`,
            mixBlendMode: "multiply",
            isolation: "isolate",
            pointerEvents: "none"
          })
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(rects.value, (rect, i) => {
            return openBlock(), createElementBlock("div", {
              key: i,
              style: normalizeStyle({
                position: "absolute",
                left: `${(rect.origin.x - boundingRect.value.origin.x) * actualScale.value}px`,
                top: `${(rect.origin.y - boundingRect.value.origin.y) * actualScale.value}px`,
                width: `${rect.size.width * actualScale.value}px`,
                height: `${rect.size.height * actualScale.value}px`,
                background: __props.background
              })
            }, null, 4);
          }), 128))
        ], 4),
        shouldRenderMenu.value ? (openBlock(), createBlock(unref(CounterRotate), {
          key: 0,
          rect: {
            origin: {
              x: placement.value.rect.origin.x * actualScale.value,
              y: placement.value.rect.origin.y * actualScale.value
            },
            size: {
              width: placement.value.rect.size.width * actualScale.value,
              height: placement.value.rect.size.height * actualScale.value
            }
          },
          rotation: actualRotation.value
        }, {
          default: withCtx(({ rect, menuWrapperProps }) => [
            __props.selectionMenu ? (openBlock(), createBlock(resolveDynamicComponent(renderSelectionMenu(rect, menuWrapperProps)), { key: 0 })) : renderSlot(_ctx.$slots, "selection-menu", {
              key: 1,
              context: buildContext(),
              selected: true,
              rect,
              placement: buildMenuPlacement(),
              menuWrapperProps
            })
          ]),
          _: 3
        }, 8, ["rect", "rotation"])) : createCommentVNode("", true)
      ], 64)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "marquee-selection",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    className: {},
    background: {},
    borderColor: {},
    borderStyle: { default: "dashed" },
    stroke: {},
    fill: {}
  },
  setup(__props) {
    const props = __props;
    const resolvedBorderColor = computed(
      () => props.borderColor ?? props.stroke ?? "rgba(0,122,204,0.8)"
    );
    const resolvedBackground = computed(() => props.background ?? props.fill ?? "rgba(0,122,204,0.15)");
    const resolvedBorderStyle = computed(() => props.borderStyle);
    const { plugin: selPlugin } = useSelectionPlugin();
    const documentState = useDocumentState(() => props.documentId);
    const rect = ref(null);
    const actualScale = computed(() => {
      var _a;
      if (props.scale !== void 0) return props.scale;
      return ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    watch(
      [selPlugin, () => props.documentId, () => props.pageIndex, actualScale],
      ([plugin, docId, pageIdx, scale], _, onCleanup) => {
        rect.value = null;
        if (!plugin) {
          return;
        }
        const unregister = plugin.registerMarqueeOnPage({
          documentId: docId,
          pageIndex: pageIdx,
          scale,
          onRectChange: (newRect) => {
            rect.value = newRect;
          }
        });
        onCleanup(() => {
          unregister == null ? void 0 : unregister();
        });
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
          border: `1px ${resolvedBorderStyle.value} ${resolvedBorderColor.value}`,
          background: resolvedBackground.value,
          boxSizing: "border-box",
          zIndex: 1e3
        }),
        class: normalizeClass(__props.className)
      }, null, 6)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "selection-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: { default: Rotation.Degree0 },
    background: {},
    textStyle: {},
    marqueeStyle: {},
    marqueeClassName: {},
    selectionMenu: {}
  },
  setup(__props) {
    const props = __props;
    const resolvedTextBackground = computed(() => {
      var _a;
      return ((_a = props.textStyle) == null ? void 0 : _a.background) ?? props.background;
    });
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(_sfc_main$3, {
          "document-id": __props.documentId,
          "page-index": __props.pageIndex,
          scale: __props.scale,
          rotation: __props.rotation,
          background: resolvedTextBackground.value,
          "selection-menu": __props.selectionMenu
        }, {
          "selection-menu": withCtx((menuProps) => [
            renderSlot(_ctx.$slots, "selection-menu", normalizeProps(guardReactiveProps(menuProps)))
          ]),
          _: 3
        }, 8, ["document-id", "page-index", "scale", "rotation", "background", "selection-menu"]),
        createVNode(_sfc_main$2, {
          "document-id": __props.documentId,
          "page-index": __props.pageIndex,
          scale: __props.scale,
          background: (_a = __props.marqueeStyle) == null ? void 0 : _a.background,
          "border-color": (_b = __props.marqueeStyle) == null ? void 0 : _b.borderColor,
          "border-style": (_c = __props.marqueeStyle) == null ? void 0 : _c.borderStyle,
          "class-name": __props.marqueeClassName
        }, null, 8, ["document-id", "page-index", "scale", "background", "border-color", "border-style", "class-name"])
      ], 64);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "copy-to-clipboard",
  setup(__props) {
    const { provides: sel } = useSelectionCapability();
    watchEffect((onCleanup) => {
      if (sel.value) {
        const unsubscribe = sel.value.onCopyToClipboard(({ text }) => {
          navigator.clipboard.writeText(text).catch((err) => {
            console.error("Failed to copy text to clipboard:", err);
          });
        });
        onCleanup(unsubscribe);
      }
    });
    return (_ctx, _cache) => {
      return null;
    };
  }
});
const SelectionPluginPackage = createPluginPackage(SelectionPluginPackage$1).addUtility(_sfc_main).build();
export {
  _sfc_main as CopyToClipboard,
  _sfc_main$2 as MarqueeSelection,
  _sfc_main$1 as SelectionLayer,
  SelectionPluginPackage,
  _sfc_main$3 as TextSelection,
  useSelectionCapability,
  useSelectionPlugin
};
//# sourceMappingURL=index.js.map
