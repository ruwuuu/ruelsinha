import { createPluginPackage } from "@embedpdf/core";
import { AnnotationPlugin, initialDocumentState, inferRotationCenterFromRects, generateCloudyRectanglePath, generateCloudyEllipsePath, patching, generateCloudyPolygonPath, LockModeType, hasNoViewFlag, hasHiddenFlag, resolveInteractionProp, getAnnotationsByPageIndex, getSelectedAnnotationIds, AnnotationPluginPackage as AnnotationPluginPackage$1 } from "@embedpdf/plugin-annotation";
export * from "@embedpdf/plugin-annotation";
import { defineComponent, ref, watchEffect, openBlock, createElementBlock, normalizeStyle, createCommentVNode, toValue, watch, computed, shallowRef, toRaw, useSlots, createElementVNode, renderSlot, createBlock, Fragment, unref, normalizeProps, mergeProps, renderList, withCtx, resolveDynamicComponent, Teleport, toDisplayString, markRaw, provide, inject, onUnmounted, nextTick, createVNode, createSlots, guardReactiveProps, onMounted } from "vue";
import { getCounterRotation } from "@embedpdf/utils";
import { useInteractionHandles, useDoublePressProps, CounterRotate, deepToRaw } from "@embedpdf/utils/vue";
import { usePlugin, useCapability, useDocumentPermissions, useDocumentState } from "@embedpdf/core/vue";
import { boundingRectOrEmpty, PdfAnnotationBorderStyle, PdfVerticalAlignment, textAlignmentToCss, standardFontCssProperties, ignore, PdfErrorCode, getContrastStrokeColor, PdfBlendMode, blendModeToCss, PdfAnnotationSubtype } from "@embedpdf/models";
import { usePointerHandlers } from "@embedpdf/plugin-interaction-manager/vue";
import { useSelectionCapability } from "@embedpdf/plugin-selection/vue";
const _hoisted_1$h = ["src"];
const _sfc_main$R = /* @__PURE__ */ defineComponent({
  __name: "appearance-image",
  props: {
    appearance: {},
    style: {}
  },
  setup(__props) {
    const props = __props;
    const imageUrl = ref(null);
    const urlRef = ref(null);
    watchEffect((onCleanup) => {
      const url = URL.createObjectURL(props.appearance.data);
      imageUrl.value = url;
      urlRef.value = url;
      onCleanup(() => {
        if (urlRef.value) {
          URL.revokeObjectURL(urlRef.value);
          urlRef.value = null;
        }
      });
    });
    const handleImageLoad = () => {
      if (urlRef.value) {
        URL.revokeObjectURL(urlRef.value);
        urlRef.value = null;
      }
    };
    return (_ctx, _cache) => {
      return imageUrl.value ? (openBlock(), createElementBlock("img", {
        key: 0,
        src: imageUrl.value,
        alt: "",
        draggable: "false",
        onLoad: handleImageLoad,
        style: normalizeStyle({
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          ...__props.style
        })
      }, null, 44, _hoisted_1$h)) : createCommentVNode("", true);
    };
  }
});
const useAnnotationPlugin = () => usePlugin(AnnotationPlugin.id);
const useAnnotationCapability = () => useCapability(AnnotationPlugin.id);
const useAnnotation = (documentId) => {
  var _a, _b;
  const { provides } = useAnnotationCapability();
  const state = ref(
    ((_b = (_a = provides == null ? void 0 : provides.value) == null ? void 0 : _a.forDocument(toValue(documentId))) == null ? void 0 : _b.getState()) ?? initialDocumentState()
  );
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
      }
    },
    { immediate: true }
  );
  return {
    state,
    provides: computed(() => {
      var _a2;
      return ((_a2 = provides.value) == null ? void 0 : _a2.forDocument(toValue(documentId))) ?? null;
    })
  };
};
const MIN_IOS_FOCUS_FONT_PX = 16;
function detectIOS() {
  try {
    const nav = navigator;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && (nav == null ? void 0 : nav.maxTouchPoints) > 1;
  } catch {
    return false;
  }
}
let _isIOS;
function getIsIOS() {
  if (_isIOS === void 0) {
    _isIOS = detectIOS();
  }
  return _isIOS;
}
function useIOSZoomPrevention(computedFontPx, active) {
  const isIOS = getIsIOS();
  return computed(() => {
    const px = toValue(computedFontPx);
    const isActive = toValue(active);
    const needsComp = isIOS && isActive && px > 0 && px < MIN_IOS_FOCUS_FONT_PX;
    const adjustedFontPx = needsComp ? MIN_IOS_FOCUS_FONT_PX : px;
    const scaleComp = needsComp ? px / MIN_IOS_FOCUS_FONT_PX : 1;
    const wrapperStyle = needsComp ? {
      width: `${100 / scaleComp}%`,
      height: `${100 / scaleComp}%`,
      transform: `scale(${scaleComp})`,
      transformOrigin: "top left"
    } : void 0;
    return { needsComp, adjustedFontPx, scaleComp, wrapperStyle };
  });
}
const _hoisted_1$g = ["width", "height", "stroke"];
const _hoisted_2$c = ["width", "height", "stroke"];
const __default__$g = {
  inheritAttrs: false
};
const _sfc_main$Q = /* @__PURE__ */ defineComponent({
  ...__default__$g,
  __name: "annotation-container",
  props: {
    scale: {},
    documentId: {},
    pageIndex: {},
    rotation: {},
    pageWidth: {},
    pageHeight: {},
    trackedAnnotation: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean, default: false },
    isMultiSelected: { type: Boolean, default: false },
    isDraggable: { type: Boolean },
    isResizable: { type: Boolean },
    isRotatable: { type: Boolean, default: true },
    lockAspectRatio: { type: Boolean, default: false },
    vertexConfig: {},
    selectionMenu: {},
    structurallyLocked: { type: Boolean, default: false },
    contentLocked: { type: Boolean, default: false },
    outlineOffset: { default: 1 },
    onDoubleClick: {},
    onSelect: {},
    appearance: {},
    zIndex: { default: 1 },
    selectionOutlineColor: { default: "#007ACC" },
    selectionOutline: {},
    resizeUi: {},
    vertexUi: {},
    rotationUi: {},
    blendMode: {},
    style: {}
  },
  setup(__props) {
    const props = __props;
    const HANDLE_COLOR = computed(() => {
      var _a;
      return ((_a = props.resizeUi) == null ? void 0 : _a.color) ?? "#007ACC";
    });
    const VERTEX_COLOR = computed(() => {
      var _a;
      return ((_a = props.vertexUi) == null ? void 0 : _a.color) ?? "#007ACC";
    });
    const HANDLE_SIZE = computed(() => {
      var _a;
      return ((_a = props.resizeUi) == null ? void 0 : _a.size) ?? 12;
    });
    const VERTEX_SIZE = computed(() => {
      var _a;
      return ((_a = props.vertexUi) == null ? void 0 : _a.size) ?? 12;
    });
    const ROTATION_SIZE = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.size) ?? 32;
    });
    const ROTATION_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.color) ?? "white";
    });
    const ROTATION_CONNECTOR_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.connectorColor) ?? "#007ACC";
    });
    const ROTATION_ICON_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.iconColor) ?? "#007ACC";
    });
    const SHOW_CONNECTOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.showConnector) ?? false;
    });
    const ROTATION_MARGIN = computed(() => {
      var _a;
      return (_a = props.rotationUi) == null ? void 0 : _a.margin;
    });
    const ROTATION_BORDER_COLOR = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.color) ?? "#007ACC";
    });
    const ROTATION_BORDER_WIDTH = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.width) ?? 1;
    });
    const ROTATION_BORDER_STYLE = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.style) ?? "solid";
    });
    const outlineColor = computed(
      () => {
        var _a;
        return ((_a = props.selectionOutline) == null ? void 0 : _a.color) ?? props.selectionOutlineColor ?? "#007ACC";
      }
    );
    const outlineStyle = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.style) ?? "solid";
    });
    const outlineWidth = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.width) ?? 1;
    });
    const outlineOff = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.offset) ?? props.outlineOffset ?? 1;
    });
    const preview = shallowRef(toRaw(props.trackedAnnotation.object));
    const liveRotation = ref(null);
    const cursorScreen = ref(null);
    const isHandleHovered = ref(false);
    const gestureActive = ref(false);
    const { provides: annotationCapability } = useAnnotationCapability();
    const { plugin: annotationPlugin } = useAnnotationPlugin();
    const permissions = useDocumentPermissions(props.documentId);
    const gestureBaseRef = ref(null);
    const gestureBaseRectRef = shallowRef(null);
    const effectiveIsDraggable = computed(
      () => permissions.value.canModifyAnnotations && props.isDraggable && !props.isMultiSelected
    );
    const effectiveIsResizable = computed(
      () => permissions.value.canModifyAnnotations && props.isResizable && !props.isMultiSelected
    );
    const effectiveIsRotatable = computed(
      () => permissions.value.canModifyAnnotations && props.isRotatable && !props.isMultiSelected
    );
    const guardedOnDoubleClick = props.onDoubleClick ? (e) => {
      var _a;
      if (permissions.value.canModifyAnnotations) {
        (_a = props.onDoubleClick) == null ? void 0 : _a.call(props, e);
      }
    } : void 0;
    const annotationProvides = computed(
      () => annotationCapability.value ? annotationCapability.value.forDocument(props.documentId) : null
    );
    const currentObject = computed(
      () => ({ ...toRaw(props.trackedAnnotation.object), ...toRaw(preview.value) })
    );
    const hasNoZoom = computed(() => (props.trackedAnnotation.object.flags ?? []).includes("noZoom"));
    const hasNoRotate = computed(
      () => (props.trackedAnnotation.object.flags ?? []).includes("noRotate")
    );
    const visualScale = computed(() => hasNoZoom.value ? 1 : props.scale);
    const effectivePageRotation = computed(() => hasNoRotate.value ? 0 : props.rotation);
    const annotationRotation = computed(
      () => liveRotation.value ?? currentObject.value.rotation ?? 0
    );
    const rotationDisplay = computed(
      () => liveRotation.value ?? currentObject.value.rotation ?? 0
    );
    const normalizedRotationDisplay = computed(() => {
      const val = rotationDisplay.value;
      return Number.isFinite(val) ? Math.round(val * 10) / 10 : 0;
    });
    const rotationActive = computed(() => liveRotation.value !== null);
    const explicitUnrotatedRect = computed(
      () => currentObject.value.unrotatedRect
    );
    const effectiveUnrotatedRect = computed(
      () => explicitUnrotatedRect.value ?? currentObject.value.rect
    );
    const rotationPivot = computed(() => {
      if (explicitUnrotatedRect.value && annotationRotation.value !== 0) {
        return inferRotationCenterFromRects(
          effectiveUnrotatedRect.value,
          currentObject.value.rect,
          annotationRotation.value
        );
      }
      return void 0;
    });
    const controllerElement = computed(() => effectiveUnrotatedRect.value);
    const childObject = computed(() => {
      if (explicitUnrotatedRect.value) {
        return { ...currentObject.value, rect: explicitUnrotatedRect.value };
      }
      return currentObject.value;
    });
    const showOutline = computed(() => props.isSelected && !props.isMultiSelected);
    const shouldShowMenu = computed(() => {
      return props.isSelected && !props.isMultiSelected && (props.selectionMenu || slots["selection-menu"]);
    });
    const menuRect = computed(() => ({
      origin: {
        x: currentObject.value.rect.origin.x * props.scale,
        y: currentObject.value.rect.origin.y * props.scale
      },
      size: {
        width: currentObject.value.rect.size.width * visualScale.value,
        height: currentObject.value.rect.size.height * visualScale.value
      }
    }));
    const menuContext = computed(() => ({
      type: "annotation",
      annotation: props.trackedAnnotation,
      pageIndex: props.pageIndex,
      structurallyLocked: props.structurallyLocked,
      contentLocked: props.contentLocked
    }));
    const menuPlacement = computed(() => {
      const effectiveAngle = ((annotationRotation.value + effectivePageRotation.value * 90) % 360 + 360) % 360;
      const handleNearMenuSide = effectiveIsRotatable.value && effectiveAngle > 90 && effectiveAngle < 270;
      return {
        suggestTop: handleNearMenuSide
      };
    });
    const renderSelectionMenu = (rect, menuWrapperProps) => {
      if (!props.selectionMenu) return null;
      return props.selectionMenu({
        rect,
        menuWrapperProps,
        selected: props.isSelected,
        placement: menuPlacement.value,
        context: menuContext.value
      });
    };
    const verticesSnapshot = computed(() => {
      var _a;
      const obj = toRaw(currentObject.value);
      return ((_a = props.vertexConfig) == null ? void 0 : _a.extractVertices(obj)) ?? [];
    });
    const constraintsSnapshot = computed(() => ({
      minWidth: 10,
      minHeight: 10,
      boundingBox: {
        width: props.pageWidth,
        height: props.pageHeight
      }
    }));
    const {
      dragProps,
      vertices,
      resize,
      rotation: rotationHandleData
    } = useInteractionHandles({
      controller: {
        element: controllerElement,
        vertices: verticesSnapshot,
        constraints: constraintsSnapshot,
        maintainAspectRatio: computed(() => props.lockAspectRatio),
        pageRotation: computed(() => props.rotation),
        annotationRotation: computed(() => annotationRotation.value),
        rotationCenter: computed(() => rotationPivot.value),
        rotationElement: computed(() => currentObject.value.rect),
        scale: computed(() => props.scale),
        // Disable interaction handles when multi-selected
        enabled: computed(() => props.isSelected && !props.isMultiSelected),
        onUpdate: (event) => {
          var _a, _b, _c;
          if (!((_a = event.transformData) == null ? void 0 : _a.type) || props.isMultiSelected) return;
          const plugin = annotationPlugin.value;
          if (!plugin) return;
          const { type, changes, metadata } = event.transformData;
          const id = props.trackedAnnotation.object.id;
          const pageSize = { width: props.pageWidth, height: props.pageHeight };
          if (event.state === "start") {
            gestureBaseRectRef.value = props.trackedAnnotation.object.unrotatedRect ?? props.trackedAnnotation.object.rect;
            gestureBaseRef.value = currentObject.value;
            if (type === "resize" || type === "vertex-edit") {
              gestureActive.value = true;
            }
            if (type === "move") {
              plugin.startDrag(props.documentId, { annotationIds: [id], pageSize });
            } else if (type === "resize") {
              plugin.startResize(props.documentId, {
                annotationIds: [id],
                pageSize,
                resizeHandle: (metadata == null ? void 0 : metadata.handle) ?? "se"
              });
            }
          }
          if (changes.rect && gestureBaseRectRef.value) {
            if (type === "move") {
              const delta = {
                x: changes.rect.origin.x - gestureBaseRectRef.value.origin.x,
                y: changes.rect.origin.y - gestureBaseRectRef.value.origin.y
              };
              plugin.updateDrag(props.documentId, delta);
            } else if (type === "resize") {
              plugin.updateResize(props.documentId, changes.rect);
            }
          }
          if (type === "vertex-edit" && changes.vertices && props.vertexConfig) {
            const base = gestureBaseRef.value ?? currentObject.value;
            const vertexChanges = props.vertexConfig.transformAnnotation(toRaw(base), changes.vertices);
            const patched = (_b = annotationCapability.value) == null ? void 0 : _b.transformAnnotation(base, {
              type,
              changes: vertexChanges,
              metadata
            });
            if (patched) {
              preview.value = { ...toRaw(preview.value), ...patched };
              if (event.state === "end") {
                (_c = annotationProvides.value) == null ? void 0 : _c.updateAnnotation(props.pageIndex, id, patched);
              }
            }
          }
          if (type === "rotate") {
            const cursorAngle = (metadata == null ? void 0 : metadata.rotationAngle) ?? annotationRotation.value;
            const cursorPos = metadata == null ? void 0 : metadata.cursorPosition;
            if (cursorPos) cursorScreen.value = { x: cursorPos.clientX, y: cursorPos.clientY };
            if (event.state === "start") {
              liveRotation.value = cursorAngle;
              plugin.startRotation(props.documentId, {
                annotationIds: [id],
                cursorAngle,
                rotationCenter: metadata == null ? void 0 : metadata.rotationCenter
              });
            } else if (event.state === "move") {
              liveRotation.value = cursorAngle;
              plugin.updateRotation(props.documentId, cursorAngle, metadata == null ? void 0 : metadata.rotationDelta);
            } else if (event.state === "end") {
              liveRotation.value = null;
              cursorScreen.value = null;
              plugin.commitRotation(props.documentId);
            }
            return;
          }
          if (event.state === "end") {
            gestureActive.value = false;
            gestureBaseRectRef.value = null;
            gestureBaseRef.value = null;
            if (type === "move") plugin.commitDrag(props.documentId);
            else if (type === "resize") plugin.commitResize(props.documentId);
          }
        }
      },
      resizeUI: {
        handleSize: HANDLE_SIZE.value,
        spacing: outlineOff.value,
        offsetMode: "outside",
        includeSides: props.lockAspectRatio ? false : true,
        zIndex: props.zIndex + 1
      },
      vertexUI: {
        vertexSize: VERTEX_SIZE.value,
        zIndex: props.zIndex + 2
      },
      rotationUI: {
        handleSize: ROTATION_SIZE.value,
        margin: ROTATION_MARGIN.value,
        zIndex: props.zIndex + 3,
        showConnector: SHOW_CONNECTOR.value
      },
      includeVertices: !!props.vertexConfig,
      includeRotation: effectiveIsRotatable,
      currentRotation: annotationRotation
    });
    const doubleProps = useDoublePressProps(guardedOnDoubleClick);
    const onHandlePointerMove = (e) => {
      if (!rotationActive.value) {
        cursorScreen.value = { x: e.clientX, y: e.clientY };
      }
    };
    watchEffect(() => {
      if (props.trackedAnnotation.object) {
        preview.value = props.trackedAnnotation.object;
      }
    });
    watchEffect((onCleanup) => {
      const plugin = annotationPlugin.value;
      if (!plugin) return;
      const id = props.trackedAnnotation.object.id;
      const handleEvent = (event) => {
        var _a;
        if (event.documentId !== props.documentId) return;
        if (event.type === "end" || event.type === "cancel") {
          liveRotation.value = null;
        }
        const patch = (_a = event.previewPatches) == null ? void 0 : _a[id];
        if (event.type === "update" && patch) {
          preview.value = { ...toRaw(preview.value), ...patch };
        } else if (event.type === "cancel") {
          preview.value = props.trackedAnnotation.object;
        }
      };
      const unsubs = [
        plugin.onDragChange(handleEvent),
        plugin.onResizeChange(handleEvent),
        plugin.onRotateChange(handleEvent)
      ];
      onCleanup(() => unsubs.forEach((u) => u()));
    });
    const aabbWidth = computed(() => currentObject.value.rect.size.width * visualScale.value);
    const aabbHeight = computed(() => currentObject.value.rect.size.height * visualScale.value);
    const innerWidth = computed(() => effectiveUnrotatedRect.value.size.width * visualScale.value);
    const innerHeight = computed(() => effectiveUnrotatedRect.value.size.height * visualScale.value);
    const usesCustomPivot = computed(
      () => Boolean(explicitUnrotatedRect.value) && annotationRotation.value !== 0
    );
    const innerLeft = computed(
      () => usesCustomPivot.value ? (effectiveUnrotatedRect.value.origin.x - currentObject.value.rect.origin.x) * visualScale.value : (aabbWidth.value - innerWidth.value) / 2
    );
    const innerTop = computed(
      () => usesCustomPivot.value ? (effectiveUnrotatedRect.value.origin.y - currentObject.value.rect.origin.y) * visualScale.value : (aabbHeight.value - innerHeight.value) / 2
    );
    const innerTransformOrigin = computed(() => {
      if (usesCustomPivot.value && rotationPivot.value) {
        return `${(rotationPivot.value.x - effectiveUnrotatedRect.value.origin.x) * visualScale.value}px ${(rotationPivot.value.y - effectiveUnrotatedRect.value.origin.y) * visualScale.value}px`;
      }
      return "center center";
    });
    const centerX = computed(
      () => rotationPivot.value ? (rotationPivot.value.x - currentObject.value.rect.origin.x) * visualScale.value : aabbWidth.value / 2
    );
    const centerY = computed(
      () => rotationPivot.value ? (rotationPivot.value.y - currentObject.value.rect.origin.y) * visualScale.value : aabbHeight.value / 2
    );
    const guideLength = computed(() => Math.max(300, Math.max(aabbWidth.value, aabbHeight.value) + 80));
    const counterRot = computed(
      () => hasNoRotate.value ? getCounterRotation(
        { origin: { x: 0, y: 0 }, size: { width: aabbWidth.value, height: aabbHeight.value } },
        props.rotation
      ) : null
    );
    const rotationIconSize = computed(() => Math.round(ROTATION_SIZE.value * 0.6));
    const apActive = computed(
      () => {
        var _a;
        return !!((_a = props.appearance) == null ? void 0 : _a.normal) && !gestureActive.value && !props.isEditing && !props.trackedAnnotation.dictMode;
      }
    );
    const contentsStyle = { display: "contents" };
    const layerBaseStyle = computed(() => ({
      position: "absolute",
      left: `${currentObject.value.rect.origin.x * props.scale}px`,
      top: `${currentObject.value.rect.origin.y * props.scale}px`,
      width: `${counterRot.value ? counterRot.value.width : aabbWidth.value}px`,
      height: `${counterRot.value ? counterRot.value.height : aabbHeight.value}px`,
      pointerEvents: "none",
      zIndex: props.zIndex,
      ...counterRot.value ? { transform: counterRot.value.matrix, transformOrigin: "0 0" } : {}
    }));
    const visualLayerStyle = computed(() => ({
      ...layerBaseStyle.value,
      ...props.blendMode ? { mixBlendMode: props.blendMode } : {},
      ...props.style
    }));
    const outerAABBStyle = computed(() => layerBaseStyle.value);
    const visualInnerStyle = computed(() => ({
      position: "absolute",
      left: `${innerLeft.value}px`,
      top: `${innerTop.value}px`,
      width: `${innerWidth.value}px`,
      height: `${innerHeight.value}px`,
      transform: annotationRotation.value !== 0 ? `rotate(${annotationRotation.value}deg)` : void 0,
      transformOrigin: innerTransformOrigin.value,
      pointerEvents: props.isEditing ? "auto" : "none"
    }));
    const innerRotatedStyle = computed(() => ({
      position: "absolute",
      left: `${innerLeft.value}px`,
      top: `${innerTop.value}px`,
      width: `${innerWidth.value}px`,
      height: `${innerHeight.value}px`,
      transform: annotationRotation.value !== 0 ? `rotate(${annotationRotation.value}deg)` : void 0,
      transformOrigin: innerTransformOrigin.value,
      outline: showOutline.value ? `${outlineWidth.value}px ${outlineStyle.value} ${outlineColor.value}` : "none",
      outlineOffset: showOutline.value ? `${outlineOff.value}px` : "0px",
      pointerEvents: props.isSelected && !props.isMultiSelected && !props.isEditing ? "auto" : "none",
      touchAction: "none",
      cursor: props.isSelected && effectiveIsDraggable.value ? "move" : "default"
    }));
    const guideHorizontalStyle = computed(() => ({
      position: "absolute",
      left: `${centerX.value - guideLength.value / 2}px`,
      top: `${centerY.value}px`,
      width: `${guideLength.value}px`,
      height: "1px",
      backgroundColor: ROTATION_CONNECTOR_COLOR.value,
      opacity: 0.35,
      pointerEvents: "none"
    }));
    const guideVerticalStyle = computed(() => ({
      position: "absolute",
      left: `${centerX.value}px`,
      top: `${centerY.value - guideLength.value / 2}px`,
      width: "1px",
      height: `${guideLength.value}px`,
      backgroundColor: ROTATION_CONNECTOR_COLOR.value,
      opacity: 0.35,
      pointerEvents: "none"
    }));
    const guideAngleStyle = computed(() => ({
      position: "absolute",
      left: `${centerX.value - guideLength.value / 2}px`,
      top: `${centerY.value}px`,
      width: `${guideLength.value}px`,
      height: "1px",
      transformOrigin: "center center",
      transform: `rotate(${annotationRotation.value}deg)`,
      backgroundColor: ROTATION_CONNECTOR_COLOR.value,
      opacity: 0.8,
      pointerEvents: "none"
    }));
    const connectorLineStyle = computed(() => {
      var _a;
      return {
        ...((_a = rotationHandleData.value) == null ? void 0 : _a.connector.style) ?? {},
        backgroundColor: ROTATION_CONNECTOR_COLOR.value,
        opacity: rotationActive.value ? 0 : 1
      };
    });
    const rotationHandleStyle = computed(() => {
      var _a;
      return {
        ...((_a = rotationHandleData.value) == null ? void 0 : _a.handle.style) ?? {},
        backgroundColor: ROTATION_COLOR.value,
        border: `${ROTATION_BORDER_WIDTH.value}px ${ROTATION_BORDER_STYLE.value} ${ROTATION_BORDER_COLOR.value}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        opacity: rotationActive.value ? 0 : 1
      };
    });
    const rotationHandleBindings = computed(() => {
      if (!rotationHandleData.value) return {};
      const { style: _s, ...rest } = rotationHandleData.value.handle;
      return rest;
    });
    const rotationHandleSlotProps = computed(() => {
      if (!rotationHandleData.value) return {};
      return {
        ...rotationHandleData.value.handle,
        backgroundColor: ROTATION_COLOR.value,
        iconColor: ROTATION_ICON_COLOR.value,
        connectorStyle: connectorLineStyle.value,
        showConnector: SHOW_CONNECTOR.value,
        opacity: rotationActive.value ? 0 : 1,
        border: {
          color: ROTATION_BORDER_COLOR.value,
          width: ROTATION_BORDER_WIDTH.value,
          style: ROTATION_BORDER_STYLE.value
        }
      };
    });
    const tooltipStyle = computed(() => ({
      position: "fixed",
      left: cursorScreen.value ? `${cursorScreen.value.x + 16}px` : "0",
      top: cursorScreen.value ? `${cursorScreen.value.y - 16}px` : "0",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontFamily: "monospace",
      pointerEvents: "none",
      zIndex: 1e4,
      whiteSpace: "nowrap"
    }));
    const slots = useSlots();
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("div", {
        "data-no-interaction": "",
        style: contentsStyle
      }, [
        createElementVNode("div", {
          style: normalizeStyle(visualLayerStyle.value)
        }, [
          createElementVNode("div", {
            style: normalizeStyle(visualInnerStyle.value)
          }, [
            renderSlot(_ctx.$slots, "default", {
              annotation: childObject.value,
              appearanceActive: apActive.value
            }),
            ((_a = __props.appearance) == null ? void 0 : _a.normal) ? (openBlock(), createBlock(_sfc_main$R, {
              key: 0,
              appearance: __props.appearance.normal,
              style: normalizeStyle({ display: apActive.value ? "block" : "none" })
            }, null, 8, ["appearance", "style"])) : createCommentVNode("", true)
          ], 4)
        ], 4),
        createElementVNode("div", {
          style: normalizeStyle(outerAABBStyle.value)
        }, [
          rotationActive.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createElementVNode("div", {
              style: normalizeStyle(guideHorizontalStyle.value)
            }, null, 4),
            createElementVNode("div", {
              style: normalizeStyle(guideVerticalStyle.value)
            }, null, 4),
            createElementVNode("div", {
              style: normalizeStyle(guideAngleStyle.value)
            }, null, 4)
          ], 64)) : createCommentVNode("", true),
          __props.isSelected && effectiveIsRotatable.value && unref(rotationHandleData) ? (openBlock(), createElementBlock("div", {
            key: 1,
            onPointerenter: _cache[0] || (_cache[0] = ($event) => isHandleHovered.value = true),
            onPointerleave: _cache[1] || (_cache[1] = ($event) => {
              isHandleHovered.value = false;
              cursorScreen.value = null;
            }),
            onPointermove: onHandlePointerMove,
            style: contentsStyle
          }, [
            SHOW_CONNECTOR.value ? (openBlock(), createElementBlock("div", {
              key: 0,
              style: normalizeStyle(connectorLineStyle.value)
            }, null, 4)) : createCommentVNode("", true),
            unref(slots)["rotation-handle"] ? renderSlot(_ctx.$slots, "rotation-handle", normalizeProps(mergeProps({ key: 1 }, rotationHandleSlotProps.value)), () => [
              createElementVNode("div", mergeProps(rotationHandleBindings.value, { style: rotationHandleStyle.value }), [
                (openBlock(), createElementBlock("svg", {
                  width: rotationIconSize.value,
                  height: rotationIconSize.value,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: ROTATION_ICON_COLOR.value,
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [..._cache[2] || (_cache[2] = [
                  createElementVNode("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }, null, -1),
                  createElementVNode("path", { d: "M21 3v5h-5" }, null, -1)
                ])], 8, _hoisted_1$g))
              ], 16)
            ]) : (openBlock(), createElementBlock("div", mergeProps({ key: 2 }, rotationHandleBindings.value, { style: rotationHandleStyle.value }), [
              (openBlock(), createElementBlock("svg", {
                width: rotationIconSize.value,
                height: rotationIconSize.value,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: ROTATION_ICON_COLOR.value,
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, [..._cache[3] || (_cache[3] = [
                createElementVNode("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }, null, -1),
                createElementVNode("path", { d: "M21 3v5h-5" }, null, -1)
              ])], 8, _hoisted_2$c))
            ], 16))
          ], 32)) : createCommentVNode("", true),
          createElementVNode("div", mergeProps({ ...effectiveIsDraggable.value && __props.isSelected ? unref(dragProps) : {}, ...unref(doubleProps) }, { style: innerRotatedStyle.value }), [
            __props.isSelected && effectiveIsResizable.value && !rotationActive.value ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(unref(resize), ({ key, style, ...handle }) => {
              return openBlock(), createElementBlock(Fragment, { key }, [
                unref(slots)["resize-handle"] ? renderSlot(_ctx.$slots, "resize-handle", mergeProps({
                  key: 0,
                  ref_for: true
                }, { key, style, ...handle, backgroundColor: HANDLE_COLOR.value }), () => [
                  createElementVNode("div", mergeProps({ ref_for: true }, handle, {
                    style: [style, { backgroundColor: HANDLE_COLOR.value }]
                  }), null, 16)
                ]) : (openBlock(), createElementBlock("div", mergeProps({
                  key: 1,
                  ref_for: true
                }, handle, {
                  style: [style, { backgroundColor: HANDLE_COLOR.value }]
                }), null, 16))
              ], 64);
            }), 128)) : createCommentVNode("", true),
            __props.isSelected && unref(permissions).canModifyAnnotations && !__props.isMultiSelected && !rotationActive.value && unref(vertices).length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(unref(vertices), ({ key, style, ...vertex }) => {
              return openBlock(), createElementBlock(Fragment, { key }, [
                unref(slots)["vertex-handle"] ? renderSlot(_ctx.$slots, "vertex-handle", mergeProps({
                  key: 0,
                  ref_for: true
                }, { key, style, ...vertex, backgroundColor: VERTEX_COLOR.value }), () => [
                  createElementVNode("div", mergeProps({ ref_for: true }, vertex, {
                    style: [style, { backgroundColor: VERTEX_COLOR.value }]
                  }), null, 16)
                ]) : (openBlock(), createElementBlock("div", mergeProps({
                  key: 1,
                  ref_for: true
                }, vertex, {
                  style: [style, { backgroundColor: VERTEX_COLOR.value }]
                }), null, 16))
              ], 64);
            }), 128)) : createCommentVNode("", true)
          ], 16)
        ], 4),
        shouldShowMenu.value && !rotationActive.value ? (openBlock(), createBlock(unref(CounterRotate), {
          key: 0,
          rect: menuRect.value,
          rotation: __props.rotation
        }, {
          default: withCtx(({ rect, menuWrapperProps }) => [
            __props.selectionMenu ? (openBlock(), createBlock(resolveDynamicComponent(renderSelectionMenu(rect, menuWrapperProps)), { key: 0 })) : renderSlot(_ctx.$slots, "selection-menu", {
              key: 1,
              context: menuContext.value,
              selected: __props.isSelected,
              rect,
              placement: menuPlacement.value,
              menuWrapperProps
            })
          ]),
          _: 3
        }, 8, ["rect", "rotation"])) : createCommentVNode("", true),
        (rotationActive.value || isHandleHovered.value) && cursorScreen.value ? (openBlock(), createBlock(Teleport, {
          key: 1,
          to: "body"
        }, [
          createElementVNode("div", {
            style: normalizeStyle(tooltipStyle.value)
          }, toDisplayString(normalizedRotationDisplay.value.toFixed(0)) + "°", 5)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
function mapCounterRotatePoint(x, y, width, height, rotation) {
  switch (rotation) {
    case 1:
      return { x: y, y: height - x };
    case 2:
      return { x: width - x, y: height - y };
    case 3:
      return { x: width - y, y: x };
    default:
      return { x, y };
  }
}
function getAnnotationScreenBounds(annotation, scale, rotation) {
  const flags = annotation.object.flags ?? [];
  const hasNoZoom = flags.includes("noZoom");
  const hasNoRotate = flags.includes("noRotate");
  const left = annotation.object.rect.origin.x * scale;
  const top = annotation.object.rect.origin.y * scale;
  const width = annotation.object.rect.size.width * (hasNoZoom ? 1 : scale);
  const height = annotation.object.rect.size.height * (hasNoZoom ? 1 : scale);
  if (!hasNoRotate || rotation === 0) {
    return {
      left,
      top,
      right: left + width,
      bottom: top + height
    };
  }
  const corners = [
    mapCounterRotatePoint(0, 0, width, height, rotation),
    mapCounterRotatePoint(width, 0, width, height, rotation),
    mapCounterRotatePoint(0, height, width, height, rotation),
    mapCounterRotatePoint(width, height, width, height, rotation)
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const corner of corners) {
    if (corner.x < minX) minX = corner.x;
    if (corner.y < minY) minY = corner.y;
    if (corner.x > maxX) maxX = corner.x;
    if (corner.y > maxY) maxY = corner.y;
  }
  return {
    left: left + minX,
    top: top + minY,
    right: left + maxX,
    bottom: top + maxY
  };
}
const _hoisted_1$f = {
  key: 0,
  "data-group-selection-box": "",
  "data-no-interaction": ""
};
const _hoisted_2$b = ["width", "height", "stroke"];
const _hoisted_3$b = ["width", "height", "stroke"];
const _sfc_main$P = /* @__PURE__ */ defineComponent({
  __name: "group-selection-box",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: {},
    pageWidth: {},
    pageHeight: {},
    selectedAnnotations: {},
    isDraggable: { type: Boolean },
    isResizable: { type: Boolean },
    isRotatable: { type: Boolean, default: true },
    lockAspectRatio: { type: Boolean, default: false },
    resizeUi: {},
    rotationUi: {},
    selectionOutlineColor: { default: "#007ACC" },
    outlineOffset: { default: 2 },
    selectionOutline: {},
    zIndex: { default: 100 },
    groupSelectionMenu: {}
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const { plugin: annotationPlugin } = useAnnotationPlugin();
    const permissions = useDocumentPermissions(() => props.documentId);
    const gestureBase = shallowRef(null);
    const isDraggingRef = ref(false);
    const isResizingRef = ref(false);
    const liveRotation = ref(null);
    const cursorScreen = ref(null);
    const isHandleHovered = ref(false);
    const effectiveIsDraggable = computed(
      () => permissions.value.canModifyAnnotations && props.isDraggable
    );
    const effectiveIsResizable = computed(
      () => permissions.value.canModifyAnnotations && props.isResizable
    );
    const effectiveIsRotatable = computed(
      () => permissions.value.canModifyAnnotations && props.isRotatable
    );
    const HANDLE_COLOR = computed(() => {
      var _a;
      return ((_a = props.resizeUi) == null ? void 0 : _a.color) ?? "#007ACC";
    });
    const HANDLE_SIZE = computed(() => {
      var _a;
      return ((_a = props.resizeUi) == null ? void 0 : _a.size) ?? 12;
    });
    const ROTATION_SIZE = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.size) ?? 32;
    });
    const ROTATION_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.color) ?? "white";
    });
    const ROTATION_CONNECTOR_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.connectorColor) ?? "#007ACC";
    });
    const ROTATION_ICON_COLOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.iconColor) ?? "#007ACC";
    });
    const SHOW_CONNECTOR = computed(() => {
      var _a;
      return ((_a = props.rotationUi) == null ? void 0 : _a.showConnector) ?? false;
    });
    const ROTATION_MARGIN = computed(() => {
      var _a;
      return (_a = props.rotationUi) == null ? void 0 : _a.margin;
    });
    const ROTATION_BORDER_COLOR = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.color) ?? "#007ACC";
    });
    const ROTATION_BORDER_WIDTH = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.width) ?? 1;
    });
    const ROTATION_BORDER_STYLE = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.rotationUi) == null ? void 0 : _a.border) == null ? void 0 : _b.style) ?? "solid";
    });
    const outlineColor = computed(
      () => {
        var _a;
        return ((_a = props.selectionOutline) == null ? void 0 : _a.color) ?? props.selectionOutlineColor ?? "#007ACC";
      }
    );
    const outlineStyleVal = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.style) ?? "dashed";
    });
    const outlineWidth = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.width) ?? 2;
    });
    const outlineOff = computed(() => {
      var _a;
      return ((_a = props.selectionOutline) == null ? void 0 : _a.offset) ?? props.outlineOffset ?? 2;
    });
    const groupRotationDisplay = computed(() => liveRotation.value ?? 0);
    const rotationActive = computed(() => liveRotation.value !== null);
    const normalizedRotationDisplay = computed(() => {
      const val = groupRotationDisplay.value;
      return Number.isFinite(val) ? Math.round(val * 10) / 10 : 0;
    });
    const rotationIconSize = computed(() => Math.round(ROTATION_SIZE.value * 0.6));
    const groupBox = computed(() => {
      const rects = props.selectedAnnotations.map((ta) => ta.object.rect);
      return boundingRectOrEmpty(rects);
    });
    const previewGroupBox = shallowRef(groupBox.value);
    watch(
      () => groupBox.value,
      (newGroupBox) => {
        if (!isDraggingRef.value && !isResizingRef.value) {
          previewGroupBox.value = newGroupBox;
        }
      },
      { immediate: true }
    );
    watch(
      () => annotationPlugin.value,
      (plugin, _old, onCleanup) => {
        if (!plugin) return;
        const unsub = plugin.onRotateChange((event) => {
          if (event.documentId !== props.documentId) return;
          if (event.type === "end" || event.type === "cancel") {
            liveRotation.value = null;
          }
        });
        onCleanup(unsub);
      },
      { immediate: true }
    );
    const visualBoundsCorrection = computed(() => {
      let visualLeft = Infinity;
      let visualTop = Infinity;
      let visualRight = -Infinity;
      let visualBottom = -Infinity;
      for (const ta of props.selectedAnnotations) {
        const bounds = getAnnotationScreenBounds(ta, props.scale, props.rotation);
        if (bounds.left < visualLeft) visualLeft = bounds.left;
        if (bounds.top < visualTop) visualTop = bounds.top;
        if (bounds.right > visualRight) visualRight = bounds.right;
        if (bounds.bottom > visualBottom) visualBottom = bounds.bottom;
      }
      const gb = groupBox.value;
      const logicalLeft = gb.origin.x * props.scale;
      const logicalTop = gb.origin.y * props.scale;
      const logicalRight = (gb.origin.x + gb.size.width) * props.scale;
      const logicalBottom = (gb.origin.y + gb.size.height) * props.scale;
      return {
        left: visualLeft - logicalLeft,
        top: visualTop - logicalTop,
        right: visualRight - logicalRight,
        bottom: visualBottom - logicalBottom
      };
    });
    const groupBoxLeft = computed(
      () => previewGroupBox.value.origin.x * props.scale + visualBoundsCorrection.value.left
    );
    const groupBoxTop = computed(
      () => previewGroupBox.value.origin.y * props.scale + visualBoundsCorrection.value.top
    );
    const groupBoxWidth = computed(
      () => previewGroupBox.value.size.width * props.scale + (visualBoundsCorrection.value.right - visualBoundsCorrection.value.left)
    );
    const groupBoxHeight = computed(
      () => previewGroupBox.value.size.height * props.scale + (visualBoundsCorrection.value.bottom - visualBoundsCorrection.value.top)
    );
    const groupCenterX = computed(() => groupBoxWidth.value / 2);
    const groupCenterY = computed(() => groupBoxHeight.value / 2);
    const groupGuideLength = computed(
      () => Math.max(300, Math.max(groupBoxWidth.value, groupBoxHeight.value) + 80)
    );
    const contentsStyle = { display: "contents" };
    const outerStyle = computed(() => ({
      position: "absolute",
      left: `${groupBoxLeft.value}px`,
      top: `${groupBoxTop.value}px`,
      width: `${groupBoxWidth.value}px`,
      height: `${groupBoxHeight.value}px`,
      pointerEvents: "none",
      zIndex: props.zIndex
    }));
    const boxStyle = computed(() => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: `${groupBoxWidth.value}px`,
      height: `${groupBoxHeight.value}px`,
      outline: rotationActive.value ? "none" : `${outlineWidth.value}px ${outlineStyleVal.value} ${outlineColor.value}`,
      outlineOffset: `${outlineOff.value - 1}px`,
      cursor: effectiveIsDraggable.value ? "move" : "default",
      touchAction: "none",
      pointerEvents: "auto"
    }));
    const guideHorizontalStyle = computed(() => ({
      position: "absolute",
      left: `${groupCenterX.value - groupGuideLength.value / 2}px`,
      top: `${groupCenterY.value}px`,
      width: `${groupGuideLength.value}px`,
      height: "1px",
      backgroundColor: HANDLE_COLOR.value,
      opacity: 0.35,
      pointerEvents: "none"
    }));
    const guideVerticalStyle = computed(() => ({
      position: "absolute",
      left: `${groupCenterX.value}px`,
      top: `${groupCenterY.value - groupGuideLength.value / 2}px`,
      width: "1px",
      height: `${groupGuideLength.value}px`,
      backgroundColor: HANDLE_COLOR.value,
      opacity: 0.35,
      pointerEvents: "none"
    }));
    const guideAngleStyle = computed(() => ({
      position: "absolute",
      left: `${groupCenterX.value - groupGuideLength.value / 2}px`,
      top: `${groupCenterY.value}px`,
      width: `${groupGuideLength.value}px`,
      height: "1px",
      transformOrigin: "center center",
      transform: `rotate(${groupRotationDisplay.value}deg)`,
      backgroundColor: HANDLE_COLOR.value,
      opacity: 0.8,
      pointerEvents: "none"
    }));
    const connectorLineStyle = computed(() => {
      var _a;
      return {
        ...((_a = rotationHandleData.value) == null ? void 0 : _a.connector.style) ?? {},
        backgroundColor: ROTATION_CONNECTOR_COLOR.value,
        opacity: rotationActive.value ? 0 : 1
      };
    });
    const rotationHandleStyle = computed(() => {
      var _a;
      return {
        ...((_a = rotationHandleData.value) == null ? void 0 : _a.handle.style) ?? {},
        backgroundColor: ROTATION_COLOR.value,
        border: `${ROTATION_BORDER_WIDTH.value}px ${ROTATION_BORDER_STYLE.value} ${ROTATION_BORDER_COLOR.value}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        opacity: rotationActive.value ? 0 : 1
      };
    });
    const rotationHandleBindings = computed(() => {
      if (!rotationHandleData.value) return {};
      const { style: _s, ...rest } = rotationHandleData.value.handle;
      return rest;
    });
    const rotationHandleSlotProps = computed(() => {
      if (!rotationHandleData.value) return {};
      return {
        ...rotationHandleData.value.handle,
        backgroundColor: ROTATION_COLOR.value,
        iconColor: ROTATION_ICON_COLOR.value,
        connectorStyle: connectorLineStyle.value,
        showConnector: SHOW_CONNECTOR.value,
        opacity: rotationActive.value ? 0 : 1,
        border: {
          color: ROTATION_BORDER_COLOR.value,
          width: ROTATION_BORDER_WIDTH.value,
          style: ROTATION_BORDER_STYLE.value
        }
      };
    });
    const tooltipStyle = computed(() => ({
      position: "fixed",
      left: cursorScreen.value ? `${cursorScreen.value.x + 16}px` : "0",
      top: cursorScreen.value ? `${cursorScreen.value.y - 16}px` : "0",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontFamily: "monospace",
      pointerEvents: "none",
      zIndex: 1e4,
      whiteSpace: "nowrap"
    }));
    const menuRect = computed(() => ({
      origin: {
        x: groupBoxLeft.value,
        y: groupBoxTop.value
      },
      size: {
        width: groupBoxWidth.value,
        height: groupBoxHeight.value
      }
    }));
    const menuContext = computed(() => ({
      type: "group",
      annotations: props.selectedAnnotations,
      pageIndex: props.pageIndex
    }));
    const menuPlacement = computed(() => {
      const effectiveAngle = ((groupRotationDisplay.value + props.rotation * 90) % 360 + 360) % 360;
      const handleNearMenuSide = effectiveIsRotatable.value && effectiveAngle > 90 && effectiveAngle < 270;
      return {
        suggestTop: handleNearMenuSide
      };
    });
    const shouldShowMenu = computed(() => {
      return props.groupSelectionMenu || slots["group-selection-menu"];
    });
    const renderGroupMenu = (rect, menuWrapperProps) => {
      if (!props.groupSelectionMenu) return null;
      return props.groupSelectionMenu({
        rect,
        menuWrapperProps,
        selected: true,
        placement: menuPlacement.value,
        context: menuContext.value
      });
    };
    const onHandlePointerMove = (e) => {
      if (!rotationActive.value) {
        cursorScreen.value = { x: e.clientX, y: e.clientY };
      }
    };
    const elementSnapshot = computed(() => previewGroupBox.value);
    const constraintsSnapshot = computed(() => ({
      minWidth: 20,
      minHeight: 20,
      boundingBox: {
        width: props.pageWidth,
        height: props.pageHeight
      }
    }));
    const {
      dragProps,
      resize,
      rotation: rotationHandleData
    } = useInteractionHandles({
      controller: {
        element: elementSnapshot,
        vertices: computed(() => []),
        constraints: constraintsSnapshot,
        maintainAspectRatio: computed(() => props.lockAspectRatio),
        pageRotation: computed(() => props.rotation),
        scale: computed(() => props.scale),
        enabled: computed(() => true),
        onUpdate: (event) => {
          var _a, _b, _c, _d, _e, _f;
          if (!((_a = event.transformData) == null ? void 0 : _a.type)) return;
          if (!annotationPlugin.value) return;
          const plugin = annotationPlugin.value;
          const transformType = event.transformData.type;
          const isMove = transformType === "move";
          const isResize = transformType === "resize";
          if (isMove && !effectiveIsDraggable.value) return;
          if (event.state === "start") {
            gestureBase.value = groupBox.value;
            if (isMove) {
              isDraggingRef.value = true;
              plugin.startDrag(props.documentId, {
                annotationIds: props.selectedAnnotations.map((ta) => ta.object.id),
                pageSize: { width: props.pageWidth, height: props.pageHeight }
              });
            } else if (isResize) {
              isResizingRef.value = true;
              plugin.startResize(props.documentId, {
                annotationIds: props.selectedAnnotations.map((ta) => ta.object.id),
                pageSize: { width: props.pageWidth, height: props.pageHeight },
                resizeHandle: ((_b = event.transformData.metadata) == null ? void 0 : _b.handle) ?? "se"
              });
            }
          }
          if (transformType === "rotate") {
            if (!props.isRotatable) return;
            const ids = props.selectedAnnotations.map((ta) => ta.object.id);
            const cursorAngle = ((_c = event.transformData.metadata) == null ? void 0 : _c.rotationAngle) ?? 0;
            const cursorPos = (_d = event.transformData.metadata) == null ? void 0 : _d.cursorPosition;
            if (cursorPos) cursorScreen.value = { x: cursorPos.clientX, y: cursorPos.clientY };
            if (event.state === "start") {
              liveRotation.value = cursorAngle;
              plugin.startRotation(props.documentId, {
                annotationIds: ids,
                cursorAngle,
                rotationCenter: (_e = event.transformData.metadata) == null ? void 0 : _e.rotationCenter
              });
            } else if (event.state === "move") {
              liveRotation.value = cursorAngle;
              plugin.updateRotation(
                props.documentId,
                cursorAngle,
                (_f = event.transformData.metadata) == null ? void 0 : _f.rotationDelta
              );
            } else if (event.state === "end") {
              liveRotation.value = null;
              cursorScreen.value = null;
              plugin.commitRotation(props.documentId);
            }
            return;
          }
          const base = gestureBase.value ?? groupBox.value;
          if (isMove && event.transformData.changes.rect) {
            const newRect = event.transformData.changes.rect;
            const rawDelta = {
              x: newRect.origin.x - base.origin.x,
              y: newRect.origin.y - base.origin.y
            };
            const clampedDelta = plugin.updateDrag(props.documentId, rawDelta);
            previewGroupBox.value = {
              ...base,
              origin: {
                x: base.origin.x + clampedDelta.x,
                y: base.origin.y + clampedDelta.y
              }
            };
          } else if (isResize && event.transformData.changes.rect) {
            const newGroupBox = event.transformData.changes.rect;
            plugin.updateResize(props.documentId, newGroupBox);
            previewGroupBox.value = newGroupBox;
          }
          if (event.state === "end") {
            gestureBase.value = null;
            if (isMove && isDraggingRef.value) {
              isDraggingRef.value = false;
              plugin.commitDrag(props.documentId);
            } else if (isResize && isResizingRef.value) {
              isResizingRef.value = false;
              plugin.commitResize(props.documentId);
            }
          }
        }
      },
      resizeUI: {
        handleSize: HANDLE_SIZE.value,
        spacing: outlineOff.value,
        offsetMode: "outside",
        includeSides: !props.lockAspectRatio,
        zIndex: props.zIndex + 1
      },
      vertexUI: {
        vertexSize: 0,
        zIndex: props.zIndex
      },
      rotationUI: {
        handleSize: ROTATION_SIZE.value,
        margin: ROTATION_MARGIN.value,
        zIndex: props.zIndex + 2,
        showConnector: SHOW_CONNECTOR.value
      },
      includeVertices: false,
      includeRotation: effectiveIsRotatable,
      currentRotation: computed(() => liveRotation.value ?? 0)
    });
    return (_ctx, _cache) => {
      return __props.selectedAnnotations.length >= 2 ? (openBlock(), createElementBlock("div", _hoisted_1$f, [
        createElementVNode("div", {
          style: normalizeStyle(outerStyle.value)
        }, [
          rotationActive.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createElementVNode("div", {
              style: normalizeStyle(guideHorizontalStyle.value)
            }, null, 4),
            createElementVNode("div", {
              style: normalizeStyle(guideVerticalStyle.value)
            }, null, 4),
            createElementVNode("div", {
              style: normalizeStyle(guideAngleStyle.value)
            }, null, 4)
          ], 64)) : createCommentVNode("", true),
          effectiveIsRotatable.value && unref(rotationHandleData) ? (openBlock(), createElementBlock("div", {
            key: 1,
            onPointerenter: _cache[0] || (_cache[0] = ($event) => isHandleHovered.value = true),
            onPointerleave: _cache[1] || (_cache[1] = ($event) => {
              isHandleHovered.value = false;
              cursorScreen.value = null;
            }),
            onPointermove: onHandlePointerMove,
            style: contentsStyle
          }, [
            SHOW_CONNECTOR.value ? (openBlock(), createElementBlock("div", {
              key: 0,
              style: normalizeStyle(connectorLineStyle.value)
            }, null, 4)) : createCommentVNode("", true),
            unref(slots)["rotation-handle"] ? renderSlot(_ctx.$slots, "rotation-handle", normalizeProps(mergeProps({ key: 1 }, rotationHandleSlotProps.value)), () => [
              createElementVNode("div", mergeProps(rotationHandleBindings.value, { style: rotationHandleStyle.value }), [
                (openBlock(), createElementBlock("svg", {
                  width: rotationIconSize.value,
                  height: rotationIconSize.value,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: ROTATION_ICON_COLOR.value,
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [..._cache[2] || (_cache[2] = [
                  createElementVNode("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }, null, -1),
                  createElementVNode("path", { d: "M21 3v5h-5" }, null, -1)
                ])], 8, _hoisted_2$b))
              ], 16)
            ]) : (openBlock(), createElementBlock("div", mergeProps({ key: 2 }, rotationHandleBindings.value, { style: rotationHandleStyle.value }), [
              (openBlock(), createElementBlock("svg", {
                width: rotationIconSize.value,
                height: rotationIconSize.value,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: ROTATION_ICON_COLOR.value,
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, [..._cache[3] || (_cache[3] = [
                createElementVNode("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }, null, -1),
                createElementVNode("path", { d: "M21 3v5h-5" }, null, -1)
              ])], 8, _hoisted_3$b))
            ], 16))
          ], 32)) : createCommentVNode("", true),
          createElementVNode("div", mergeProps(
            effectiveIsDraggable.value ? unref(dragProps) : { onPointerdown: (e) => e.stopPropagation() },
            { style: boxStyle.value }
          ), [
            effectiveIsResizable.value && !rotationActive.value ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(unref(resize), ({ key, style, ...handle }) => {
              return openBlock(), createElementBlock(Fragment, { key }, [
                unref(slots)["resize-handle"] ? renderSlot(_ctx.$slots, "resize-handle", mergeProps({
                  key: 0,
                  ref_for: true
                }, { key, style, ...handle, backgroundColor: HANDLE_COLOR.value }), () => [
                  createElementVNode("div", mergeProps({ ref_for: true }, handle, {
                    style: [style, { backgroundColor: HANDLE_COLOR.value }]
                  }), null, 16)
                ]) : (openBlock(), createElementBlock("div", mergeProps({
                  key: 1,
                  ref_for: true
                }, handle, {
                  style: [style, { backgroundColor: HANDLE_COLOR.value }]
                }), null, 16))
              ], 64);
            }), 128)) : createCommentVNode("", true)
          ], 16)
        ], 4),
        shouldShowMenu.value && !rotationActive.value ? (openBlock(), createBlock(unref(CounterRotate), {
          key: 0,
          rect: menuRect.value,
          rotation: __props.rotation
        }, {
          default: withCtx(({ rect, menuWrapperProps }) => [
            __props.groupSelectionMenu ? (openBlock(), createBlock(resolveDynamicComponent(renderGroupMenu(rect, menuWrapperProps)), { key: 0 })) : renderSlot(_ctx.$slots, "group-selection-menu", {
              key: 1,
              context: menuContext.value,
              selected: true,
              rect,
              placement: menuPlacement.value,
              menuWrapperProps
            })
          ]),
          _: 3
        }, 8, ["rect", "rotation"])) : createCommentVNode("", true),
        (rotationActive.value || isHandleHovered.value) && cursorScreen.value ? (openBlock(), createBlock(Teleport, {
          key: 1,
          to: "body"
        }, [
          createElementVNode("div", {
            style: normalizeStyle(tooltipStyle.value)
          }, toDisplayString(normalizedRotationDisplay.value.toFixed(0)) + "°", 5)
        ])) : createCommentVNode("", true)
      ])) : createCommentVNode("", true);
    };
  }
});
const RendererRegistryKey = Symbol(
  "AnnotationRendererRegistry"
);
function createRendererRegistry() {
  const renderers = shallowRef([]);
  return {
    register(entries) {
      const ids = new Set(entries.map((e) => e.id));
      renderers.value = [...renderers.value.filter((r) => !ids.has(r.id)), ...entries];
      return () => {
        renderers.value = renderers.value.filter((r) => !entries.some((e) => e.id === r.id));
      };
    },
    getAll() {
      return renderers.value;
    }
  };
}
function provideRendererRegistry() {
  const registry = createRendererRegistry();
  provide(RendererRegistryKey, registry);
  return registry;
}
function useRendererRegistry() {
  return inject(RendererRegistryKey, null);
}
function useRegisterRenderers(entries) {
  const registry = useRendererRegistry();
  if (!registry) return;
  const unregister = registry.register(entries);
  onUnmounted(unregister);
}
function createRenderer(entry) {
  return {
    id: entry.id,
    matches: entry.matches ?? (() => false),
    component: entry.component ? markRaw(entry.component) : () => null,
    matchesPreview: entry.matchesPreview,
    previewContainerStyle: entry.previewContainerStyle ? (props) => entry.previewContainerStyle(props) : void 0,
    vertexConfig: entry.vertexConfig,
    zIndex: entry.zIndex,
    defaultBlendMode: entry.defaultBlendMode,
    containerStyle: entry.containerStyle,
    interactionDefaults: entry.interactionDefaults,
    useAppearanceStream: entry.useAppearanceStream,
    isDraggable: entry.isDraggable,
    onDoubleClick: entry.onDoubleClick,
    selectOverride: entry.selectOverride,
    hideSelectionMenu: entry.hideSelectionMenu,
    renderPreview: entry.renderPreview ? markRaw(entry.renderPreview) : void 0,
    hiddenWhenLocked: entry.hiddenWhenLocked,
    renderLocked: entry.renderLocked ? markRaw(entry.renderLocked) : void 0
  };
}
const __default__$f = { inheritAttrs: false };
const _sfc_main$O = /* @__PURE__ */ defineComponent({
  ...__default__$f,
  __name: "link-locked",
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
    const { provides } = useAnnotationCapability();
    const handleClick = () => {
      const target = props.annotation.object.target;
      if (!target || !provides.value) return;
      provides.value.forDocument(props.documentId).navigateTarget(target);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        onClick: handleClick,
        style: {
          width: "100%",
          height: "100%",
          cursor: "pointer",
          pointerEvents: "auto"
        }
      });
    };
  }
});
const _sfc_main$N = /* @__PURE__ */ defineComponent({
  __name: "link-preview",
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
      borderBottom: `${props.data.strokeWidth * props.scale}px solid ${props.data.strokeColor}`,
      backgroundColor: "rgba(0, 0, 255, 0.05)",
      boxSizing: "border-box"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const _hoisted_1$e = ["width", "height", "viewBox"];
const _hoisted_2$a = ["d", "stroke-width"];
const _hoisted_3$a = ["d", "opacity"];
const __default__$e = { inheritAttrs: false };
const _sfc_main$M = /* @__PURE__ */ defineComponent({
  ...__default__$e,
  __name: "ink",
  props: {
    isSelected: { type: Boolean },
    strokeColor: {},
    opacity: { default: 1 },
    strokeWidth: {},
    inkList: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const resolvedColor = computed(() => props.strokeColor ?? "#000000");
    const paths = computed(() => {
      return props.inkList.map(({ points }) => {
        let d = "";
        points.forEach(({ x, y }, i) => {
          const lx = x - props.rect.origin.x;
          const ly = y - props.rect.origin.y;
          d += (i === 0 ? "M" : "L") + `${lx} ${ly} `;
        });
        return d.trim();
      });
    });
    const width = computed(() => props.rect.size.width * props.scale);
    const height = computed(() => props.rect.size.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: `${width.value}px`,
          height: `${height.value}px`,
          pointerEvents: "none",
          zIndex: 2,
          overflow: "visible"
        }),
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${__props.rect.size.width} ${__props.rect.size.height}`
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(paths.value, (d, i) => {
          return openBlock(), createElementBlock("path", {
            key: `hit-${i}`,
            d,
            fill: "none",
            stroke: "transparent",
            "stroke-width": hitStrokeWidth.value,
            onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => __props.onClick && __props.onClick(...args)),
            style: normalizeStyle({
              cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
              pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "visibleStroke",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            })
          }, null, 44, _hoisted_2$a);
        }), 128)),
        !__props.appearanceActive ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(paths.value, (d, i) => {
          return openBlock(), createElementBlock("path", {
            key: `vis-${i}`,
            d,
            fill: "none",
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: resolvedColor.value,
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "round",
              strokeLinejoin: "round"
            })
          }, null, 12, _hoisted_3$a);
        }), 128)) : createCommentVNode("", true)
      ], 12, _hoisted_1$e);
    };
  }
});
const _sfc_main$L = /* @__PURE__ */ defineComponent({
  __name: "ink-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$M, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _hoisted_1$d = ["width", "height", "viewBox"];
const _hoisted_2$9 = ["d", "stroke-width"];
const _hoisted_3$9 = ["x", "y", "width", "height", "stroke-width"];
const _hoisted_4$8 = ["d", "fill", "opacity"];
const _hoisted_5$6 = ["x", "y", "width", "height", "fill", "opacity"];
const __default__$d = { inheritAttrs: false };
const _sfc_main$K = /* @__PURE__ */ defineComponent({
  ...__default__$d,
  __name: "square",
  props: {
    isSelected: { type: Boolean },
    color: { default: "#000000" },
    strokeColor: {},
    opacity: { default: 1 },
    strokeWidth: {},
    strokeStyle: { default: PdfAnnotationBorderStyle.SOLID },
    strokeDashArray: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false },
    cloudyBorderIntensity: {},
    rectangleDifferences: {}
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const isCloudy = computed(() => (props.cloudyBorderIntensity ?? 0) > 0);
    const geometry = computed(() => {
      const outerW = props.rect.size.width;
      const outerH = props.rect.size.height;
      const innerW = Math.max(outerW - props.strokeWidth, 0);
      const innerH = Math.max(outerH - props.strokeWidth, 0);
      return {
        width: innerW,
        height: innerH,
        x: props.strokeWidth / 2,
        y: props.strokeWidth / 2
      };
    });
    const cloudyPath = computed(() => {
      if (!isCloudy.value) return null;
      return generateCloudyRectanglePath(
        { x: 0, y: 0, width: props.rect.size.width, height: props.rect.size.height },
        props.rectangleDifferences,
        props.cloudyBorderIntensity,
        props.strokeWidth
      );
    });
    const svgWidth = computed(() => props.rect.size.width * props.scale);
    const svgHeight = computed(() => props.rect.size.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: svgWidth.value,
          height: svgHeight.value,
          pointerEvents: "none",
          zIndex: 2
        }),
        width: svgWidth.value,
        height: svgHeight.value,
        viewBox: `0 0 ${__props.rect.size.width} ${__props.rect.size.height}`,
        overflow: "visible"
      }, [
        isCloudy.value && cloudyPath.value ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: cloudyPath.value.path,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : __props.color === "transparent" ? "visibleStroke" : "visible"
          })
        }, null, 44, _hoisted_2$9)) : (openBlock(), createElementBlock("rect", {
          key: 1,
          x: geometry.value.x,
          y: geometry.value.y,
          width: geometry.value.width,
          height: geometry.value.height,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[1] || (_cache[1] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : __props.color === "transparent" ? "visibleStroke" : "visible"
          })
        }, null, 44, _hoisted_3$9)),
        !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          isCloudy.value && cloudyPath.value ? (openBlock(), createElementBlock("path", {
            key: 0,
            d: cloudyPath.value.path,
            fill: __props.color,
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              strokeLinejoin: "round"
            })
          }, null, 12, _hoisted_4$8)) : (openBlock(), createElementBlock("rect", {
            key: 1,
            x: geometry.value.x,
            y: geometry.value.y,
            width: geometry.value.width,
            height: geometry.value.height,
            fill: __props.color,
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_a = __props.strokeDashArray) == null ? void 0 : _a.join(",")
              }
            })
          }, null, 12, _hoisted_5$6))
        ], 64)) : createCommentVNode("", true)
      ], 12, _hoisted_1$d);
    };
  }
});
const _sfc_main$J = /* @__PURE__ */ defineComponent({
  __name: "square-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$K, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _hoisted_1$c = ["width", "height", "viewBox"];
const _hoisted_2$8 = ["d", "stroke-width"];
const _hoisted_3$8 = ["cx", "cy", "rx", "ry", "stroke-width"];
const _hoisted_4$7 = ["d", "fill", "opacity"];
const _hoisted_5$5 = ["cx", "cy", "rx", "ry", "fill", "opacity"];
const __default__$c = { inheritAttrs: false };
const _sfc_main$I = /* @__PURE__ */ defineComponent({
  ...__default__$c,
  __name: "circle",
  props: {
    isSelected: { type: Boolean },
    color: { default: "#000000" },
    strokeColor: {},
    opacity: { default: 1 },
    strokeWidth: {},
    strokeStyle: { default: PdfAnnotationBorderStyle.SOLID },
    strokeDashArray: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false },
    cloudyBorderIntensity: {},
    rectangleDifferences: {}
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const isCloudy = computed(() => (props.cloudyBorderIntensity ?? 0) > 0);
    const geometry = computed(() => {
      const outerW = props.rect.size.width;
      const outerH = props.rect.size.height;
      const innerW = Math.max(outerW - props.strokeWidth, 0);
      const innerH = Math.max(outerH - props.strokeWidth, 0);
      return {
        width: outerW,
        height: outerH,
        cx: props.strokeWidth / 2 + innerW / 2,
        cy: props.strokeWidth / 2 + innerH / 2,
        rx: innerW / 2,
        ry: innerH / 2
      };
    });
    const cloudyPath = computed(() => {
      if (!isCloudy.value) return null;
      return generateCloudyEllipsePath(
        { x: 0, y: 0, width: props.rect.size.width, height: props.rect.size.height },
        props.rectangleDifferences,
        props.cloudyBorderIntensity,
        props.strokeWidth
      );
    });
    const svgWidth = computed(() => geometry.value.width * props.scale);
    const svgHeight = computed(() => geometry.value.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: svgWidth.value,
          height: svgHeight.value,
          pointerEvents: "none",
          zIndex: 2
        }),
        width: svgWidth.value,
        height: svgHeight.value,
        viewBox: `0 0 ${geometry.value.width} ${geometry.value.height}`,
        overflow: "visible"
      }, [
        isCloudy.value && cloudyPath.value ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: cloudyPath.value.path,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : __props.color === "transparent" ? "visibleStroke" : "visible"
          })
        }, null, 44, _hoisted_2$8)) : (openBlock(), createElementBlock("ellipse", {
          key: 1,
          cx: geometry.value.cx,
          cy: geometry.value.cy,
          rx: geometry.value.rx,
          ry: geometry.value.ry,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[1] || (_cache[1] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : __props.color === "transparent" ? "visibleStroke" : "visible"
          })
        }, null, 44, _hoisted_3$8)),
        !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          isCloudy.value && cloudyPath.value ? (openBlock(), createElementBlock("path", {
            key: 0,
            d: cloudyPath.value.path,
            fill: __props.color,
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              strokeLinejoin: "round"
            })
          }, null, 12, _hoisted_4$7)) : (openBlock(), createElementBlock("ellipse", {
            key: 1,
            cx: geometry.value.cx,
            cy: geometry.value.cy,
            rx: geometry.value.rx,
            ry: geometry.value.ry,
            fill: __props.color,
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_a = __props.strokeDashArray) == null ? void 0 : _a.join(",")
              }
            })
          }, null, 12, _hoisted_5$5))
        ], 64)) : createCommentVNode("", true)
      ], 12, _hoisted_1$c);
    };
  }
});
const _sfc_main$H = /* @__PURE__ */ defineComponent({
  __name: "circle-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$I, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _hoisted_1$b = ["width", "height", "viewBox"];
const _hoisted_2$7 = ["x1", "y1", "x2", "y2", "stroke-width"];
const _hoisted_3$7 = ["d", "transform", "stroke-width"];
const _hoisted_4$6 = ["d", "transform", "stroke-width"];
const _hoisted_5$4 = ["x1", "y1", "x2", "y2", "opacity"];
const _hoisted_6$3 = ["d", "transform", "stroke", "fill"];
const _hoisted_7$2 = ["d", "transform", "stroke", "fill"];
const __default__$b = { inheritAttrs: false };
const _sfc_main$G = /* @__PURE__ */ defineComponent({
  ...__default__$b,
  __name: "line",
  props: {
    color: { default: "transparent" },
    opacity: { default: 1 },
    strokeWidth: {},
    strokeColor: { default: "#000000" },
    strokeStyle: { default: PdfAnnotationBorderStyle.SOLID },
    strokeDashArray: {},
    rect: {},
    linePoints: {},
    lineEndings: {},
    scale: {},
    onClick: {},
    isSelected: { type: Boolean },
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const localLine = computed(() => ({
      x1: props.linePoints.start.x - props.rect.origin.x,
      y1: props.linePoints.start.y - props.rect.origin.y,
      x2: props.linePoints.end.x - props.rect.origin.x,
      y2: props.linePoints.end.y - props.rect.origin.y
    }));
    const endings = computed(() => {
      var _a, _b;
      const { x1, y1, x2, y2 } = localLine.value;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      return {
        start: patching.createEnding(
          (_a = props.lineEndings) == null ? void 0 : _a.start,
          props.strokeWidth,
          angle + Math.PI,
          x1,
          y1
        ),
        end: patching.createEnding((_b = props.lineEndings) == null ? void 0 : _b.end, props.strokeWidth, angle, x2, y2)
      };
    });
    const width = computed(() => props.rect.size.width * props.scale);
    const height = computed(() => props.rect.size.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: `${width.value}px`,
          height: `${height.value}px`,
          pointerEvents: "none",
          zIndex: 2,
          overflow: "visible"
        }),
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${__props.rect.size.width} ${__props.rect.size.height}`
      }, [
        createElementVNode("line", {
          x1: localLine.value.x1,
          y1: localLine.value.y1,
          x2: localLine.value.x2,
          y2: localLine.value.y2,
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "visibleStroke",
            strokeLinecap: "butt"
          })
        }, null, 44, _hoisted_2$7),
        endings.value.start ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: endings.value.start.d,
          transform: endings.value.start.transform,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[1] || (_cache[1] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : endings.value.start.filled ? "visible" : "visibleStroke",
            strokeLinecap: "butt"
          })
        }, null, 44, _hoisted_3$7)) : createCommentVNode("", true),
        endings.value.end ? (openBlock(), createElementBlock("path", {
          key: 1,
          d: endings.value.end.d,
          transform: endings.value.end.transform,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[2] || (_cache[2] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : endings.value.end.filled ? "visible" : "visibleStroke",
            strokeLinecap: "butt"
          })
        }, null, 44, _hoisted_4$6)) : createCommentVNode("", true),
        !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createElementVNode("line", {
            x1: localLine.value.x1,
            y1: localLine.value.y1,
            x2: localLine.value.x2,
            y2: localLine.value.y2,
            opacity: __props.opacity,
            style: normalizeStyle({
              pointerEvents: "none",
              stroke: __props.strokeColor,
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "butt",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_a = __props.strokeDashArray) == null ? void 0 : _a.join(",")
              }
            })
          }, null, 12, _hoisted_5$4),
          endings.value.start ? (openBlock(), createElementBlock("path", {
            key: 0,
            d: endings.value.start.d,
            transform: endings.value.start.transform,
            stroke: __props.strokeColor,
            fill: endings.value.start.filled ? __props.color : "none",
            style: normalizeStyle({
              pointerEvents: "none",
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "butt",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_b = __props.strokeDashArray) == null ? void 0 : _b.join(",")
              }
            })
          }, null, 12, _hoisted_6$3)) : createCommentVNode("", true),
          endings.value.end ? (openBlock(), createElementBlock("path", {
            key: 1,
            d: endings.value.end.d,
            transform: endings.value.end.transform,
            stroke: __props.strokeColor,
            fill: endings.value.end.filled ? __props.color : "none",
            style: normalizeStyle({
              pointerEvents: "none",
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "butt",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_c = __props.strokeDashArray) == null ? void 0 : _c.join(",")
              }
            })
          }, null, 12, _hoisted_7$2)) : createCommentVNode("", true)
        ], 64)) : createCommentVNode("", true)
      ], 12, _hoisted_1$b);
    };
  }
});
const _sfc_main$F = /* @__PURE__ */ defineComponent({
  __name: "line-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$G, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _hoisted_1$a = ["width", "height", "viewBox"];
const _hoisted_2$6 = ["d", "stroke-width"];
const _hoisted_3$6 = ["d", "transform", "stroke-width"];
const _hoisted_4$5 = ["d", "transform", "stroke-width"];
const _hoisted_5$3 = ["d", "opacity"];
const _hoisted_6$2 = ["d", "transform", "stroke", "fill"];
const _hoisted_7$1 = ["d", "transform", "stroke", "fill"];
const __default__$a = { inheritAttrs: false };
const _sfc_main$E = /* @__PURE__ */ defineComponent({
  ...__default__$a,
  __name: "polyline",
  props: {
    rect: {},
    vertices: {},
    color: { default: "transparent" },
    strokeColor: { default: "#000000" },
    opacity: { default: 1 },
    strokeWidth: {},
    strokeStyle: { default: PdfAnnotationBorderStyle.SOLID },
    strokeDashArray: {},
    scale: {},
    isSelected: { type: Boolean },
    onClick: {},
    lineEndings: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const localPts = computed(
      () => props.vertices.map(({ x, y }) => ({
        x: x - props.rect.origin.x,
        y: y - props.rect.origin.y
      }))
    );
    const pathData = computed(() => {
      if (localPts.value.length === 0) return "";
      const [first, ...rest] = localPts.value;
      return (`M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y} `).join("")).trim();
    });
    const endings = computed(() => {
      var _a, _b;
      if (localPts.value.length < 2) return { start: null, end: null };
      const toAngle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
      const startRad = toAngle(localPts.value[0], localPts.value[1]);
      const endRad = toAngle(
        localPts.value[localPts.value.length - 2],
        localPts.value[localPts.value.length - 1]
      );
      return {
        start: patching.createEnding(
          (_a = props.lineEndings) == null ? void 0 : _a.start,
          props.strokeWidth,
          startRad + Math.PI,
          localPts.value[0].x,
          localPts.value[0].y
        ),
        end: patching.createEnding(
          (_b = props.lineEndings) == null ? void 0 : _b.end,
          props.strokeWidth,
          endRad,
          localPts.value[localPts.value.length - 1].x,
          localPts.value[localPts.value.length - 1].y
        )
      };
    });
    const width = computed(() => props.rect.size.width * props.scale);
    const height = computed(() => props.rect.size.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: `${width.value}px`,
          height: `${height.value}px`,
          pointerEvents: "none",
          zIndex: 2,
          overflow: "visible"
        }),
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${__props.rect.size.width} ${__props.rect.size.height}`
      }, [
        createElementVNode("path", {
          d: pathData.value,
          fill: "none",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "visibleStroke",
            strokeLinecap: "butt",
            strokeLinejoin: "miter"
          })
        }, null, 44, _hoisted_2$6),
        endings.value.start ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: endings.value.start.d,
          transform: endings.value.start.transform,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[1] || (_cache[1] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : endings.value.start.filled ? "visible" : "visibleStroke",
            strokeLinecap: "butt"
          })
        }, null, 44, _hoisted_3$6)) : createCommentVNode("", true),
        endings.value.end ? (openBlock(), createElementBlock("path", {
          key: 1,
          d: endings.value.end.d,
          transform: endings.value.end.transform,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[2] || (_cache[2] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : endings.value.end.filled ? "visible" : "visibleStroke",
            strokeLinecap: "butt"
          })
        }, null, 44, _hoisted_4$5)) : createCommentVNode("", true),
        !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createElementVNode("path", {
            d: pathData.value,
            opacity: __props.opacity,
            style: normalizeStyle({
              fill: "none",
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              pointerEvents: "none",
              strokeLinecap: "butt",
              strokeLinejoin: "miter",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_a = __props.strokeDashArray) == null ? void 0 : _a.join(",")
              }
            })
          }, null, 12, _hoisted_5$3),
          endings.value.start ? (openBlock(), createElementBlock("path", {
            key: 0,
            d: endings.value.start.d,
            transform: endings.value.start.transform,
            stroke: __props.strokeColor,
            fill: endings.value.start.filled ? __props.color : "none",
            style: normalizeStyle({
              pointerEvents: "none",
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "butt",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_b = __props.strokeDashArray) == null ? void 0 : _b.join(",")
              }
            })
          }, null, 12, _hoisted_6$2)) : createCommentVNode("", true),
          endings.value.end ? (openBlock(), createElementBlock("path", {
            key: 1,
            d: endings.value.end.d,
            transform: endings.value.end.transform,
            stroke: __props.strokeColor,
            fill: endings.value.end.filled ? __props.color : "none",
            style: normalizeStyle({
              pointerEvents: "none",
              strokeWidth: __props.strokeWidth,
              strokeLinecap: "butt",
              ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                strokeDasharray: (_c = __props.strokeDashArray) == null ? void 0 : _c.join(",")
              }
            })
          }, null, 12, _hoisted_7$1)) : createCommentVNode("", true)
        ], 64)) : createCommentVNode("", true)
      ], 12, _hoisted_1$a);
    };
  }
});
const _sfc_main$D = /* @__PURE__ */ defineComponent({
  __name: "polyline-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$E, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _hoisted_1$9 = ["width", "height", "viewBox"];
const _hoisted_2$5 = ["d", "stroke-width"];
const _hoisted_3$5 = ["d", "opacity"];
const _hoisted_4$4 = ["d", "opacity"];
const _hoisted_5$2 = ["d"];
const _hoisted_6$1 = ["x", "y", "width", "height", "fill", "stroke", "stroke-width"];
const __default__$9 = { inheritAttrs: false };
const _sfc_main$C = /* @__PURE__ */ defineComponent({
  ...__default__$9,
  __name: "polygon",
  props: {
    rect: {},
    vertices: {},
    color: { default: "transparent" },
    strokeColor: { default: "#000000" },
    opacity: { default: 1 },
    strokeWidth: {},
    strokeStyle: { default: PdfAnnotationBorderStyle.SOLID },
    strokeDashArray: {},
    scale: {},
    isSelected: { type: Boolean },
    onClick: {},
    currentVertex: {},
    handleSize: { default: 14 },
    appearanceActive: { type: Boolean, default: false },
    cloudyBorderIntensity: {}
  },
  setup(__props) {
    const MIN_HIT_AREA_SCREEN_PX = 20;
    const props = __props;
    const isCloudy = computed(() => (props.cloudyBorderIntensity ?? 0) > 0);
    const allPoints = computed(
      () => props.currentVertex ? [...props.vertices, props.currentVertex] : props.vertices
    );
    const localPts = computed(
      () => allPoints.value.map(({ x, y }) => ({
        x: x - props.rect.origin.x,
        y: y - props.rect.origin.y
      }))
    );
    const pathData = computed(() => {
      if (!localPts.value.length) return "";
      const [first, ...rest] = localPts.value;
      const isPreview = !!props.currentVertex;
      return (`M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ") + (isPreview ? "" : " Z")).trim();
    });
    const cloudyPath = computed(() => {
      if (!isCloudy.value || allPoints.value.length < 3) return null;
      return generateCloudyPolygonPath(
        allPoints.value,
        props.rect.origin,
        props.cloudyBorderIntensity,
        props.strokeWidth
      );
    });
    const isPreviewing = computed(() => props.currentVertex && props.vertices.length > 0);
    const width = computed(() => props.rect.size.width * props.scale);
    const height = computed(() => props.rect.size.height * props.scale);
    const hitStrokeWidth = computed(
      () => Math.max(props.strokeWidth, MIN_HIT_AREA_SCREEN_PX / props.scale)
    );
    return (_ctx, _cache) => {
      var _a;
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: `${width.value}px`,
          height: `${height.value}px`,
          pointerEvents: "none",
          zIndex: 2,
          overflow: "visible"
        }),
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${__props.rect.size.width} ${__props.rect.size.height}`
      }, [
        createElementVNode("path", {
          d: isCloudy.value && cloudyPath.value ? cloudyPath.value.path : pathData.value,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": hitStrokeWidth.value,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : __props.color === "transparent" ? "visibleStroke" : "visible",
            strokeLinecap: "butt",
            strokeLinejoin: "miter"
          })
        }, null, 44, _hoisted_2$5),
        !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          isCloudy.value && cloudyPath.value ? (openBlock(), createElementBlock("path", {
            key: 0,
            d: cloudyPath.value.path,
            opacity: __props.opacity,
            style: normalizeStyle({
              fill: __props.color,
              stroke: __props.strokeColor ?? __props.color,
              strokeWidth: __props.strokeWidth,
              pointerEvents: "none",
              strokeLinejoin: "round"
            })
          }, null, 12, _hoisted_3$5)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            createElementVNode("path", {
              d: pathData.value,
              opacity: __props.opacity,
              style: normalizeStyle({
                fill: __props.currentVertex ? "none" : __props.color,
                stroke: __props.strokeColor ?? __props.color,
                strokeWidth: __props.strokeWidth,
                pointerEvents: "none",
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                ...__props.strokeStyle === unref(PdfAnnotationBorderStyle).DASHED && {
                  strokeDasharray: (_a = __props.strokeDashArray) == null ? void 0 : _a.join(",")
                }
              })
            }, null, 12, _hoisted_4$4),
            isPreviewing.value && localPts.value.length > 1 ? (openBlock(), createElementBlock("path", {
              key: 0,
              d: `M ${localPts.value[localPts.value.length - 1].x} ${localPts.value[localPts.value.length - 1].y} L ${localPts.value[0].x} ${localPts.value[0].y}`,
              fill: "none",
              style: normalizeStyle({
                stroke: __props.strokeColor,
                strokeWidth: __props.strokeWidth,
                strokeDasharray: "4,4",
                opacity: 0.7,
                pointerEvents: "none"
              })
            }, null, 12, _hoisted_5$2)) : createCommentVNode("", true),
            isPreviewing.value && localPts.value.length >= 2 ? (openBlock(), createElementBlock("rect", {
              key: 1,
              x: localPts.value[0].x - __props.handleSize / __props.scale / 2,
              y: localPts.value[0].y - __props.handleSize / __props.scale / 2,
              width: __props.handleSize / __props.scale,
              height: __props.handleSize / __props.scale,
              fill: __props.strokeColor,
              opacity: 0.4,
              stroke: __props.strokeColor,
              "stroke-width": __props.strokeWidth / 2,
              style: { "pointer-events": "none" }
            }, null, 8, _hoisted_6$1)) : createCommentVNode("", true)
          ], 64))
        ], 64)) : createCommentVNode("", true)
      ], 12, _hoisted_1$9);
    };
  }
});
const _sfc_main$B = /* @__PURE__ */ defineComponent({
  __name: "polygon-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$C, mergeProps({
        isSelected: false,
        scale: __props.scale
      }, __props.data), null, 16, ["scale"]);
    };
  }
});
const _sfc_main$A = /* @__PURE__ */ defineComponent({
  __name: "free-text-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const style = computed(() => ({
      width: "100%",
      height: "100%",
      border: `1px dashed ${props.data.fontColor || "#000000"}`,
      backgroundColor: "transparent"
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(style.value)
      }, null, 4);
    };
  }
});
const _hoisted_1$8 = ["width", "height", "viewBox"];
const _hoisted_2$4 = ["points", "stroke", "stroke-width", "opacity"];
const _hoisted_3$4 = ["d", "transform", "stroke", "fill", "stroke-width", "opacity"];
const _hoisted_4$3 = ["x", "y", "width", "height", "fill", "stroke", "stroke-width", "opacity"];
const _sfc_main$z = /* @__PURE__ */ defineComponent({
  __name: "callout-free-text-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const cl = computed(() => props.data.calloutLine);
    const sw = computed(() => props.data.strokeWidth ?? 1);
    const sc = computed(() => props.data.strokeColor ?? "#000000");
    const op = computed(() => props.data.opacity ?? 1);
    const w = computed(() => props.bounds.size.width);
    const h = computed(() => props.bounds.size.height);
    const ox = computed(() => props.bounds.origin.x);
    const oy = computed(() => props.bounds.origin.y);
    const lineCoords = computed(() => {
      const line = cl.value;
      if (!line || line.length < 2) return null;
      return line.map((p) => ({ x: p.x - ox.value, y: p.y - oy.value }));
    });
    const ending = computed(() => {
      const lc = lineCoords.value;
      if (!lc || lc.length < 2) return null;
      const angle = Math.atan2(lc[1].y - lc[0].y, lc[1].x - lc[0].x);
      return patching.createEnding(props.data.lineEnding, sw.value, angle + Math.PI, lc[0].x, lc[0].y);
    });
    const halfSw = computed(() => sw.value / 2);
    const tb = computed(() => props.data.textBox);
    return (_ctx, _cache) => {
      return lineCoords.value ? (openBlock(), createElementBlock("svg", {
        key: 0,
        style: normalizeStyle({
          position: "absolute",
          width: `${w.value * __props.scale}px`,
          height: `${h.value * __props.scale}px`,
          pointerEvents: "none",
          overflow: "visible"
        }),
        width: w.value * __props.scale,
        height: h.value * __props.scale,
        viewBox: `0 0 ${w.value} ${h.value}`
      }, [
        createElementVNode("polyline", {
          points: lineCoords.value.map((p) => `${p.x},${p.y}`).join(" "),
          fill: "none",
          stroke: sc.value,
          "stroke-width": sw.value,
          opacity: op.value
        }, null, 8, _hoisted_2$4),
        ending.value ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: ending.value.d,
          transform: ending.value.transform,
          stroke: sc.value,
          fill: ending.value.filled ? __props.data.color ?? "transparent" : "none",
          "stroke-width": sw.value,
          opacity: op.value
        }, null, 8, _hoisted_3$4)) : createCommentVNode("", true),
        tb.value ? (openBlock(), createElementBlock("rect", {
          key: 1,
          x: tb.value.origin.x - ox.value + halfSw.value,
          y: tb.value.origin.y - oy.value + halfSw.value,
          width: tb.value.size.width - sw.value,
          height: tb.value.size.height - sw.value,
          fill: __props.data.color ?? __props.data.backgroundColor ?? "transparent",
          stroke: sc.value,
          "stroke-width": sw.value,
          opacity: op.value
        }, null, 8, _hoisted_4$3)) : createCommentVNode("", true)
      ], 12, _hoisted_1$8)) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$7 = ["src"];
const _sfc_main$y = /* @__PURE__ */ defineComponent({
  __name: "stamp-preview",
  props: {
    data: {},
    bounds: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const rotationDeg = computed(() => (4 - props.data.pageRotation) % 4 * 90);
    const style = computed(() => ({
      width: "100%",
      height: "100%",
      opacity: 0.6,
      objectFit: "contain",
      pointerEvents: "none",
      transform: rotationDeg.value ? `rotate(${rotationDeg.value}deg)` : void 0
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("img", {
        src: __props.data.ghostUrl,
        style: normalizeStyle(style.value),
        alt: ""
      }, null, 12, _hoisted_1$7);
    };
  }
});
const _sfc_main$x = /* @__PURE__ */ defineComponent({
  __name: "ink-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$M, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "square-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$K, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "circle-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$I, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  __name: "line-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$G, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  __name: "polyline-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$E, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  __name: "polygon-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$C, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _hoisted_1$6 = ["contenteditable"];
const __default__$8 = { inheritAttrs: false };
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  ...__default__$8,
  __name: "free-text",
  props: {
    documentId: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    annotation: {},
    pageIndex: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const editorRef = ref(null);
    const editingRef = ref(false);
    const { provides: annotationCapability } = useAnnotationCapability();
    const annotationProvides = computed(
      () => {
        var _a;
        return ((_a = annotationCapability.value) == null ? void 0 : _a.forDocument(props.documentId)) ?? null;
      }
    );
    const ios = useIOSZoomPrevention(
      () => props.annotation.object.fontSize * props.scale,
      () => props.isEditing
    );
    watch(
      () => props.isEditing,
      async (editing) => {
        var _a, _b;
        if (!editing) return;
        await nextTick();
        if (!editorRef.value) return;
        editingRef.value = true;
        const editor = editorRef.value;
        editor.focus();
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(props.annotation.object);
        const isDefaultContent = ((_b = tool == null ? void 0 : tool.defaults) == null ? void 0 : _b.contents) != null && props.annotation.object.contents === tool.defaults.contents;
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          if (!isDefaultContent) {
            range.collapse(false);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }
      },
      { immediate: true }
    );
    const handleBlur = () => {
      if (!editingRef.value) return;
      editingRef.value = false;
      if (!annotationProvides.value || !editorRef.value) return;
      annotationProvides.value.updateAnnotation(props.pageIndex, props.annotation.object.id, {
        contents: editorRef.value.innerText.replace(/\u00A0/g, " ")
      });
    };
    const editorStyle = computed(() => {
      const { object: anno } = props.annotation;
      const { needsComp, adjustedFontPx, scaleComp } = ios.value;
      const invScalePercent = needsComp ? 100 / scaleComp : 100;
      return {
        color: anno.fontColor,
        fontSize: `${adjustedFontPx}px`,
        ...standardFontCssProperties(anno.fontFamily),
        textAlign: textAlignmentToCss(anno.textAlign),
        flexDirection: "column",
        justifyContent: anno.verticalAlign === PdfVerticalAlignment.Top ? "flex-start" : anno.verticalAlign === PdfVerticalAlignment.Middle ? "center" : "flex-end",
        display: "flex",
        backgroundColor: anno.color ?? anno.backgroundColor,
        opacity: anno.opacity,
        width: needsComp ? `${invScalePercent}%` : "100%",
        height: needsComp ? `${invScalePercent}%` : "100%",
        lineHeight: "1.18",
        overflow: "hidden",
        cursor: props.isEditing ? "text" : props.onClick ? "pointer" : "default",
        outline: "none",
        transform: needsComp ? `scale(${scaleComp})` : void 0,
        transformOrigin: "top left"
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle({
          position: "absolute",
          width: `${__props.annotation.object.rect.size.width * __props.scale}px`,
          height: `${__props.annotation.object.rect.size.height * __props.scale}px`,
          cursor: __props.isSelected && !__props.isEditing ? "move" : "default",
          pointerEvents: !__props.onClick ? "none" : __props.isSelected && !__props.isEditing ? "none" : "auto",
          zIndex: 2,
          opacity: __props.appearanceActive ? 0 : 1
        }),
        onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
        (...args) => __props.onClick && __props.onClick(...args))
      }, [
        createElementVNode("span", {
          ref_key: "editorRef",
          ref: editorRef,
          onBlur: handleBlur,
          tabindex: "0",
          style: normalizeStyle(editorStyle.value),
          contenteditable: __props.isEditing
        }, toDisplayString(__props.annotation.object.contents), 45, _hoisted_1$6)
      ], 36);
    };
  }
});
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "free-text-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$r, {
        documentId: __props.documentId,
        isSelected: __props.isSelected,
        isEditing: __props.isEditing,
        annotation: { ...__props.annotation, object: __props.currentObject },
        pageIndex: __props.pageIndex,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }, null, 8, ["documentId", "isSelected", "isEditing", "annotation", "pageIndex", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _hoisted_1$5 = ["width", "height", "viewBox"];
const _hoisted_2$3 = ["points", "stroke-width"];
const _hoisted_3$3 = ["d", "transform", "stroke-width"];
const _hoisted_4$2 = ["points", "stroke", "stroke-width", "opacity"];
const _hoisted_5$1 = ["d", "transform", "stroke", "fill", "stroke-width", "opacity"];
const _hoisted_6 = ["x", "y", "width", "height", "fill", "stroke", "stroke-width", "opacity"];
const _hoisted_7 = ["contenteditable"];
const __default__$7 = { inheritAttrs: false };
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  ...__default__$7,
  __name: "callout-free-text",
  props: {
    documentId: {},
    isSelected: { type: Boolean },
    isEditing: { type: Boolean },
    annotation: {},
    pageIndex: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const obj = computed(() => props.annotation.object);
    const strokeWidth = computed(() => obj.value.strokeWidth ?? 1);
    const strokeColor = computed(() => obj.value.strokeColor ?? "#000000");
    const editorRef = ref(null);
    const editingRef = ref(false);
    const { provides: annotationCapability } = useAnnotationCapability();
    const annotationProvides = computed(
      () => {
        var _a;
        return ((_a = annotationCapability.value) == null ? void 0 : _a.forDocument(props.documentId)) ?? null;
      }
    );
    const textBox = computed(
      () => patching.computeTextBoxFromRD(obj.value.rect, obj.value.rectangleDifferences)
    );
    const textBoxRelative = computed(() => ({
      left: (textBox.value.origin.x - obj.value.rect.origin.x + strokeWidth.value / 2) * props.scale,
      top: (textBox.value.origin.y - obj.value.rect.origin.y + strokeWidth.value / 2) * props.scale,
      width: (textBox.value.size.width - strokeWidth.value) * props.scale,
      height: (textBox.value.size.height - strokeWidth.value) * props.scale
    }));
    const lineCoords = computed(() => {
      const cl = obj.value.calloutLine;
      if (!cl || cl.length < 3) return null;
      return cl.map((p) => ({
        x: p.x - obj.value.rect.origin.x,
        y: p.y - obj.value.rect.origin.y
      }));
    });
    const ending = computed(() => {
      const lc = lineCoords.value;
      if (!lc || lc.length < 2) return null;
      const angle = Math.atan2(lc[1].y - lc[0].y, lc[1].x - lc[0].x);
      return patching.createEnding(
        obj.value.lineEnding,
        strokeWidth.value,
        angle + Math.PI,
        lc[0].x,
        lc[0].y
      );
    });
    const visualLineCoords = computed(() => {
      const lc = lineCoords.value;
      if (!lc || lc.length < 2) return lc;
      const pts = lc.map((p) => ({ ...p }));
      const last = pts.length - 1;
      const prev = last - 1;
      const dx = pts[last].x - pts[prev].x;
      const dy = pts[last].y - pts[prev].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const halfBw = strokeWidth.value / 2;
        pts[last].x += dx / len * halfBw;
        pts[last].y += dy / len * halfBw;
      }
      return pts;
    });
    const ios = useIOSZoomPrevention(
      () => obj.value.fontSize * props.scale,
      () => props.isEditing
    );
    const width = computed(() => obj.value.rect.size.width * props.scale);
    const height = computed(() => obj.value.rect.size.height * props.scale);
    const hitStrokeWidth = computed(() => Math.max(strokeWidth.value, 20 / props.scale));
    watch(
      () => props.isEditing,
      async (editing) => {
        var _a, _b;
        if (!editing) return;
        await nextTick();
        if (!editorRef.value) return;
        editingRef.value = true;
        const editor = editorRef.value;
        editor.focus();
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(obj.value);
        const isDefaultContent = ((_b = tool == null ? void 0 : tool.defaults) == null ? void 0 : _b.contents) != null && obj.value.contents === tool.defaults.contents;
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          if (!isDefaultContent) {
            range.collapse(false);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }
      },
      { immediate: true }
    );
    const handleBlur = () => {
      if (!editingRef.value) return;
      editingRef.value = false;
      if (!annotationProvides.value || !editorRef.value) return;
      annotationProvides.value.updateAnnotation(props.pageIndex, obj.value.id, {
        contents: editorRef.value.innerText.replace(/\u00A0/g, " ")
      });
    };
    const editorStyle = computed(() => {
      const { adjustedFontPx } = ios.value;
      const tbr = textBoxRelative.value;
      return {
        position: "absolute",
        left: `${tbr.left}px`,
        top: `${tbr.top}px`,
        width: `${tbr.width}px`,
        height: `${tbr.height}px`,
        color: obj.value.fontColor,
        fontSize: `${adjustedFontPx}px`,
        ...standardFontCssProperties(obj.value.fontFamily),
        textAlign: textAlignmentToCss(obj.value.textAlign),
        flexDirection: "column",
        justifyContent: obj.value.verticalAlign === PdfVerticalAlignment.Top ? "flex-start" : obj.value.verticalAlign === PdfVerticalAlignment.Middle ? "center" : "flex-end",
        display: "flex",
        padding: `${strokeWidth.value * props.scale / 2 + 2 * props.scale}px`,
        opacity: obj.value.opacity,
        lineHeight: "1.18",
        overflow: "hidden",
        cursor: props.isEditing ? "text" : "default",
        outline: "none",
        pointerEvents: props.isEditing ? "auto" : "none"
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle({
          position: "absolute",
          width: `${width.value}px`,
          height: `${height.value}px`,
          cursor: __props.isSelected && !__props.isEditing ? "move" : "default",
          pointerEvents: "none",
          zIndex: 2,
          opacity: __props.appearanceActive ? 0 : 1
        })
      }, [
        (openBlock(), createElementBlock("svg", {
          style: normalizeStyle({
            position: "absolute",
            width: `${width.value}px`,
            height: `${height.value}px`,
            pointerEvents: "none",
            overflow: "visible"
          }),
          width: width.value,
          height: height.value,
          viewBox: `0 0 ${obj.value.rect.size.width} ${obj.value.rect.size.height}`
        }, [
          lineCoords.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createElementVNode("polyline", {
              points: lineCoords.value.map((p) => `${p.x},${p.y}`).join(" "),
              fill: "none",
              stroke: "transparent",
              "stroke-width": hitStrokeWidth.value,
              onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
              (...args) => __props.onClick && __props.onClick(...args)),
              style: normalizeStyle({
                cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
                pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "visibleStroke"
              })
            }, null, 44, _hoisted_2$3),
            ending.value ? (openBlock(), createElementBlock("path", {
              key: 0,
              d: ending.value.d,
              transform: ending.value.transform,
              fill: "transparent",
              stroke: "transparent",
              "stroke-width": hitStrokeWidth.value,
              onPointerdown: _cache[1] || (_cache[1] = //@ts-ignore
              (...args) => __props.onClick && __props.onClick(...args)),
              style: normalizeStyle({
                cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
                pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : ending.value.filled ? "visible" : "visibleStroke"
              })
            }, null, 44, _hoisted_3$3)) : createCommentVNode("", true)
          ], 64)) : createCommentVNode("", true),
          !__props.appearanceActive ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            visualLineCoords.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createElementVNode("polyline", {
                points: visualLineCoords.value.map((p) => `${p.x},${p.y}`).join(" "),
                fill: "none",
                stroke: strokeColor.value,
                "stroke-width": strokeWidth.value,
                opacity: obj.value.opacity,
                style: { "pointer-events": "none" }
              }, null, 8, _hoisted_4$2),
              ending.value ? (openBlock(), createElementBlock("path", {
                key: 0,
                d: ending.value.d,
                transform: ending.value.transform,
                stroke: strokeColor.value,
                fill: ending.value.filled ? obj.value.color ?? "transparent" : "none",
                "stroke-width": strokeWidth.value,
                opacity: obj.value.opacity,
                style: { "pointer-events": "none" }
              }, null, 8, _hoisted_5$1)) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            createElementVNode("rect", {
              x: textBox.value.origin.x - obj.value.rect.origin.x + strokeWidth.value / 2,
              y: textBox.value.origin.y - obj.value.rect.origin.y + strokeWidth.value / 2,
              width: textBox.value.size.width - strokeWidth.value,
              height: textBox.value.size.height - strokeWidth.value,
              fill: obj.value.color ?? obj.value.backgroundColor ?? "transparent",
              stroke: strokeColor.value,
              "stroke-width": strokeWidth.value,
              opacity: obj.value.opacity,
              style: { "pointer-events": "none" }
            }, null, 8, _hoisted_6)
          ], 64)) : createCommentVNode("", true)
        ], 12, _hoisted_1$5)),
        createElementVNode("div", {
          onPointerdown: _cache[2] || (_cache[2] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            position: "absolute",
            left: `${(textBox.value.origin.x - obj.value.rect.origin.x) * __props.scale}px`,
            top: `${(textBox.value.origin.y - obj.value.rect.origin.y) * __props.scale}px`,
            width: `${textBox.value.size.width * __props.scale}px`,
            height: `${textBox.value.size.height * __props.scale}px`,
            cursor: __props.isSelected && !__props.isEditing ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected && !__props.isEditing ? "none" : "auto"
          })
        }, null, 36),
        createElementVNode("span", {
          ref_key: "editorRef",
          ref: editorRef,
          onBlur: handleBlur,
          tabindex: "0",
          style: normalizeStyle(editorStyle.value),
          contenteditable: __props.isEditing
        }, toDisplayString(obj.value.contents), 45, _hoisted_7)
      ], 4);
    };
  }
});
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "callout-free-text-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$p, {
        documentId: __props.documentId,
        isSelected: __props.isSelected,
        isEditing: __props.isEditing,
        annotation: { ...__props.annotation, object: __props.currentObject },
        pageIndex: __props.pageIndex,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }, null, 8, ["documentId", "isSelected", "isEditing", "annotation", "pageIndex", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _hoisted_1$4 = ["src"];
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "render-annotation",
  props: {
    documentId: {},
    pageIndex: {},
    annotation: {},
    scaleFactor: { default: 1 },
    unrotated: { type: Boolean, default: false },
    style: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: annotationProvides } = useAnnotationCapability();
    const imageUrl = ref(null);
    const urlRef = ref(null);
    const currentTask = ref(null);
    const annotationId = computed(() => props.annotation.id);
    const rectWidth = computed(() => props.annotation.rect.size.width);
    const rectHeight = computed(() => props.annotation.rect.size.height);
    watch(
      () => [
        props.pageIndex,
        props.scaleFactor,
        props.unrotated,
        props.documentId,
        annotationId.value,
        rectWidth.value,
        rectHeight.value,
        annotationProvides.value
      ],
      (_, __, onCleanup) => {
        if (annotationProvides.value) {
          if (urlRef.value) {
            URL.revokeObjectURL(urlRef.value);
            urlRef.value = null;
          }
          const task = annotationProvides.value.forDocument(props.documentId).renderAnnotation({
            pageIndex: props.pageIndex,
            annotation: deepToRaw(props.annotation),
            options: {
              scaleFactor: props.scaleFactor,
              dpr: window.devicePixelRatio,
              unrotated: props.unrotated
            }
          });
          currentTask.value = task;
          task.wait((blob) => {
            const url = URL.createObjectURL(blob);
            imageUrl.value = url;
            urlRef.value = url;
          }, ignore);
          onCleanup(() => {
            if (urlRef.value) {
              URL.revokeObjectURL(urlRef.value);
              urlRef.value = null;
            } else {
              task.abort({
                code: PdfErrorCode.Cancelled,
                message: "canceled render task"
              });
            }
          });
        }
      },
      { immediate: true }
    );
    onUnmounted(() => {
      if (urlRef.value) {
        URL.revokeObjectURL(urlRef.value);
        urlRef.value = null;
      }
      if (currentTask.value) {
        currentTask.value.abort({
          code: PdfErrorCode.Cancelled,
          message: "canceled render task on unmount"
        });
      }
    });
    const handleImageLoad = () => {
      if (urlRef.value) {
        URL.revokeObjectURL(urlRef.value);
        urlRef.value = null;
      }
    };
    return (_ctx, _cache) => {
      return imageUrl.value ? (openBlock(), createElementBlock("img", {
        key: 0,
        src: imageUrl.value,
        onLoad: handleImageLoad,
        style: normalizeStyle({
          width: "100%",
          height: "100%",
          display: "block",
          ...__props.style
        })
      }, null, 44, _hoisted_1$4)) : createCommentVNode("", true);
    };
  }
});
const __default__$6 = { inheritAttrs: false };
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  ...__default__$6,
  __name: "stamp",
  props: {
    isSelected: { type: Boolean },
    annotation: {},
    documentId: {},
    pageIndex: {},
    scale: {},
    onClick: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const unrotated = computed(
      () => !!props.annotation.object.rotation && !!props.annotation.object.unrotatedRect
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle({
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "auto",
          cursor: __props.onClick ? "pointer" : "default"
        }),
        onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
        (...args) => __props.onClick && __props.onClick(...args))
      }, [
        createVNode(_sfc_main$n, {
          documentId: __props.documentId,
          pageIndex: __props.pageIndex,
          annotation: { ...__props.annotation.object, id: __props.annotation.object.id },
          scaleFactor: __props.scale,
          unrotated: unrotated.value
        }, null, 8, ["documentId", "pageIndex", "annotation", "scaleFactor", "unrotated"])
      ], 36);
    };
  }
});
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "stamp-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$m, {
        isSelected: __props.isSelected,
        annotation: __props.annotation,
        documentId: __props.documentId,
        pageIndex: __props.pageIndex,
        scale: __props.scale,
        onClick: __props.onClick
      }, null, 8, ["isSelected", "annotation", "documentId", "pageIndex", "scale", "onClick"]);
    };
  }
});
const _hoisted_1$3 = ["width", "height", "viewBox"];
const _hoisted_2$2 = ["width", "height"];
const _hoisted_3$2 = ["y1", "x2", "y2", "stroke", "stroke-width", "stroke-dasharray"];
const _hoisted_4$1 = ["x", "y", "width", "height", "stroke", "stroke-width", "stroke-dasharray"];
const __default__$5 = { inheritAttrs: false };
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  ...__default__$5,
  __name: "link",
  props: {
    isSelected: { type: Boolean },
    strokeColor: { default: "#0000FF" },
    strokeWidth: { default: 2 },
    strokeStyle: { default: PdfAnnotationBorderStyle.UNDERLINE },
    strokeDashArray: {},
    rect: {},
    scale: {},
    onClick: {},
    hasIRT: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const width = computed(() => props.rect.size.width);
    const height = computed(() => props.rect.size.height);
    const svgWidth = computed(() => width.value * props.scale);
    const svgHeight = computed(() => height.value * props.scale);
    const dashArray = computed(() => {
      var _a;
      if (props.strokeStyle === PdfAnnotationBorderStyle.DASHED) {
        return ((_a = props.strokeDashArray) == null ? void 0 : _a.join(",")) ?? `${props.strokeWidth * 3},${props.strokeWidth}`;
      }
      return void 0;
    });
    const isUnderline = computed(() => props.strokeStyle === PdfAnnotationBorderStyle.UNDERLINE);
    const hitAreaCursor = computed(
      () => props.hasIRT || !props.onClick ? "default" : props.isSelected ? "move" : "pointer"
    );
    const hitAreaPointerEvents = computed(
      () => props.hasIRT || !props.onClick ? "none" : props.isSelected ? "none" : "visible"
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: `${svgWidth.value}px`,
          height: `${svgHeight.value}px`,
          pointerEvents: "none",
          zIndex: 2
        }),
        width: svgWidth.value,
        height: svgHeight.value,
        viewBox: `0 0 ${width.value} ${height.value}`
      }, [
        createElementVNode("rect", {
          x: 0,
          y: 0,
          width: width.value,
          height: height.value,
          fill: "transparent",
          onPointerdown: _cache[0] || (_cache[0] = ($event) => {
            var _a;
            return __props.hasIRT ? void 0 : (_a = __props.onClick) == null ? void 0 : _a.call(__props, $event);
          }),
          style: normalizeStyle({
            cursor: hitAreaCursor.value,
            pointerEvents: hitAreaPointerEvents.value
          })
        }, null, 44, _hoisted_2$2),
        isUnderline.value ? (openBlock(), createElementBlock("line", {
          key: 0,
          x1: 1,
          y1: height.value - 1,
          x2: width.value - 1,
          y2: height.value - 1,
          stroke: __props.strokeColor,
          "stroke-width": __props.strokeWidth,
          "stroke-dasharray": dashArray.value,
          style: { "pointer-events": "none" }
        }, null, 8, _hoisted_3$2)) : (openBlock(), createElementBlock("rect", {
          key: 1,
          x: __props.strokeWidth / 2,
          y: __props.strokeWidth / 2,
          width: Math.max(width.value - __props.strokeWidth, 0),
          height: Math.max(height.value - __props.strokeWidth, 0),
          fill: "transparent",
          stroke: __props.strokeColor,
          "stroke-width": __props.strokeWidth,
          "stroke-dasharray": dashArray.value,
          style: { "pointer-events": "none" }
        }, null, 8, _hoisted_4$1))
      ], 12, _hoisted_1$3);
    };
  }
});
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "link-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$k, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        hasIRT: !!__props.currentObject.inReplyToId
      }), null, 16, ["isSelected", "scale", "onClick", "hasIRT"]);
    };
  }
});
const __default__$4 = { inheritAttrs: false };
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  ...__default__$4,
  __name: "highlight",
  props: {
    strokeColor: {},
    opacity: { default: 0.5 },
    segmentRects: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const resolvedColor = computed(() => props.strokeColor ?? "#FFFF00");
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.segmentRects, (b, i) => {
        return openBlock(), createElementBlock("div", {
          key: i,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            position: "absolute",
            left: `${(__props.rect ? b.origin.x - __props.rect.origin.x : b.origin.x) * __props.scale}px`,
            top: `${(__props.rect ? b.origin.y - __props.rect.origin.y : b.origin.y) * __props.scale}px`,
            width: `${b.size.width * __props.scale}px`,
            height: `${b.size.height * __props.scale}px`,
            background: __props.appearanceActive ? "transparent" : resolvedColor.value,
            opacity: __props.appearanceActive ? void 0 : __props.opacity,
            pointerEvents: __props.onClick ? "auto" : "none",
            cursor: __props.onClick ? "pointer" : "default",
            zIndex: __props.onClick ? 1 : void 0
          })
        }, null, 36);
      }), 128);
    };
  }
});
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "highlight-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$i, mergeProps(__props.currentObject, {
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["scale", "onClick", "appearanceActive"]);
    };
  }
});
const __default__$3 = { inheritAttrs: false };
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  ...__default__$3,
  __name: "underline",
  props: {
    strokeColor: {},
    opacity: { default: 0.5 },
    segmentRects: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const resolvedColor = computed(() => props.strokeColor ?? "#FFFF00");
    const thickness = computed(() => 2 * props.scale);
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.segmentRects, (r, i) => {
        return openBlock(), createElementBlock("div", {
          key: i,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            position: "absolute",
            left: `${(__props.rect ? r.origin.x - __props.rect.origin.x : r.origin.x) * __props.scale}px`,
            top: `${(__props.rect ? r.origin.y - __props.rect.origin.y : r.origin.y) * __props.scale}px`,
            width: `${r.size.width * __props.scale}px`,
            height: `${r.size.height * __props.scale}px`,
            background: "transparent",
            pointerEvents: __props.onClick ? "auto" : "none",
            cursor: __props.onClick ? "pointer" : "default",
            zIndex: __props.onClick ? 1 : 0
          })
        }, [
          !__props.appearanceActive ? (openBlock(), createElementBlock("div", {
            key: 0,
            style: normalizeStyle({
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: `${thickness.value}px`,
              background: resolvedColor.value,
              opacity: __props.opacity,
              pointerEvents: "none"
            })
          }, null, 4)) : createCommentVNode("", true)
        ], 36);
      }), 128);
    };
  }
});
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "underline-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$g, mergeProps(__props.currentObject, {
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["scale", "onClick", "appearanceActive"]);
    };
  }
});
const __default__$2 = { inheritAttrs: false };
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  ...__default__$2,
  __name: "strikeout",
  props: {
    strokeColor: {},
    opacity: { default: 0.5 },
    segmentRects: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const resolvedColor = computed(() => props.strokeColor ?? "#FFFF00");
    const thickness = computed(() => 2 * props.scale);
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.segmentRects, (r, i) => {
        return openBlock(), createElementBlock("div", {
          key: i,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            position: "absolute",
            left: `${(__props.rect ? r.origin.x - __props.rect.origin.x : r.origin.x) * __props.scale}px`,
            top: `${(__props.rect ? r.origin.y - __props.rect.origin.y : r.origin.y) * __props.scale}px`,
            width: `${r.size.width * __props.scale}px`,
            height: `${r.size.height * __props.scale}px`,
            background: "transparent",
            pointerEvents: __props.onClick ? "auto" : "none",
            cursor: __props.onClick ? "pointer" : "default",
            zIndex: __props.onClick ? 1 : 0
          })
        }, [
          !__props.appearanceActive ? (openBlock(), createElementBlock("div", {
            key: 0,
            style: normalizeStyle({
              position: "absolute",
              left: 0,
              top: "50%",
              width: "100%",
              height: `${thickness.value}px`,
              background: resolvedColor.value,
              opacity: __props.opacity,
              transform: "translateY(-50%)",
              pointerEvents: "none"
            })
          }, null, 4)) : createCommentVNode("", true)
        ], 36);
      }), 128);
    };
  }
});
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "strikeout-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$e, mergeProps(__props.currentObject, {
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["scale", "onClick", "appearanceActive"]);
    };
  }
});
const __default__$1 = { inheritAttrs: false };
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  ...__default__$1,
  __name: "squiggly",
  props: {
    strokeColor: {},
    opacity: { default: 0.5 },
    segmentRects: {},
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const resolvedColor = computed(() => props.strokeColor ?? "#FFFF00");
    const amplitude = computed(() => 2 * props.scale);
    const period = computed(() => 6 * props.scale);
    const svgDataUri = computed(() => {
      const amp = amplitude.value;
      const per = period.value;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${per}" height="${amp * 2}" viewBox="0 0 ${per} ${amp * 2}">
    <path d="M0 ${amp} Q ${per / 4} 0 ${per / 2} ${amp} T ${per} ${amp}"
          fill="none" stroke="${resolvedColor.value}" stroke-width="${amp}" stroke-linecap="round"/>
  </svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    });
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.segmentRects, (r, i) => {
        return openBlock(), createElementBlock("div", {
          key: i,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            position: "absolute",
            left: `${(__props.rect ? r.origin.x - __props.rect.origin.x : r.origin.x) * __props.scale}px`,
            top: `${(__props.rect ? r.origin.y - __props.rect.origin.y : r.origin.y) * __props.scale}px`,
            width: `${r.size.width * __props.scale}px`,
            height: `${r.size.height * __props.scale}px`,
            background: "transparent",
            pointerEvents: __props.onClick ? "auto" : "none",
            cursor: __props.onClick ? "pointer" : "default",
            zIndex: __props.onClick ? 1 : 0
          })
        }, [
          !__props.appearanceActive ? (openBlock(), createElementBlock("div", {
            key: 0,
            style: normalizeStyle({
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: `${amplitude.value * 2}px`,
              backgroundImage: svgDataUri.value,
              backgroundRepeat: "repeat-x",
              backgroundSize: `${period.value}px ${amplitude.value * 2}px`,
              opacity: __props.opacity,
              pointerEvents: "none"
            })
          }, null, 4)) : createCommentVNode("", true)
        ], 36);
      }), 128);
    };
  }
});
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "squiggly-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$c, mergeProps(__props.currentObject, {
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["scale", "onClick", "appearanceActive"]);
    };
  }
});
const _hoisted_1$2 = ["width", "height", "viewBox"];
const _hoisted_2$1 = ["d"];
const _hoisted_3$1 = ["d", "fill", "stroke", "opacity"];
const __default__ = { inheritAttrs: false };
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  ...__default__,
  __name: "caret",
  props: {
    isSelected: { type: Boolean },
    strokeColor: { default: "#000000" },
    opacity: { default: 1 },
    rect: {},
    scale: {},
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const width = computed(() => props.rect.size.width);
    const height = computed(() => props.rect.size.height);
    const path = computed(() => {
      const w = width.value;
      const h = height.value;
      const midX = w / 2;
      return [
        `M 0 ${h}`,
        `C ${w * 0.27} ${h} ${midX} ${h - h * 0.44} ${midX} 0`,
        `C ${midX} ${h - h * 0.44} ${w - w * 0.27} ${h} ${w} ${h}`,
        "Z"
      ].join(" ");
    });
    const svgWidth = computed(() => width.value * props.scale);
    const svgHeight = computed(() => height.value * props.scale);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("svg", {
        style: normalizeStyle({
          position: "absolute",
          width: svgWidth.value,
          height: svgHeight.value,
          pointerEvents: "none",
          zIndex: 2
        }),
        width: svgWidth.value,
        height: svgHeight.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        overflow: "visible"
      }, [
        createElementVNode("path", {
          d: path.value,
          fill: "transparent",
          stroke: "transparent",
          "stroke-width": 4,
          onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => __props.onClick && __props.onClick(...args)),
          style: normalizeStyle({
            cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default",
            pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "visible"
          })
        }, null, 44, _hoisted_2$1),
        !__props.appearanceActive ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: path.value,
          fill: __props.strokeColor,
          stroke: __props.strokeColor,
          "stroke-width": 0.5,
          opacity: __props.opacity,
          "fill-rule": "evenodd",
          style: { pointerEvents: "none" }
        }, null, 8, _hoisted_3$1)) : createCommentVNode("", true)
      ], 12, _hoisted_1$2);
    };
  }
});
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "caret-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$a, mergeProps(__props.currentObject, {
        isSelected: __props.isSelected,
        scale: __props.scale,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }), null, 16, ["isSelected", "scale", "onClick", "appearanceActive"]);
    };
  }
});
const _hoisted_1$1 = {
  key: 0,
  style: { position: "absolute", inset: 0, pointerEvents: "none" },
  viewBox: "0 0 20 20",
  width: "100%",
  height: "100%"
};
const _hoisted_2 = ["fill", "opacity", "stroke"];
const _hoisted_3 = ["stroke"];
const _hoisted_4 = ["stroke"];
const _hoisted_5 = ["stroke"];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "text",
  props: {
    isSelected: { type: Boolean },
    color: { default: "#facc15" },
    opacity: { default: 1 },
    onClick: {},
    appearanceActive: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const lineColor = computed(() => getContrastStrokeColor(props.color));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle({
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: !__props.onClick ? "none" : __props.isSelected ? "none" : "auto",
          cursor: __props.isSelected ? "move" : __props.onClick ? "pointer" : "default"
        }),
        onPointerdown: _cache[0] || (_cache[0] = //@ts-ignore
        (...args) => __props.onClick && __props.onClick(...args))
      }, [
        !__props.appearanceActive ? (openBlock(), createElementBlock("svg", _hoisted_1$1, [
          createElementVNode("path", {
            d: "M 0.5 15.5 L 0.5 0.5 L 19.5 0.5 L 19.5 15.5 L 8.5 15.5 L 6.5 19.5 L 4.5 15.5 Z",
            fill: __props.color,
            opacity: __props.opacity,
            stroke: lineColor.value,
            "stroke-width": "1",
            "stroke-linejoin": "miter"
          }, null, 8, _hoisted_2),
          createElementVNode("line", {
            x1: "2.5",
            y1: "4.25",
            x2: "17.5",
            y2: "4.25",
            stroke: lineColor.value,
            "stroke-width": "1"
          }, null, 8, _hoisted_3),
          createElementVNode("line", {
            x1: "2.5",
            y1: "8",
            x2: "17.5",
            y2: "8",
            stroke: lineColor.value,
            "stroke-width": "1"
          }, null, 8, _hoisted_4),
          createElementVNode("line", {
            x1: "2.5",
            y1: "11.75",
            x2: "17.5",
            y2: "11.75",
            stroke: lineColor.value,
            "stroke-width": "1"
          }, null, 8, _hoisted_5)
        ])) : createCommentVNode("", true)
      ], 36);
    };
  }
});
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "text-renderer",
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$8, {
        isSelected: __props.isSelected,
        color: __props.currentObject.strokeColor ?? __props.currentObject.color,
        opacity: __props.currentObject.opacity,
        onClick: __props.onClick,
        appearanceActive: __props.appearanceActive
      }, null, 8, ["isSelected", "color", "opacity", "onClick", "appearanceActive"]);
    };
  }
});
const builtInRenderers = [
  createRenderer({
    id: "ink",
    matches: (a) => a.type === PdfAnnotationSubtype.INK,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.INK,
    component: _sfc_main$x,
    renderPreview: _sfc_main$L,
    previewContainerStyle: ({ data }) => ({
      mixBlendMode: blendModeToCss(data.blendMode ?? PdfBlendMode.Normal)
    }),
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  createRenderer({
    id: "square",
    matches: (a) => a.type === PdfAnnotationSubtype.SQUARE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.SQUARE,
    component: _sfc_main$w,
    renderPreview: _sfc_main$J,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  createRenderer({
    id: "circle",
    matches: (a) => a.type === PdfAnnotationSubtype.CIRCLE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.CIRCLE,
    component: _sfc_main$v,
    renderPreview: _sfc_main$H,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  createRenderer({
    id: "line",
    matches: (a) => a.type === PdfAnnotationSubtype.LINE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.LINE,
    component: _sfc_main$u,
    renderPreview: _sfc_main$F,
    vertexConfig: {
      extractVertices: (a) => [a.linePoints.start, a.linePoints.end],
      transformAnnotation: (a, v) => ({
        ...a,
        linePoints: { start: v[0], end: v[1] }
      })
    },
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: true }
  }),
  createRenderer({
    id: "polyline",
    matches: (a) => a.type === PdfAnnotationSubtype.POLYLINE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.POLYLINE,
    component: _sfc_main$t,
    renderPreview: _sfc_main$D,
    vertexConfig: {
      extractVertices: (a) => a.vertices,
      transformAnnotation: (a, vertices) => ({ ...a, vertices })
    },
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: true }
  }),
  createRenderer({
    id: "polygon",
    matches: (a) => a.type === PdfAnnotationSubtype.POLYGON,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.POLYGON,
    component: _sfc_main$s,
    renderPreview: _sfc_main$B,
    vertexConfig: {
      extractVertices: (a) => a.vertices,
      transformAnnotation: (a, vertices) => ({ ...a, vertices })
    },
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: true }
  }),
  createRenderer({
    id: "highlight",
    matches: (a) => a.type === PdfAnnotationSubtype.HIGHLIGHT,
    component: _sfc_main$h,
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    defaultBlendMode: PdfBlendMode.Multiply
  }),
  createRenderer({
    id: "underline",
    matches: (a) => a.type === PdfAnnotationSubtype.UNDERLINE,
    component: _sfc_main$f,
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "strikeout",
    matches: (a) => a.type === PdfAnnotationSubtype.STRIKEOUT,
    component: _sfc_main$d,
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "squiggly",
    matches: (a) => a.type === PdfAnnotationSubtype.SQUIGGLY,
    component: _sfc_main$b,
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "text",
    matches: (a) => a.type === PdfAnnotationSubtype.TEXT && !a.inReplyToId,
    component: _sfc_main$7,
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "caret",
    matches: (a) => a.type === PdfAnnotationSubtype.CARET,
    component: _sfc_main$9,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "freeTextCallout",
    matches: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent === "FreeTextCallout",
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.FREETEXT && !!p.data.calloutLine,
    component: _sfc_main$o,
    renderPreview: _sfc_main$z,
    vertexConfig: patching.calloutVertexConfig,
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: false },
    isDraggable: (toolDraggable, { isEditing }) => toolDraggable && !isEditing,
    onDoubleClick: (id, setEditingId) => setEditingId(id)
  }),
  createRenderer({
    id: "freeText",
    matches: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent !== "FreeTextCallout",
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.FREETEXT && !p.data.calloutLine,
    component: _sfc_main$q,
    renderPreview: _sfc_main$A,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true },
    isDraggable: (toolDraggable, { isEditing }) => toolDraggable && !isEditing,
    onDoubleClick: (id, setEditingId) => setEditingId(id)
  }),
  createRenderer({
    id: "stamp",
    matches: (a) => a.type === PdfAnnotationSubtype.STAMP,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.STAMP,
    component: _sfc_main$l,
    renderPreview: _sfc_main$y,
    useAppearanceStream: false,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  createRenderer({
    id: "link",
    matches: (a) => a.type === PdfAnnotationSubtype.LINK,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.LINK,
    component: _sfc_main$j,
    renderPreview: _sfc_main$N,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: false },
    useAppearanceStream: false,
    selectOverride: (e, annotation, helpers) => {
      e.stopPropagation();
      helpers.clearSelection();
      if (annotation.object.inReplyToId) {
        const parent = helpers.allAnnotations.find(
          (a) => a.object.id === annotation.object.inReplyToId
        );
        if (parent) {
          helpers.selectAnnotation(parent.object.pageIndex, parent.object.id);
          return;
        }
      }
      helpers.selectAnnotation(helpers.pageIndex, annotation.object.id);
    },
    hideSelectionMenu: (a) => !!a.inReplyToId,
    renderLocked: _sfc_main$O
  })
];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "annotations",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: {},
    pageWidth: {},
    pageHeight: {},
    resizeUi: {},
    vertexUi: {},
    rotationUi: {},
    selectionOutlineColor: {},
    selectionOutline: {},
    groupSelectionOutline: {},
    selectionMenu: { type: Function },
    groupSelectionMenu: { type: Function },
    annotationRenderers: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: annotationCapability } = useAnnotationCapability();
    const { provides: selectionProvides } = useSelectionCapability();
    const annotations = shallowRef([]);
    const allSelectedIds = shallowRef([]);
    const { register } = usePointerHandlers({
      documentId: () => props.documentId,
      pageIndex: props.pageIndex
    });
    const editingId = ref(null);
    const appearanceMap = shallowRef({});
    const lockedMode = shallowRef({ type: LockModeType.None });
    let prevScale = props.scale;
    const annotationProvides = computed(
      () => annotationCapability.value ? annotationCapability.value.forDocument(props.documentId) : null
    );
    const isMultiSelected = computed(() => allSelectedIds.value.length > 1);
    const allRenderers = computed(() => {
      const external = props.annotationRenderers ?? [];
      const externalIds = new Set(external.map((r) => r.id));
      return [...external, ...builtInRenderers.filter((r) => !externalIds.has(r.id))];
    });
    const resolveRenderer = (annotation) => {
      return allRenderers.value.find((r) => r.matches(annotation.object)) ?? null;
    };
    const getAppearanceForAnnotation = (ta) => {
      if (ta.dictMode) return null;
      if (ta.object.rotation && ta.object.unrotatedRect) return null;
      const appearances = appearanceMap.value[ta.object.id];
      if (!(appearances == null ? void 0 : appearances.normal)) return null;
      return appearances;
    };
    watch(
      [annotationProvides, () => props.pageIndex],
      ([provides, pageIndex], _prev, onCleanup) => {
        if (!provides) {
          annotations.value = [];
          allSelectedIds.value = [];
          return;
        }
        const syncState = (state) => {
          annotations.value = getAnnotationsByPageIndex(state, pageIndex);
          allSelectedIds.value = getSelectedAnnotationIds(state);
          lockedMode.value = state.locked;
        };
        syncState(provides.getState());
        const off = provides.onStateChange(syncState);
        onCleanup(off);
        const offEvent = provides.onAnnotationEvent((event) => {
          if (event.type === "create" && event.editAfterCreate) {
            editingId.value = event.annotation.id;
          }
        });
        onCleanup(offEvent);
      },
      { immediate: true }
    );
    watch(
      [annotationProvides, () => props.pageIndex, () => props.scale],
      ([provides, pageIndex, scale], _prev, onCleanup) => {
        if (!provides) {
          appearanceMap.value = {};
          return;
        }
        if (prevScale !== scale) {
          provides.invalidatePageAppearances(pageIndex);
          prevScale = scale;
        }
        let cancelled = false;
        onCleanup(() => {
          cancelled = true;
        });
        const task = provides.getPageAppearances(pageIndex, {
          scaleFactor: scale,
          dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1
        });
        task.wait(
          (map) => {
            if (!cancelled) appearanceMap.value = map;
          },
          () => {
            if (!cancelled) appearanceMap.value = {};
          }
        );
      },
      { immediate: true }
    );
    const resolvedAnnotations = computed(() => {
      void lockedMode.value;
      return annotations.value.map((annotation) => {
        var _a;
        const renderer = resolveRenderer(annotation);
        if (!renderer) return null;
        if (hasNoViewFlag(annotation.object)) return null;
        if (hasHiddenFlag(annotation.object)) return null;
        const tool = ((_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object)) ?? null;
        const nonInteractive = annotationProvides.value ? !annotationProvides.value.isAnnotationInteractive(annotation.object) : false;
        const structurallyLocked = annotationProvides.value ? annotationProvides.value.isAnnotationStructurallyLocked(annotation.object) : false;
        const contentLocked = annotationProvides.value ? annotationProvides.value.isAnnotationContentLocked(annotation.object) : false;
        if (nonInteractive && renderer.hiddenWhenLocked) return null;
        return { annotation, renderer, tool, nonInteractive, structurallyLocked, contentLocked };
      }).filter((v) => v !== null);
    });
    const getFinalDraggable = (annotation, renderer, structurallyLocked) => {
      var _a;
      if (structurallyLocked) return false;
      const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object);
      const defaults = renderer.interactionDefaults;
      const isEditing = editingId.value === annotation.object.id;
      const resolvedDraggable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isDraggable,
        annotation.object,
        (defaults == null ? void 0 : defaults.isDraggable) ?? true
      );
      return renderer.isDraggable ? renderer.isDraggable(resolvedDraggable, { isEditing }) : resolvedDraggable;
    };
    const getResolvedResizable = (annotation, renderer, structurallyLocked) => {
      var _a, _b;
      if (structurallyLocked) return false;
      const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object);
      return resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isResizable,
        annotation.object,
        ((_b = renderer.interactionDefaults) == null ? void 0 : _b.isResizable) ?? false
      );
    };
    const getResolvedLockAspectRatio = (annotation, renderer) => {
      var _a, _b;
      const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object);
      return resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.lockAspectRatio,
        annotation.object,
        ((_b = renderer.interactionDefaults) == null ? void 0 : _b.lockAspectRatio) ?? false
      );
    };
    const getResolvedRotatable = (annotation, renderer, structurallyLocked) => {
      var _a, _b;
      if (structurallyLocked) return false;
      const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object);
      return resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isRotatable,
        annotation.object,
        ((_b = renderer.interactionDefaults) == null ? void 0 : _b.isRotatable) ?? false
      );
    };
    const getSelectionMenu = (annotation, renderer, nonInteractive) => {
      var _a;
      if (nonInteractive) return void 0;
      if ((_a = renderer.hideSelectionMenu) == null ? void 0 : _a.call(renderer, annotation.object)) return void 0;
      if (isMultiSelected.value) return void 0;
      return props.selectionMenu;
    };
    const noopSelect = (e) => {
      e.stopPropagation();
    };
    const getOnSelect = (annotation, renderer, nonInteractive) => {
      if (nonInteractive) return noopSelect;
      if (renderer.selectOverride) {
        const selectHelpers = {
          defaultSelect: handleClick,
          selectAnnotation: (pi, id) => {
            var _a;
            return (_a = annotationProvides.value) == null ? void 0 : _a.selectAnnotation(pi, id);
          },
          clearSelection: () => {
            var _a;
            return (_a = selectionProvides.value) == null ? void 0 : _a.clear();
          },
          allAnnotations: annotations.value,
          pageIndex: props.pageIndex
        };
        return (e) => renderer.selectOverride(e, annotation, selectHelpers);
      }
      return (e) => handleClick(e, annotation);
    };
    const handlePointerDown = (_pos, pe) => {
      if (pe.target === pe.currentTarget && annotationProvides.value) {
        if (editingId.value && annotations.value.some((a) => a.object.id === editingId.value)) {
          pe.stopImmediatePropagation();
        }
        annotationProvides.value.deselectAnnotation();
        editingId.value = null;
      }
    };
    const handleClick = (e, annotation) => {
      e.stopPropagation();
      if (annotationProvides.value && selectionProvides.value) {
        selectionProvides.value.clear();
        const isModifierPressed = "metaKey" in e ? e.metaKey || e.ctrlKey : false;
        if (isModifierPressed) {
          annotationProvides.value.toggleSelection(props.pageIndex, annotation.object.id);
        } else {
          annotationProvides.value.selectAnnotation(props.pageIndex, annotation.object.id);
        }
        if (annotation.object.id !== editingId.value) {
          editingId.value = null;
        }
      }
    };
    const setEditingId = (id) => {
      editingId.value = id;
    };
    const pointerHandlers = { onPointerDown: handlePointerDown };
    watch(
      annotationProvides,
      (provides, _prev, onCleanup) => {
        if (!provides) return;
        const unregister = register(pointerHandlers);
        if (unregister) {
          onCleanup(unregister);
        }
      },
      { immediate: true }
    );
    const selectedAnnotationsOnPage = computed(
      () => annotations.value.filter((anno) => allSelectedIds.value.includes(anno.object.id))
    );
    const areAllSelectedDraggable = computed(() => {
      if (selectedAnnotationsOnPage.value.length < 2) return false;
      return selectedAnnotationsOnPage.value.every((ta) => {
        var _a;
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(ta.object);
        const groupDraggable = resolveInteractionProp(
          tool == null ? void 0 : tool.interaction.isGroupDraggable,
          ta.object,
          true
        );
        const singleDraggable = resolveInteractionProp(tool == null ? void 0 : tool.interaction.isDraggable, ta.object, true);
        return (tool == null ? void 0 : tool.interaction.isGroupDraggable) !== void 0 ? groupDraggable : singleDraggable;
      });
    });
    const areAllSelectedResizable = computed(() => {
      if (selectedAnnotationsOnPage.value.length < 2) return false;
      return selectedAnnotationsOnPage.value.every((ta) => {
        var _a;
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(ta.object);
        const groupResizable = resolveInteractionProp(
          tool == null ? void 0 : tool.interaction.isGroupResizable,
          ta.object,
          true
        );
        const singleResizable = resolveInteractionProp(tool == null ? void 0 : tool.interaction.isResizable, ta.object, true);
        return (tool == null ? void 0 : tool.interaction.isGroupResizable) !== void 0 ? groupResizable : singleResizable;
      });
    });
    const areAllSelectedRotatable = computed(() => {
      if (selectedAnnotationsOnPage.value.length < 2) return false;
      return selectedAnnotationsOnPage.value.every((ta) => {
        var _a;
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(ta.object);
        const groupRotatable = resolveInteractionProp(
          tool == null ? void 0 : tool.interaction.isGroupRotatable,
          ta.object,
          true
        );
        const singleRotatable = resolveInteractionProp(tool == null ? void 0 : tool.interaction.isRotatable, ta.object, true);
        return (tool == null ? void 0 : tool.interaction.isGroupRotatable) !== void 0 ? groupRotatable : singleRotatable;
      });
    });
    const shouldLockGroupAspectRatio = computed(() => {
      if (selectedAnnotationsOnPage.value.length < 2) return false;
      return selectedAnnotationsOnPage.value.some((ta) => {
        var _a;
        const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(ta.object);
        const groupLock = resolveInteractionProp(
          tool == null ? void 0 : tool.interaction.lockGroupAspectRatio,
          ta.object,
          false
        );
        const singleLock = resolveInteractionProp(tool == null ? void 0 : tool.interaction.lockAspectRatio, ta.object, false);
        return (tool == null ? void 0 : tool.interaction.lockGroupAspectRatio) !== void 0 ? groupLock : singleLock;
      });
    });
    const allSelectedOnSamePage = computed(() => {
      if (!annotationProvides.value) return false;
      if (allSelectedIds.value.length < 2) return false;
      const allSelected = annotationProvides.value.getSelectedAnnotations();
      return allSelected.every((ta) => ta.object.pageIndex === props.pageIndex);
    });
    const getOnDoubleClick = (renderer, annotation, nonInteractive, contentLocked) => {
      if (nonInteractive || contentLocked) return void 0;
      if (!renderer.onDoubleClick) return void 0;
      return (e) => {
        e.stopPropagation();
        renderer.onDoubleClick(annotation.object.id, setEditingId);
      };
    };
    const getBlendMode = (annotation, renderer) => {
      return blendModeToCss(
        annotation.object.blendMode ?? renderer.defaultBlendMode ?? PdfBlendMode.Normal
      );
    };
    const getAppearance = (annotation, renderer, nonInteractive) => {
      var _a, _b;
      if (nonInteractive && renderer.renderLocked) return void 0;
      const tool = (_a = annotationProvides.value) == null ? void 0 : _a.findToolForAnnotation(annotation.object);
      const useAP = ((_b = tool == null ? void 0 : tool.behavior) == null ? void 0 : _b.useAppearanceStream) ?? renderer.useAppearanceStream ?? true;
      return useAP ? getAppearanceForAnnotation(annotation) : void 0;
    };
    const containerProps = computed(() => {
      const {
        selectionMenu: _sm,
        groupSelectionMenu: _gsm,
        groupSelectionOutline: _gso,
        annotationRenderers: _ar,
        ...rest
      } = props;
      return rest;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(resolvedAnnotations.value, ({
          annotation,
          renderer,
          nonInteractive,
          structurallyLocked,
          contentLocked
        }) => {
          var _a;
          return openBlock(), createBlock(_sfc_main$Q, mergeProps({
            key: annotation.object.id,
            trackedAnnotation: annotation,
            isSelected: nonInteractive ? false : allSelectedIds.value.includes(annotation.object.id),
            isEditing: nonInteractive ? false : editingId.value === annotation.object.id,
            isMultiSelected: nonInteractive ? false : isMultiSelected.value,
            isDraggable: getFinalDraggable(annotation, renderer, structurallyLocked),
            isResizable: getResolvedResizable(annotation, renderer, structurallyLocked),
            lockAspectRatio: getResolvedLockAspectRatio(annotation, renderer),
            isRotatable: getResolvedRotatable(annotation, renderer, structurallyLocked),
            vertexConfig: structurallyLocked ? void 0 : renderer.vertexConfig,
            selectionMenu: getSelectionMenu(annotation, renderer, nonInteractive),
            structurallyLocked,
            contentLocked,
            onSelect: getOnSelect(annotation, renderer, nonInteractive),
            onDoubleClick: getOnDoubleClick(renderer, annotation, nonInteractive, contentLocked),
            zIndex: renderer.zIndex,
            blendMode: getBlendMode(annotation, renderer),
            style: (_a = renderer.containerStyle) == null ? void 0 : _a.call(renderer, annotation.object),
            appearance: getAppearance(annotation, renderer, nonInteractive)
          }, { ref_for: true }, containerProps.value), createSlots({
            default: withCtx(({ annotation: currentObject, appearanceActive }) => [
              (openBlock(), createBlock(resolveDynamicComponent(nonInteractive && renderer.renderLocked ? renderer.renderLocked : renderer.component), {
                annotation,
                currentObject,
                isSelected: nonInteractive ? false : allSelectedIds.value.includes(annotation.object.id),
                isEditing: nonInteractive ? false : editingId.value === annotation.object.id,
                scale: __props.scale,
                pageIndex: __props.pageIndex,
                documentId: __props.documentId,
                onClick: nonInteractive ? void 0 : getOnSelect(annotation, renderer, nonInteractive),
                appearanceActive
              }, null, 8, ["annotation", "currentObject", "isSelected", "isEditing", "scale", "pageIndex", "documentId", "onClick", "appearanceActive"]))
            ]),
            "resize-handle": withCtx((slotProps) => [
              renderSlot(_ctx.$slots, "resize-handle", mergeProps({ ref_for: true }, slotProps))
            ]),
            "vertex-handle": withCtx((slotProps) => [
              renderSlot(_ctx.$slots, "vertex-handle", mergeProps({ ref_for: true }, slotProps))
            ]),
            "rotation-handle": withCtx((slotProps) => [
              renderSlot(_ctx.$slots, "rotation-handle", mergeProps({ ref_for: true }, slotProps))
            ]),
            _: 2
          }, [
            !isMultiSelected.value ? {
              name: "selection-menu",
              fn: withCtx((slotProps) => [
                renderSlot(_ctx.$slots, "selection-menu", mergeProps({ ref_for: true }, slotProps))
              ]),
              key: "0"
            } : void 0
          ]), 1040, ["trackedAnnotation", "isSelected", "isEditing", "isMultiSelected", "isDraggable", "isResizable", "lockAspectRatio", "isRotatable", "vertexConfig", "selectionMenu", "structurallyLocked", "contentLocked", "onSelect", "onDoubleClick", "zIndex", "blendMode", "style", "appearance"]);
        }), 128)),
        allSelectedOnSamePage.value && selectedAnnotationsOnPage.value.length >= 2 ? (openBlock(), createBlock(_sfc_main$P, {
          key: 0,
          documentId: __props.documentId,
          pageIndex: __props.pageIndex,
          scale: __props.scale,
          rotation: __props.rotation,
          pageWidth: __props.pageWidth,
          pageHeight: __props.pageHeight,
          selectedAnnotations: selectedAnnotationsOnPage.value,
          isDraggable: areAllSelectedDraggable.value,
          isResizable: areAllSelectedResizable.value,
          isRotatable: areAllSelectedRotatable.value,
          lockAspectRatio: shouldLockGroupAspectRatio.value,
          resizeUi: __props.resizeUi,
          rotationUi: __props.rotationUi,
          selectionOutlineColor: __props.selectionOutlineColor,
          selectionOutline: __props.groupSelectionOutline ?? __props.selectionOutline,
          groupSelectionMenu: __props.groupSelectionMenu
        }, {
          "selection-menu": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "group-selection-menu", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "resize-handle": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "resize-handle", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "rotation-handle": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "rotation-handle", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          _: 3
        }, 8, ["documentId", "pageIndex", "scale", "rotation", "pageWidth", "pageHeight", "selectedAnnotations", "isDraggable", "isResizable", "isRotatable", "lockAspectRatio", "resizeUi", "rotationUi", "selectionOutlineColor", "selectionOutline", "groupSelectionMenu"])) : createCommentVNode("", true)
      ], 64);
    };
  }
});
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "text-markup",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const { provides: selectionProvides } = useSelectionCapability();
    const { provides: annotationProvides } = useAnnotationCapability();
    const rects = ref([]);
    const boundingRect = ref(null);
    const activeTool = ref(null);
    watchEffect((onCleanup) => {
      const unsubscribers = [];
      if (selectionProvides.value) {
        const scoped = selectionProvides.value.forDocument(props.documentId);
        const off = scoped.onSelectionChange(() => {
          rects.value = scoped.getHighlightRectsForPage(props.pageIndex);
          boundingRect.value = scoped.getBoundingRectForPage(props.pageIndex);
        });
        unsubscribers.push(off);
      }
      if (annotationProvides.value) {
        const scoped = annotationProvides.value.forDocument(props.documentId);
        activeTool.value = scoped.getActiveTool();
        const off = scoped.onActiveToolChange((event) => activeTool.value = event);
        unsubscribers.push(off);
      }
      onCleanup(() => {
        unsubscribers.forEach((unsub) => unsub());
      });
    });
    const blendMode = computed(() => {
      if (!activeTool.value) return blendModeToCss(PdfBlendMode.Normal);
      const defaultMode = activeTool.value.defaults.type === PdfAnnotationSubtype.HIGHLIGHT ? PdfBlendMode.Multiply : PdfBlendMode.Normal;
      return blendModeToCss(activeTool.value.defaults.blendMode ?? defaultMode);
    });
    return (_ctx, _cache) => {
      return boundingRect.value && activeTool.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        style: normalizeStyle({
          mixBlendMode: blendMode.value,
          pointerEvents: "none",
          position: "absolute",
          inset: 0
        })
      }, [
        activeTool.value.defaults.type === unref(PdfAnnotationSubtype).HIGHLIGHT ? (openBlock(), createBlock(_sfc_main$i, {
          key: 0,
          strokeColor: activeTool.value.defaults.strokeColor,
          opacity: activeTool.value.defaults.opacity,
          segmentRects: rects.value,
          scale: __props.scale
        }, null, 8, ["strokeColor", "opacity", "segmentRects", "scale"])) : activeTool.value.defaults.type === unref(PdfAnnotationSubtype).UNDERLINE ? (openBlock(), createBlock(_sfc_main$g, {
          key: 1,
          strokeColor: activeTool.value.defaults.strokeColor,
          opacity: activeTool.value.defaults.opacity,
          segmentRects: rects.value,
          scale: __props.scale
        }, null, 8, ["strokeColor", "opacity", "segmentRects", "scale"])) : activeTool.value.defaults.type === unref(PdfAnnotationSubtype).STRIKEOUT ? (openBlock(), createBlock(_sfc_main$e, {
          key: 2,
          strokeColor: activeTool.value.defaults.strokeColor,
          opacity: activeTool.value.defaults.opacity,
          segmentRects: rects.value,
          scale: __props.scale
        }, null, 8, ["strokeColor", "opacity", "segmentRects", "scale"])) : activeTool.value.defaults.type === unref(PdfAnnotationSubtype).SQUIGGLY ? (openBlock(), createBlock(_sfc_main$c, {
          key: 3,
          strokeColor: activeTool.value.defaults.strokeColor,
          opacity: activeTool.value.defaults.opacity,
          segmentRects: rects.value,
          scale: __props.scale
        }, null, 8, ["strokeColor", "opacity", "segmentRects", "scale"])) : createCommentVNode("", true)
      ], 4)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "preview-renderer",
  props: {
    toolId: {},
    preview: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const registry = useRendererRegistry();
    const allRenderers = computed(() => {
      const external = (registry == null ? void 0 : registry.getAll()) ?? [];
      const externalIds = new Set(external.map((r) => r.id));
      return [...external, ...builtInRenderers.filter((r) => !externalIds.has(r.id))];
    });
    const match = computed(
      () => allRenderers.value.find((r) => {
        var _a;
        return ((_a = r.matchesPreview) == null ? void 0 : _a.call(r, props.preview)) && r.renderPreview;
      }) ?? allRenderers.value.find((r) => r.id === props.toolId && r.renderPreview) ?? null
    );
    const style = computed(() => {
      var _a, _b;
      return {
        position: "absolute",
        left: `${props.preview.bounds.origin.x * props.scale}px`,
        top: `${props.preview.bounds.origin.y * props.scale}px`,
        width: `${props.preview.bounds.size.width * props.scale}px`,
        height: `${props.preview.bounds.size.height * props.scale}px`,
        pointerEvents: "none",
        zIndex: 10,
        ...(_b = (_a = match.value) == null ? void 0 : _a.previewContainerStyle) == null ? void 0 : _b.call(_a, {
          data: props.preview.data,
          bounds: props.preview.bounds,
          scale: props.scale
        })
      };
    });
    return (_ctx, _cache) => {
      var _a;
      return ((_a = match.value) == null ? void 0 : _a.renderPreview) ? (openBlock(), createElementBlock("div", {
        key: 0,
        style: normalizeStyle(style.value)
      }, [
        (openBlock(), createBlock(resolveDynamicComponent(match.value.renderPreview), {
          data: __props.preview.data,
          bounds: __props.preview.bounds,
          scale: __props.scale
        }, null, 8, ["data", "bounds", "scale"]))
      ], 4)) : createCommentVNode("", true);
    };
  }
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "annotation-paint-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {}
  },
  setup(__props) {
    const props = __props;
    const { plugin: annotationPlugin } = useAnnotationPlugin();
    const previews = ref(/* @__PURE__ */ new Map());
    const fileInputRef = ref(null);
    const services = computed(() => ({
      requestFile: ({ accept, onFile }) => {
        const input = fileInputRef.value;
        if (!input) return;
        input.accept = accept;
        input.onchange = (e) => {
          var _a;
          const file = (_a = e.target.files) == null ? void 0 : _a[0];
          if (file) {
            onFile(file);
            input.value = "";
          }
        };
        input.click();
      }
    }));
    let unregister;
    watchEffect((onCleanup) => {
      if (annotationPlugin.value) {
        unregister = annotationPlugin.value.registerPageHandlers(
          props.documentId,
          props.pageIndex,
          props.scale,
          {
            services: services.value,
            onPreview: (toolId, state) => {
              const next = new Map(previews.value);
              if (state) {
                next.set(toolId, state);
              } else {
                next.delete(toolId);
              }
              previews.value = next;
            }
          }
        );
      }
      onCleanup(() => {
        unregister == null ? void 0 : unregister();
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createElementVNode("input", {
          ref_key: "fileInputRef",
          ref: fileInputRef,
          type: "file",
          style: { "display": "none" }
        }, null, 512),
        (openBlock(true), createElementBlock(Fragment, null, renderList(previews.value.entries(), ([toolId, preview]) => {
          return openBlock(), createBlock(_sfc_main$4, {
            key: toolId,
            toolId,
            preview,
            scale: __props.scale
          }, null, 8, ["toolId", "preview", "scale"]);
        }), 128))
      ], 64);
    };
  }
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "annotation-layer",
  props: {
    documentId: {},
    pageIndex: {},
    scale: {},
    rotation: {},
    resizeUi: {},
    resizeUI: {},
    vertexUi: {},
    vertexUI: {},
    rotationUi: {},
    selectionOutlineColor: {},
    selectionOutline: {},
    groupSelectionOutline: {},
    selectionMenu: { type: Function },
    groupSelectionMenu: { type: Function },
    annotationRenderers: {}
  },
  setup(__props) {
    const props = __props;
    const resolvedResizeUi = computed(() => props.resizeUi ?? props.resizeUI);
    const resolvedVertexUi = computed(() => props.vertexUi ?? props.vertexUI);
    onMounted(() => {
      if (props.resizeUI) {
        console.warn(
          '[AnnotationLayer] The "resizeUI" prop is deprecated. Use :resize-ui in templates instead.'
        );
      }
      if (props.vertexUI) {
        console.warn(
          '[AnnotationLayer] The "vertexUI" prop is deprecated. Use :vertex-ui in templates instead.'
        );
      }
    });
    const registry = useRendererRegistry();
    const allRenderers = computed(() => {
      const fromRegistry = (registry == null ? void 0 : registry.getAll()) ?? [];
      const fromProps = props.annotationRenderers ?? [];
      const merged = [...fromRegistry];
      for (const r of fromProps) {
        const idx = merged.findIndex((m) => m.id === r.id);
        if (idx >= 0) merged[idx] = r;
        else merged.push(r);
      }
      return merged;
    });
    const documentState = useDocumentState(() => props.documentId);
    const page = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = documentState.value) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[props.pageIndex];
    });
    const pageWidth = computed(() => {
      var _a, _b;
      return ((_b = (_a = page.value) == null ? void 0 : _a.size) == null ? void 0 : _b.width) ?? 0;
    });
    const pageHeight = computed(() => {
      var _a, _b;
      return ((_b = (_a = page.value) == null ? void 0 : _a.size) == null ? void 0 : _b.height) ?? 0;
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
      return openBlock(), createElementBlock("div", null, [
        createVNode(_sfc_main$6, {
          documentId: __props.documentId,
          pageIndex: __props.pageIndex,
          scale: actualScale.value,
          rotation: actualRotation.value,
          pageWidth: pageWidth.value,
          pageHeight: pageHeight.value,
          resizeUi: resolvedResizeUi.value,
          vertexUi: resolvedVertexUi.value,
          rotationUi: __props.rotationUi,
          selectionOutlineColor: __props.selectionOutlineColor,
          selectionOutline: __props.selectionOutline,
          groupSelectionOutline: __props.groupSelectionOutline,
          selectionMenu: __props.selectionMenu,
          groupSelectionMenu: __props.groupSelectionMenu,
          annotationRenderers: allRenderers.value
        }, {
          "selection-menu": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "selection-menu", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "group-selection-menu": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "group-selection-menu", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "resize-handle": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "resize-handle", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "vertex-handle": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "vertex-handle", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          "rotation-handle": withCtx((slotProps) => [
            renderSlot(_ctx.$slots, "rotation-handle", normalizeProps(guardReactiveProps(slotProps)))
          ]),
          _: 3
        }, 8, ["documentId", "pageIndex", "scale", "rotation", "pageWidth", "pageHeight", "resizeUi", "vertexUi", "rotationUi", "selectionOutlineColor", "selectionOutline", "groupSelectionOutline", "selectionMenu", "groupSelectionMenu", "annotationRenderers"]),
        createVNode(_sfc_main$5, {
          documentId: __props.documentId,
          pageIndex: __props.pageIndex,
          scale: actualScale.value
        }, null, 8, ["documentId", "pageIndex", "scale"]),
        createVNode(_sfc_main$3, {
          documentId: __props.documentId,
          pageIndex: __props.pageIndex,
          scale: actualScale.value
        }, null, 8, ["documentId", "pageIndex", "scale"])
      ]);
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "renderer-registry-provider",
  setup(__props) {
    provideRendererRegistry();
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});
const _hoisted_1 = { style: { "display": "none" } };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "annotation-navigation-handler",
  setup(__props) {
    const { plugin } = useAnnotationPlugin();
    const { provides } = useAnnotationCapability();
    watchEffect((onCleanup) => {
      const p = provides.value;
      const pl = plugin.value;
      if (!p || !pl) return;
      const unsub = p.onNavigate((event) => {
        if (event.result.outcome === "uri" && pl.config.autoOpenLinks !== false) {
          window.open(event.result.uri, "_blank", "noopener,noreferrer");
        }
      });
      onCleanup(unsub);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", _hoisted_1);
    };
  }
});
const AnnotationPluginPackage = createPluginPackage(AnnotationPluginPackage$1).addWrapper(_sfc_main$1).addUtility(_sfc_main).build();
export {
  _sfc_main$Q as AnnotationContainer,
  _sfc_main$2 as AnnotationLayer,
  _sfc_main$3 as AnnotationPaintLayer,
  AnnotationPluginPackage,
  _sfc_main$6 as Annotations,
  _sfc_main$I as Circle,
  _sfc_main$r as FreeText,
  _sfc_main$P as GroupSelectionBox,
  _sfc_main$i as Highlight,
  _sfc_main$M as Ink,
  _sfc_main$G as Line,
  _sfc_main$k as Link,
  _sfc_main$C as Polygon,
  _sfc_main$E as Polyline,
  _sfc_main$4 as PreviewRenderer,
  _sfc_main$n as RenderAnnotation,
  _sfc_main$1 as RendererRegistryProvider,
  _sfc_main$K as Square,
  _sfc_main$c as Squiggly,
  _sfc_main$m as Stamp,
  _sfc_main$e as Strikeout,
  _sfc_main$8 as Text,
  _sfc_main$5 as TextMarkup,
  _sfc_main$g as Underline,
  createRenderer,
  createRendererRegistry,
  provideRendererRegistry,
  useAnnotation,
  useAnnotationCapability,
  useAnnotationPlugin,
  useIOSZoomPrevention,
  useRegisterRenderers,
  useRendererRegistry
};
//# sourceMappingURL=index.js.map
