import { createPluginPackage } from "@embedpdf/core";
import { AnnotationPlugin, initialDocumentState, generateCloudyRectanglePath, generateCloudyEllipsePath, patching, generateCloudyPolygonPath, LockModeType, getAnnotationsByPageIndex, getSelectedAnnotationIds, resolveInteractionProp, hasNoViewFlag, hasHiddenFlag, AnnotationPluginPackage as AnnotationPluginPackage$1 } from "@embedpdf/plugin-annotation";
export * from "@embedpdf/plugin-annotation";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createContext, useState, useCallback, useContext, useRef, useEffect, useMemo, Fragment as Fragment$1 } from "react";
import { createPortal } from "react-dom";
import { usePlugin, useCapability, useDocumentPermissions, useDocumentState } from "@embedpdf/core/react";
import { inferRotationCenterFromRects, boundingRectOrEmpty, PdfAnnotationBorderStyle, getContrastStrokeColor, PdfVerticalAlignment, textAlignmentToCss, standardFontCssProperties, ignore, PdfErrorCode, PdfBlendMode, blendModeToCss, PdfAnnotationSubtype } from "@embedpdf/models";
import { usePointerHandlers } from "@embedpdf/plugin-interaction-manager/react";
import { useSelectionCapability } from "@embedpdf/plugin-selection/react";
import { useInteractionHandles, useDoublePressProps, CounterRotate } from "@embedpdf/utils/react";
import { getCounterRotation } from "@embedpdf/utils";
const suppressContentEditableWarningProps = {
  suppressContentEditableWarning: true
};
const RegisterContext = createContext(null);
const RenderersContext = createContext([]);
function AnnotationRendererProvider({ children }) {
  const [renderers, setRenderers] = useState([]);
  const register = useCallback((entries) => {
    setRenderers((prev) => {
      const ids = new Set(entries.map((e) => e.id));
      return [...prev.filter((r) => !ids.has(r.id)), ...entries];
    });
    return () => setRenderers((prev) => prev.filter((r) => !entries.some((e) => e.id === r.id)));
  }, []);
  return /* @__PURE__ */ jsx(RegisterContext.Provider, { value: register, children: /* @__PURE__ */ jsx(RenderersContext.Provider, { value: renderers, children }) });
}
function useRegisterRenderers(renderers) {
  const register = useContext(RegisterContext);
  const renderersRef = useRef(renderers);
  useEffect(() => {
    if (!register) return;
    return register(renderersRef.current);
  }, [register]);
}
function useRegisteredRenderers() {
  return useContext(RenderersContext);
}
function useRendererRegistry() {
  return useContext(RegisterContext);
}
const useAnnotationPlugin = () => usePlugin(AnnotationPlugin.id);
const useAnnotationCapability = () => useCapability(AnnotationPlugin.id);
const useAnnotation = (documentId) => {
  var _a;
  const { provides } = useAnnotationCapability();
  const [state, setState] = useState(
    ((_a = provides == null ? void 0 : provides.forDocument(documentId)) == null ? void 0 : _a.getState()) ?? initialDocumentState()
  );
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setState(scope.getState());
    return scope.onStateChange((newState) => {
      setState(newState);
    });
  }, [provides, documentId]);
  return {
    state,
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
function AnnotationNavigationHandler() {
  const { plugin } = useAnnotationPlugin();
  const { provides } = useAnnotationCapability();
  useEffect(() => {
    if (!provides || !plugin) return;
    return provides.onNavigate((event) => {
      if (event.result.outcome === "uri" && plugin.config.autoOpenLinks !== false) {
        window.open(event.result.uri, "_blank", "noopener,noreferrer");
      }
    });
  }, [provides, plugin]);
  return null;
}
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
  return useMemo(() => {
    const needsComp = isIOS && active && computedFontPx > 0 && computedFontPx < MIN_IOS_FOCUS_FONT_PX;
    const adjustedFontPx = needsComp ? MIN_IOS_FOCUS_FONT_PX : computedFontPx;
    const scaleComp = needsComp ? computedFontPx / MIN_IOS_FOCUS_FONT_PX : 1;
    const wrapperStyle = needsComp ? {
      width: `${100 / scaleComp}%`,
      height: `${100 / scaleComp}%`,
      transform: `scale(${scaleComp})`,
      transformOrigin: "top left"
    } : void 0;
    return { needsComp, adjustedFontPx, scaleComp, wrapperStyle };
  }, [isIOS, active, computedFontPx]);
}
function AppearanceImage({ appearance, style }) {
  const [imageUrl, setImageUrl] = useState(null);
  const urlRef = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(appearance.data);
    setImageUrl(url);
    urlRef.current = url;
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [appearance.data]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  return imageUrl ? /* @__PURE__ */ jsx(
    "img",
    {
      src: imageUrl,
      onLoad: handleImageLoad,
      style: {
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        userSelect: "none",
        ...style
      }
    }
  ) : null;
}
function AnnotationContainer({
  scale,
  documentId,
  pageIndex,
  rotation,
  pageWidth,
  pageHeight,
  trackedAnnotation,
  children,
  isSelected,
  isEditing = false,
  isMultiSelected = false,
  isDraggable,
  isResizable,
  isRotatable = true,
  lockAspectRatio = false,
  style = {},
  blendMode,
  vertexConfig,
  selectionMenu,
  structurallyLocked = false,
  contentLocked = false,
  outlineOffset = 1,
  onDoubleClick,
  onSelect,
  appearance,
  zIndex = 1,
  resizeUI,
  vertexUI,
  rotationUI,
  selectionOutlineColor,
  selectionOutline,
  customAnnotationRenderer,
  // Destructure props that shouldn't be passed to DOM elements
  groupSelectionMenu: _groupSelectionMenu,
  groupSelectionOutline: _groupSelectionOutline,
  annotationRenderers: _annotationRenderers,
  ...props
}) {
  var _a, _b, _c;
  const [preview, setPreview] = useState(trackedAnnotation.object);
  const [liveRotation, setLiveRotation] = useState(null);
  const [cursorScreen, setCursorScreen] = useState(null);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const { provides: annotationCapability } = useAnnotationCapability();
  const { plugin } = useAnnotationPlugin();
  const { canModifyAnnotations } = useDocumentPermissions(documentId);
  const gestureBaseRef = useRef(null);
  const effectiveIsDraggable = canModifyAnnotations && isDraggable && !isMultiSelected;
  const effectiveIsResizable = canModifyAnnotations && isResizable && !isMultiSelected;
  const effectiveIsRotatable = canModifyAnnotations && isRotatable && !isMultiSelected;
  const annotationProvides = useMemo(
    () => annotationCapability ? annotationCapability.forDocument(documentId) : null,
    [annotationCapability, documentId]
  );
  const currentObject = preview ? { ...trackedAnnotation.object, ...preview } : trackedAnnotation.object;
  const annoFlags = trackedAnnotation.object.flags ?? [];
  const hasNoZoom = annoFlags.includes("noZoom");
  const hasNoRotate = annoFlags.includes("noRotate");
  const visualScale = hasNoZoom ? 1 : scale;
  const effectivePageRotation = hasNoRotate ? 0 : rotation;
  const HANDLE_COLOR = (resizeUI == null ? void 0 : resizeUI.color) ?? "#007ACC";
  const VERTEX_COLOR = (vertexUI == null ? void 0 : vertexUI.color) ?? "#007ACC";
  const ROTATION_COLOR = (rotationUI == null ? void 0 : rotationUI.color) ?? "white";
  const ROTATION_CONNECTOR_COLOR = (rotationUI == null ? void 0 : rotationUI.connectorColor) ?? "#007ACC";
  const HANDLE_SIZE = (resizeUI == null ? void 0 : resizeUI.size) ?? 12;
  const VERTEX_SIZE = (vertexUI == null ? void 0 : vertexUI.size) ?? 12;
  const ROTATION_SIZE = (rotationUI == null ? void 0 : rotationUI.size) ?? 32;
  const ROTATION_MARGIN = rotationUI == null ? void 0 : rotationUI.margin;
  const ROTATION_ICON_COLOR = (rotationUI == null ? void 0 : rotationUI.iconColor) ?? "#007ACC";
  const SHOW_CONNECTOR = (rotationUI == null ? void 0 : rotationUI.showConnector) ?? false;
  const ROTATION_BORDER_COLOR = ((_a = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _a.color) ?? "#007ACC";
  const ROTATION_BORDER_WIDTH = ((_b = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _b.width) ?? 1;
  const ROTATION_BORDER_STYLE = ((_c = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _c.style) ?? "solid";
  const outlineColor = (selectionOutline == null ? void 0 : selectionOutline.color) ?? selectionOutlineColor ?? "#007ACC";
  const outlineStyle = (selectionOutline == null ? void 0 : selectionOutline.style) ?? "solid";
  const outlineWidth = (selectionOutline == null ? void 0 : selectionOutline.width) ?? 1;
  const outlineOff = (selectionOutline == null ? void 0 : selectionOutline.offset) ?? outlineOffset ?? 1;
  const annotationRotation = liveRotation ?? currentObject.rotation ?? 0;
  const rotationDisplay = liveRotation ?? currentObject.rotation ?? 0;
  const normalizedRotationDisplay = Number.isFinite(rotationDisplay) ? Math.round(rotationDisplay * 10) / 10 : 0;
  const rotationActive = liveRotation !== null;
  const gestureBaseRectRef = useRef(null);
  const handleUpdate = useCallback(
    (event) => {
      var _a2;
      if (!((_a2 = event.transformData) == null ? void 0 : _a2.type) || isMultiSelected || !plugin) return;
      const { type, changes, metadata } = event.transformData;
      const id = trackedAnnotation.object.id;
      const pageSize = { width: pageWidth, height: pageHeight };
      if (event.state === "start") {
        gestureBaseRectRef.current = trackedAnnotation.object.unrotatedRect ?? trackedAnnotation.object.rect;
        gestureBaseRef.current = trackedAnnotation.object;
        if (type === "resize" || type === "vertex-edit") {
          setGestureActive(true);
        }
        if (type === "move") {
          plugin.startDrag(documentId, { annotationIds: [id], pageSize });
        } else if (type === "resize") {
          plugin.startResize(documentId, {
            annotationIds: [id],
            pageSize,
            resizeHandle: (metadata == null ? void 0 : metadata.handle) ?? "se"
          });
        }
      }
      if (changes.rect && gestureBaseRectRef.current) {
        if (type === "move") {
          const delta = {
            x: changes.rect.origin.x - gestureBaseRectRef.current.origin.x,
            y: changes.rect.origin.y - gestureBaseRectRef.current.origin.y
          };
          plugin.updateDrag(documentId, delta);
        } else if (type === "resize") {
          plugin.updateResize(documentId, changes.rect);
        }
      }
      if (type === "vertex-edit" && changes.vertices && vertexConfig) {
        const base = gestureBaseRef.current ?? trackedAnnotation.object;
        const vertexChanges = vertexConfig.transformAnnotation(base, changes.vertices);
        const patched = annotationCapability == null ? void 0 : annotationCapability.transformAnnotation(base, {
          type,
          changes: vertexChanges,
          metadata
        });
        if (patched) {
          setPreview((prev) => ({ ...prev, ...patched }));
          if (event.state === "end") {
            annotationProvides == null ? void 0 : annotationProvides.updateAnnotation(pageIndex, id, patched);
          }
        }
      }
      if (type === "rotate") {
        const cursorAngle = (metadata == null ? void 0 : metadata.rotationAngle) ?? annotationRotation;
        const cursorPos = metadata == null ? void 0 : metadata.cursorPosition;
        if (cursorPos) setCursorScreen({ x: cursorPos.clientX, y: cursorPos.clientY });
        if (event.state === "start") {
          setLiveRotation(cursorAngle);
          plugin.startRotation(documentId, {
            annotationIds: [id],
            cursorAngle,
            rotationCenter: metadata == null ? void 0 : metadata.rotationCenter
          });
        } else if (event.state === "move") {
          setLiveRotation(cursorAngle);
          plugin.updateRotation(documentId, cursorAngle, metadata == null ? void 0 : metadata.rotationDelta);
        } else if (event.state === "end") {
          setLiveRotation(null);
          setCursorScreen(null);
          plugin.commitRotation(documentId);
        }
        return;
      }
      if (event.state === "end") {
        gestureBaseRectRef.current = null;
        gestureBaseRef.current = null;
        setGestureActive(false);
        if (type === "move") plugin.commitDrag(documentId);
        else if (type === "resize") plugin.commitResize(documentId);
      }
    },
    [
      plugin,
      documentId,
      trackedAnnotation.object,
      pageWidth,
      pageHeight,
      pageIndex,
      isMultiSelected,
      vertexConfig,
      annotationCapability,
      annotationProvides,
      annotationRotation
    ]
  );
  const explicitUnrotatedRect = currentObject.unrotatedRect;
  const effectiveUnrotatedRect = explicitUnrotatedRect ?? currentObject.rect;
  const rotationPivot = explicitUnrotatedRect && annotationRotation !== 0 ? inferRotationCenterFromRects(effectiveUnrotatedRect, currentObject.rect, annotationRotation) : void 0;
  const controllerElement = effectiveUnrotatedRect;
  const {
    dragProps,
    vertices,
    resize,
    rotation: rotationHandle
  } = useInteractionHandles({
    controller: {
      element: controllerElement,
      vertices: vertexConfig == null ? void 0 : vertexConfig.extractVertices(currentObject),
      constraints: {
        minWidth: 10,
        minHeight: 10,
        boundingBox: { width: pageWidth, height: pageHeight }
      },
      maintainAspectRatio: lockAspectRatio,
      pageRotation: rotation,
      annotationRotation,
      rotationCenter: rotationPivot,
      rotationElement: currentObject.rect,
      scale,
      // Disable interaction handles when multi-selected
      enabled: isSelected && !isMultiSelected,
      onUpdate: handleUpdate
    },
    resizeUI: {
      handleSize: HANDLE_SIZE,
      spacing: outlineOff,
      offsetMode: "outside",
      includeSides: lockAspectRatio ? false : true,
      zIndex: zIndex + 1
    },
    vertexUI: {
      vertexSize: VERTEX_SIZE,
      zIndex: zIndex + 2
    },
    rotationUI: {
      handleSize: ROTATION_SIZE,
      margin: ROTATION_MARGIN,
      zIndex: zIndex + 3,
      showConnector: SHOW_CONNECTOR
    },
    includeVertices: vertexConfig ? true : false,
    includeRotation: effectiveIsRotatable,
    currentRotation: annotationRotation
  });
  const guardedOnDoubleClick = useMemo(() => {
    if (!canModifyAnnotations || !onDoubleClick) return void 0;
    return onDoubleClick;
  }, [canModifyAnnotations, onDoubleClick]);
  const doubleProps = useDoublePressProps(guardedOnDoubleClick);
  useEffect(() => {
    setPreview(trackedAnnotation.object);
  }, [trackedAnnotation.object]);
  useEffect(() => {
    if (!plugin) return;
    const id = trackedAnnotation.object.id;
    const handleEvent = (event) => {
      var _a2;
      if (event.documentId !== documentId) return;
      if (event.type === "end" || event.type === "cancel") {
        setLiveRotation(null);
      }
      const patch = (_a2 = event.previewPatches) == null ? void 0 : _a2[id];
      if (event.type === "update" && patch) setPreview((prev) => ({ ...prev, ...patch }));
      else if (event.type === "cancel") setPreview(trackedAnnotation.object);
    };
    const unsubs = [
      plugin.onDragChange(handleEvent),
      plugin.onResizeChange(handleEvent),
      plugin.onRotateChange(handleEvent)
    ];
    return () => unsubs.forEach((u) => u());
  }, [plugin, documentId, trackedAnnotation.object]);
  const showOutline = isSelected && !isMultiSelected;
  const aabbWidth = currentObject.rect.size.width * visualScale;
  const aabbHeight = currentObject.rect.size.height * visualScale;
  const innerWidth = effectiveUnrotatedRect.size.width * visualScale;
  const innerHeight = effectiveUnrotatedRect.size.height * visualScale;
  const usesCustomPivot = Boolean(explicitUnrotatedRect) && annotationRotation !== 0;
  const innerLeft = usesCustomPivot ? (effectiveUnrotatedRect.origin.x - currentObject.rect.origin.x) * visualScale : (aabbWidth - innerWidth) / 2;
  const innerTop = usesCustomPivot ? (effectiveUnrotatedRect.origin.y - currentObject.rect.origin.y) * visualScale : (aabbHeight - innerHeight) / 2;
  const innerTransformOrigin = usesCustomPivot && rotationPivot ? `${(rotationPivot.x - effectiveUnrotatedRect.origin.x) * visualScale}px ${(rotationPivot.y - effectiveUnrotatedRect.origin.y) * visualScale}px` : "center center";
  const centerX = rotationPivot ? (rotationPivot.x - currentObject.rect.origin.x) * visualScale : aabbWidth / 2;
  const centerY = rotationPivot ? (rotationPivot.y - currentObject.rect.origin.y) * visualScale : aabbHeight / 2;
  const guideLength = Math.max(300, Math.max(aabbWidth, aabbHeight) + 80);
  const counterRot = hasNoRotate ? getCounterRotation(
    { origin: { x: 0, y: 0 }, size: { width: aabbWidth, height: aabbHeight } },
    rotation
  ) : null;
  const childObject = useMemo(() => {
    if (explicitUnrotatedRect) {
      return { ...currentObject, rect: explicitUnrotatedRect };
    }
    return currentObject;
  }, [currentObject, explicitUnrotatedRect]);
  const apActive = !!(appearance == null ? void 0 : appearance.normal) && !gestureActive && !isEditing && !trackedAnnotation.dictMode;
  const layerBaseStyle = {
    position: "absolute",
    left: currentObject.rect.origin.x * scale,
    top: currentObject.rect.origin.y * scale,
    width: counterRot ? counterRot.width : aabbWidth,
    height: counterRot ? counterRot.height : aabbHeight,
    pointerEvents: "none",
    zIndex,
    // noRotate: apply counter-rotation matrix so the annotation stays upright
    ...counterRot && {
      transform: counterRot.matrix,
      transformOrigin: "0 0"
    }
  };
  const innerDivBaseStyle = {
    position: "absolute",
    left: innerLeft,
    top: innerTop,
    width: innerWidth,
    height: innerHeight,
    transform: annotationRotation !== 0 ? `rotate(${annotationRotation}deg)` : void 0,
    transformOrigin: innerTransformOrigin
  };
  return /* @__PURE__ */ jsxs("div", { "data-no-interaction": true, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          ...layerBaseStyle,
          ...blendMode && { mixBlendMode: blendMode },
          ...style
        },
        children: /* @__PURE__ */ jsxs("div", { style: { ...innerDivBaseStyle, pointerEvents: isEditing ? "auto" : "none" }, children: [
          (() => {
            const childrenRender = typeof children === "function" ? children(childObject, { appearanceActive: apActive }) : children;
            const customRender = customAnnotationRenderer == null ? void 0 : customAnnotationRenderer({
              annotation: childObject,
              children: childrenRender,
              isSelected,
              scale,
              rotation,
              pageWidth,
              pageHeight,
              pageIndex,
              onSelect
            });
            return customRender ?? childrenRender;
          })(),
          (appearance == null ? void 0 : appearance.normal) && /* @__PURE__ */ jsx(
            AppearanceImage,
            {
              appearance: appearance.normal,
              style: { display: apActive ? "block" : "none" }
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: layerBaseStyle, ...props, children: [
      rotationActive && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: centerX - guideLength / 2,
              top: centerY,
              width: guideLength,
              height: 1,
              backgroundColor: ROTATION_CONNECTOR_COLOR,
              opacity: 0.35,
              pointerEvents: "none"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: centerX,
              top: centerY - guideLength / 2,
              width: 1,
              height: guideLength,
              backgroundColor: ROTATION_CONNECTOR_COLOR,
              opacity: 0.35,
              pointerEvents: "none"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: centerX - guideLength / 2,
              top: centerY,
              width: guideLength,
              height: 1,
              transformOrigin: "center center",
              transform: `rotate(${annotationRotation}deg)`,
              backgroundColor: ROTATION_CONNECTOR_COLOR,
              opacity: 0.8,
              pointerEvents: "none"
            }
          }
        )
      ] }),
      isSelected && effectiveIsRotatable && rotationHandle && ((rotationUI == null ? void 0 : rotationUI.component) ? /* @__PURE__ */ jsx(
        "div",
        {
          onPointerEnter: () => setIsHandleHovered(true),
          onPointerLeave: () => {
            setIsHandleHovered(false);
            setCursorScreen(null);
          },
          onPointerMove: (e) => {
            if (!rotationActive) setCursorScreen({ x: e.clientX, y: e.clientY });
          },
          style: { display: "contents" },
          children: rotationUI.component({
            ...rotationHandle.handle,
            backgroundColor: ROTATION_COLOR,
            iconColor: ROTATION_ICON_COLOR,
            connectorStyle: {
              ...rotationHandle.connector.style,
              backgroundColor: ROTATION_CONNECTOR_COLOR,
              opacity: rotationActive ? 0 : 1
            },
            showConnector: SHOW_CONNECTOR,
            opacity: rotationActive ? 0 : 1,
            border: {
              color: ROTATION_BORDER_COLOR,
              width: ROTATION_BORDER_WIDTH,
              style: ROTATION_BORDER_STYLE
            }
          })
        }
      ) : /* @__PURE__ */ jsxs(
        "div",
        {
          onPointerEnter: () => setIsHandleHovered(true),
          onPointerLeave: () => {
            setIsHandleHovered(false);
            setCursorScreen(null);
          },
          onPointerMove: (e) => {
            if (!rotationActive) setCursorScreen({ x: e.clientX, y: e.clientY });
          },
          style: { display: "contents" },
          children: [
            SHOW_CONNECTOR && /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  ...rotationHandle.connector.style,
                  backgroundColor: ROTATION_CONNECTOR_COLOR,
                  opacity: rotationActive ? 0 : 1
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                ...rotationHandle.handle,
                style: {
                  ...rotationHandle.handle.style,
                  backgroundColor: ROTATION_COLOR,
                  border: `${ROTATION_BORDER_WIDTH}px ${ROTATION_BORDER_STYLE} ${ROTATION_BORDER_COLOR}`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "auto",
                  opacity: rotationActive ? 0 : 1
                },
                children: /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    width: Math.round(ROTATION_SIZE * 0.6),
                    height: Math.round(ROTATION_SIZE * 0.6),
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: ROTATION_ICON_COLOR,
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }),
                      /* @__PURE__ */ jsx("path", { d: "M21 3v5h-5" })
                    ]
                  }
                )
              }
            )
          ]
        }
      )),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ...effectiveIsDraggable && isSelected ? dragProps : {},
          ...doubleProps,
          style: {
            ...innerDivBaseStyle,
            outline: showOutline ? `${outlineWidth}px ${outlineStyle} ${outlineColor}` : "none",
            outlineOffset: showOutline ? `${outlineOff}px` : "0px",
            pointerEvents: isSelected && !isMultiSelected && !isEditing ? "auto" : "none",
            touchAction: "none",
            cursor: isSelected && effectiveIsDraggable ? "move" : "default"
          },
          children: [
            isSelected && effectiveIsResizable && !rotationActive && resize.map(
              ({ key, ...hProps }) => (resizeUI == null ? void 0 : resizeUI.component) ? resizeUI.component({
                key,
                ...hProps,
                backgroundColor: HANDLE_COLOR
              }) : /* @__PURE__ */ jsx(
                "div",
                {
                  ...hProps,
                  style: { ...hProps.style, backgroundColor: HANDLE_COLOR }
                },
                key
              )
            ),
            isSelected && canModifyAnnotations && !isMultiSelected && !rotationActive && vertices.map(
              ({ key, ...vProps }) => (vertexUI == null ? void 0 : vertexUI.component) ? vertexUI.component({
                key,
                ...vProps,
                backgroundColor: VERTEX_COLOR
              }) : /* @__PURE__ */ jsx(
                "div",
                {
                  ...vProps,
                  style: { ...vProps.style, backgroundColor: VERTEX_COLOR }
                },
                key
              )
            )
          ]
        }
      )
    ] }),
    selectionMenu && !isMultiSelected && !rotationActive && /* @__PURE__ */ jsx(
      CounterRotate,
      {
        rect: {
          origin: {
            x: currentObject.rect.origin.x * scale,
            y: currentObject.rect.origin.y * scale
          },
          size: {
            width: currentObject.rect.size.width * visualScale,
            height: currentObject.rect.size.height * visualScale
          }
        },
        rotation,
        children: (counterRotateProps) => {
          const effectiveAngle = ((annotationRotation + effectivePageRotation * 90) % 360 + 360) % 360;
          const handleNearMenuSide = effectiveIsRotatable && effectiveAngle > 90 && effectiveAngle < 270;
          return selectionMenu({
            ...counterRotateProps,
            context: {
              type: "annotation",
              annotation: trackedAnnotation,
              pageIndex,
              structurallyLocked,
              contentLocked
            },
            selected: isSelected,
            placement: {
              suggestTop: handleNearMenuSide
            }
          });
        }
      }
    ),
    (rotationActive || isHandleHovered) && cursorScreen && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            position: "fixed",
            left: cursorScreen.x + 16,
            top: cursorScreen.y - 16,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 1e4,
            whiteSpace: "nowrap"
          },
          children: [
            normalizedRotationDisplay.toFixed(0),
            "°"
          ]
        }
      ),
      document.body
    )
  ] });
}
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
function GroupSelectionBox({
  documentId,
  pageIndex,
  scale,
  rotation,
  pageWidth,
  pageHeight,
  selectedAnnotations,
  isDraggable,
  isResizable,
  isRotatable = true,
  lockAspectRatio = false,
  resizeUI,
  rotationUI,
  selectionOutlineColor,
  outlineOffset,
  selectionOutline,
  zIndex = 2,
  groupSelectionMenu
}) {
  var _a, _b, _c;
  const { plugin } = useAnnotationPlugin();
  const { canModifyAnnotations } = useDocumentPermissions(documentId);
  const gestureBaseRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const [liveRotation, setLiveRotation] = useState(null);
  const [cursorScreen, setCursorScreen] = useState(null);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const effectiveIsDraggable = canModifyAnnotations && isDraggable;
  const effectiveIsResizable = canModifyAnnotations && isResizable;
  const effectiveIsRotatable = canModifyAnnotations && isRotatable;
  const groupBox = useMemo(() => {
    const rects = selectedAnnotations.map((ta) => ta.object.rect);
    return boundingRectOrEmpty(rects);
  }, [selectedAnnotations]);
  const [previewGroupBox, setPreviewGroupBox] = useState(groupBox);
  useEffect(() => {
    if (!isDraggingRef.current && !isResizingRef.current) {
      setPreviewGroupBox(groupBox);
    }
  }, [groupBox]);
  useEffect(() => {
    if (!plugin) return;
    const unsubscribe = plugin.onRotateChange((event) => {
      if (event.documentId !== documentId) return;
      if (event.type === "end" || event.type === "cancel") {
        setLiveRotation(null);
      }
    });
    return unsubscribe;
  }, [plugin, documentId]);
  const handleUpdate = useCallback(
    (event) => {
      var _a2, _b2, _c2, _d, _e, _f;
      if (!((_a2 = event.transformData) == null ? void 0 : _a2.type)) return;
      if (!plugin) return;
      const transformType = event.transformData.type;
      const isMove = transformType === "move";
      const isResize = transformType === "resize";
      if (isMove && !effectiveIsDraggable) return;
      if (event.state === "start") {
        gestureBaseRef.current = groupBox;
        if (isMove) {
          isDraggingRef.current = true;
          plugin.startDrag(documentId, {
            annotationIds: selectedAnnotations.map((ta) => ta.object.id),
            pageSize: { width: pageWidth, height: pageHeight }
          });
        } else if (isResize) {
          isResizingRef.current = true;
          plugin.startResize(documentId, {
            annotationIds: selectedAnnotations.map((ta) => ta.object.id),
            pageSize: { width: pageWidth, height: pageHeight },
            resizeHandle: ((_b2 = event.transformData.metadata) == null ? void 0 : _b2.handle) ?? "se"
          });
        }
      }
      if (transformType === "rotate") {
        if (!isRotatable) return;
        const ids = selectedAnnotations.map((ta) => ta.object.id);
        const cursorAngle = ((_c2 = event.transformData.metadata) == null ? void 0 : _c2.rotationAngle) ?? 0;
        const cursorPos = (_d = event.transformData.metadata) == null ? void 0 : _d.cursorPosition;
        if (cursorPos) setCursorScreen({ x: cursorPos.clientX, y: cursorPos.clientY });
        if (event.state === "start") {
          setLiveRotation(cursorAngle);
          plugin.startRotation(documentId, {
            annotationIds: ids,
            cursorAngle,
            rotationCenter: (_e = event.transformData.metadata) == null ? void 0 : _e.rotationCenter
          });
        } else if (event.state === "move") {
          setLiveRotation(cursorAngle);
          plugin.updateRotation(
            documentId,
            cursorAngle,
            (_f = event.transformData.metadata) == null ? void 0 : _f.rotationDelta
          );
        } else if (event.state === "end") {
          setLiveRotation(null);
          setCursorScreen(null);
          plugin.commitRotation(documentId);
        }
        return;
      }
      const base = gestureBaseRef.current ?? groupBox;
      if (isMove && event.transformData.changes.rect) {
        const newRect = event.transformData.changes.rect;
        const rawDelta = {
          x: newRect.origin.x - base.origin.x,
          y: newRect.origin.y - base.origin.y
        };
        const clampedDelta = plugin.updateDrag(documentId, rawDelta);
        setPreviewGroupBox({
          ...base,
          origin: {
            x: base.origin.x + clampedDelta.x,
            y: base.origin.y + clampedDelta.y
          }
        });
      } else if (isResize && event.transformData.changes.rect) {
        const newGroupBox = event.transformData.changes.rect;
        plugin.updateResize(documentId, newGroupBox);
        setPreviewGroupBox(newGroupBox);
      }
      if (event.state === "end") {
        gestureBaseRef.current = null;
        if (isMove && isDraggingRef.current) {
          isDraggingRef.current = false;
          plugin.commitDrag(documentId);
        } else if (isResize && isResizingRef.current) {
          isResizingRef.current = false;
          plugin.commitResize(documentId);
        }
      }
    },
    [
      plugin,
      documentId,
      pageWidth,
      pageHeight,
      groupBox,
      effectiveIsDraggable,
      selectedAnnotations,
      isRotatable
    ]
  );
  const groupRotationDisplay = liveRotation ?? 0;
  const rotationActive = liveRotation !== null;
  const normalizedRotationDisplay = Number.isFinite(groupRotationDisplay) ? Math.round(groupRotationDisplay * 10) / 10 : 0;
  const HANDLE_COLOR = (resizeUI == null ? void 0 : resizeUI.color) ?? "#007ACC";
  const HANDLE_SIZE = (resizeUI == null ? void 0 : resizeUI.size) ?? 12;
  const ROTATION_COLOR = (rotationUI == null ? void 0 : rotationUI.color) ?? "white";
  const ROTATION_CONNECTOR_COLOR = (rotationUI == null ? void 0 : rotationUI.connectorColor) ?? "#007ACC";
  const ROTATION_SIZE = (rotationUI == null ? void 0 : rotationUI.size) ?? 32;
  const ROTATION_MARGIN = rotationUI == null ? void 0 : rotationUI.margin;
  const ROTATION_ICON_COLOR = (rotationUI == null ? void 0 : rotationUI.iconColor) ?? "#007ACC";
  const SHOW_CONNECTOR = (rotationUI == null ? void 0 : rotationUI.showConnector) ?? false;
  const ROTATION_BORDER_COLOR = ((_a = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _a.color) ?? "#007ACC";
  const ROTATION_BORDER_WIDTH = ((_b = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _b.width) ?? 1;
  const ROTATION_BORDER_STYLE = ((_c = rotationUI == null ? void 0 : rotationUI.border) == null ? void 0 : _c.style) ?? "solid";
  const outlineColor = (selectionOutline == null ? void 0 : selectionOutline.color) ?? selectionOutlineColor ?? "#007ACC";
  const outlineStyleVal = (selectionOutline == null ? void 0 : selectionOutline.style) ?? "dashed";
  const outlineWidth = (selectionOutline == null ? void 0 : selectionOutline.width) ?? 2;
  const outlineOff = (selectionOutline == null ? void 0 : selectionOutline.offset) ?? outlineOffset ?? 2;
  const {
    dragProps,
    resize,
    rotation: rotationHandle
  } = useInteractionHandles({
    controller: {
      element: previewGroupBox,
      constraints: {
        minWidth: 20,
        minHeight: 20,
        boundingBox: { width: pageWidth, height: pageHeight }
      },
      maintainAspectRatio: lockAspectRatio,
      pageRotation: rotation,
      scale,
      enabled: true,
      onUpdate: handleUpdate
    },
    resizeUI: {
      handleSize: HANDLE_SIZE,
      spacing: outlineOff,
      offsetMode: "outside",
      includeSides: !lockAspectRatio,
      zIndex: zIndex + 1
    },
    vertexUI: {
      vertexSize: 0,
      zIndex
    },
    rotationUI: {
      handleSize: ROTATION_SIZE,
      margin: ROTATION_MARGIN,
      zIndex: zIndex + 2,
      showConnector: SHOW_CONNECTOR
    },
    includeVertices: false,
    includeRotation: effectiveIsRotatable,
    currentRotation: liveRotation ?? 0
  });
  if (selectedAnnotations.length < 2) {
    return null;
  }
  let visualLeft = Infinity;
  let visualTop = Infinity;
  let visualRight = -Infinity;
  let visualBottom = -Infinity;
  for (const ta of selectedAnnotations) {
    const bounds = getAnnotationScreenBounds(ta, scale, rotation);
    visualLeft = Math.min(visualLeft, bounds.left);
    visualTop = Math.min(visualTop, bounds.top);
    visualRight = Math.max(visualRight, bounds.right);
    visualBottom = Math.max(visualBottom, bounds.bottom);
  }
  const initialLogicalLeft = groupBox.origin.x * scale;
  const initialLogicalTop = groupBox.origin.y * scale;
  const initialLogicalRight = (groupBox.origin.x + groupBox.size.width) * scale;
  const initialLogicalBottom = (groupBox.origin.y + groupBox.size.height) * scale;
  const leftCorrection = visualLeft - initialLogicalLeft;
  const topCorrection = visualTop - initialLogicalTop;
  const rightCorrection = visualRight - initialLogicalRight;
  const bottomCorrection = visualBottom - initialLogicalBottom;
  const groupBoxLeft = previewGroupBox.origin.x * scale + leftCorrection;
  const groupBoxTop = previewGroupBox.origin.y * scale + topCorrection;
  const groupBoxWidth = previewGroupBox.size.width * scale + (rightCorrection - leftCorrection);
  const groupBoxHeight = previewGroupBox.size.height * scale + (bottomCorrection - topCorrection);
  const groupCenterX = groupBoxWidth / 2;
  const groupCenterY = groupBoxHeight / 2;
  const groupGuideLength = Math.max(300, Math.max(groupBoxWidth, groupBoxHeight) + 80);
  return /* @__PURE__ */ jsxs("div", { "data-group-selection-box": true, "data-no-interaction": true, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          position: "absolute",
          left: groupBoxLeft,
          top: groupBoxTop,
          width: groupBoxWidth,
          height: groupBoxHeight,
          pointerEvents: "none",
          zIndex
        },
        children: [
          rotationActive && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  left: groupCenterX - groupGuideLength / 2,
                  top: groupCenterY,
                  width: groupGuideLength,
                  height: 1,
                  backgroundColor: HANDLE_COLOR,
                  opacity: 0.35,
                  pointerEvents: "none"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  left: groupCenterX,
                  top: groupCenterY - groupGuideLength / 2,
                  width: 1,
                  height: groupGuideLength,
                  backgroundColor: HANDLE_COLOR,
                  opacity: 0.35,
                  pointerEvents: "none"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  left: groupCenterX - groupGuideLength / 2,
                  top: groupCenterY,
                  width: groupGuideLength,
                  height: 1,
                  transformOrigin: "center center",
                  transform: `rotate(${groupRotationDisplay}deg)`,
                  backgroundColor: HANDLE_COLOR,
                  opacity: 0.8,
                  pointerEvents: "none"
                }
              }
            )
          ] }),
          effectiveIsRotatable && rotationHandle && ((rotationUI == null ? void 0 : rotationUI.component) ? /* @__PURE__ */ jsx(
            "div",
            {
              onPointerEnter: () => setIsHandleHovered(true),
              onPointerLeave: () => {
                setIsHandleHovered(false);
                setCursorScreen(null);
              },
              onPointerMove: (e) => {
                if (!rotationActive) setCursorScreen({ x: e.clientX, y: e.clientY });
              },
              style: { display: "contents" },
              children: rotationUI.component({
                ...rotationHandle.handle,
                backgroundColor: ROTATION_COLOR,
                iconColor: ROTATION_ICON_COLOR,
                connectorStyle: {
                  ...rotationHandle.connector.style,
                  backgroundColor: ROTATION_CONNECTOR_COLOR,
                  opacity: rotationActive ? 0 : 1
                },
                showConnector: SHOW_CONNECTOR,
                opacity: rotationActive ? 0 : 1,
                border: {
                  color: ROTATION_BORDER_COLOR,
                  width: ROTATION_BORDER_WIDTH,
                  style: ROTATION_BORDER_STYLE
                }
              })
            }
          ) : /* @__PURE__ */ jsxs(
            "div",
            {
              onPointerEnter: () => setIsHandleHovered(true),
              onPointerLeave: () => {
                setIsHandleHovered(false);
                setCursorScreen(null);
              },
              onPointerMove: (e) => {
                if (!rotationActive) setCursorScreen({ x: e.clientX, y: e.clientY });
              },
              style: { display: "contents" },
              children: [
                SHOW_CONNECTOR && /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      ...rotationHandle.connector.style,
                      backgroundColor: ROTATION_CONNECTOR_COLOR,
                      opacity: rotationActive ? 0 : 1
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    ...rotationHandle.handle,
                    style: {
                      ...rotationHandle.handle.style,
                      backgroundColor: ROTATION_COLOR,
                      border: `${ROTATION_BORDER_WIDTH}px ${ROTATION_BORDER_STYLE} ${ROTATION_BORDER_COLOR}`,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "auto",
                      opacity: rotationActive ? 0 : 1
                    },
                    children: /* @__PURE__ */ jsxs(
                      "svg",
                      {
                        width: Math.round(ROTATION_SIZE * 0.6),
                        height: Math.round(ROTATION_SIZE * 0.6),
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: ROTATION_ICON_COLOR,
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: [
                          /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }),
                          /* @__PURE__ */ jsx("path", { d: "M21 3v5h-5" })
                        ]
                      }
                    )
                  }
                )
              ]
            }
          )),
          /* @__PURE__ */ jsx(
            "div",
            {
              ...effectiveIsDraggable ? dragProps : {
                onPointerDown: (e) => e.stopPropagation()
              },
              style: {
                position: "absolute",
                left: 0,
                top: 0,
                width: groupBoxWidth,
                height: groupBoxHeight,
                outline: rotationActive ? "none" : `${outlineWidth}px ${outlineStyleVal} ${outlineColor}`,
                outlineOffset: outlineOff - 1,
                cursor: effectiveIsDraggable ? "move" : "default",
                touchAction: "none",
                pointerEvents: "auto"
              },
              children: effectiveIsResizable && !rotationActive && resize.map(
                ({ key, ...hProps }) => (resizeUI == null ? void 0 : resizeUI.component) ? resizeUI.component({
                  key,
                  ...hProps,
                  backgroundColor: HANDLE_COLOR
                }) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    ...hProps,
                    style: { ...hProps.style, backgroundColor: HANDLE_COLOR }
                  },
                  key
                )
              )
            }
          )
        ]
      }
    ),
    (rotationActive || isHandleHovered) && cursorScreen && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            position: "fixed",
            left: cursorScreen.x + 16,
            top: cursorScreen.y - 16,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 1e4,
            whiteSpace: "nowrap"
          },
          children: [
            normalizedRotationDisplay.toFixed(0),
            "°"
          ]
        }
      ),
      document.body
    ),
    groupSelectionMenu && !rotationActive && /* @__PURE__ */ jsx(
      CounterRotate,
      {
        rect: {
          origin: {
            x: groupBoxLeft,
            y: groupBoxTop
          },
          size: {
            width: groupBoxWidth,
            height: groupBoxHeight
          }
        },
        rotation,
        children: (counterRotateProps) => {
          const effectiveAngle = ((groupRotationDisplay + rotation * 90) % 360 + 360) % 360;
          const handleNearMenuSide = effectiveIsRotatable && effectiveAngle > 90 && effectiveAngle < 270;
          return groupSelectionMenu({
            ...counterRotateProps,
            context: {
              type: "group",
              annotations: selectedAnnotations,
              pageIndex
            },
            selected: true,
            placement: {
              suggestTop: handleNearMenuSide
            }
          });
        }
      }
    )
  ] });
}
function createRenderer(entry) {
  return {
    id: entry.id,
    matches: entry.matches ? (annotation) => entry.matches(annotation) : () => false,
    render: entry.render ? (props) => entry.render(props) : () => null,
    matchesPreview: entry.matchesPreview,
    renderPreview: entry.renderPreview ? (props) => entry.renderPreview(props) : void 0,
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
    hiddenWhenLocked: entry.hiddenWhenLocked,
    renderLocked: entry.renderLocked ? (props) => entry.renderLocked(props) : void 0
  };
}
const MIN_HIT_AREA_SCREEN_PX$6 = 20;
function Ink({
  isSelected,
  strokeColor,
  opacity = 1,
  strokeWidth,
  inkList,
  rect,
  scale,
  onClick,
  appearanceActive = false
}) {
  const resolvedColor = strokeColor ?? "#000000";
  const paths = useMemo(() => {
    return inkList.map(({ points }) => {
      let d = "";
      points.forEach(({ x, y }, i) => {
        const lx = x - rect.origin.x;
        const ly = y - rect.origin.y;
        d += (i === 0 ? "M" : "L") + lx + " " + ly + " ";
      });
      return d.trim();
    });
  }, [inkList, rect]);
  const width = rect.size.width * scale;
  const height = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$6 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible"
      },
      width,
      height,
      viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
      children: [
        paths.map((d, i) => /* @__PURE__ */ jsx(
          "path",
          {
            d,
            fill: "none",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : "visibleStroke",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          },
          `hit-${i}`
        )),
        !appearanceActive && paths.map((d, i) => /* @__PURE__ */ jsx(
          "path",
          {
            d,
            fill: "none",
            opacity,
            style: {
              pointerEvents: "none",
              stroke: resolvedColor,
              strokeWidth,
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          },
          `vis-${i}`
        ))
      ]
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX$5 = 20;
function Square({
  isSelected,
  color = "#000000",
  strokeColor,
  opacity = 1,
  strokeWidth,
  strokeStyle = PdfAnnotationBorderStyle.SOLID,
  strokeDashArray,
  rect,
  scale,
  onClick,
  appearanceActive = false,
  cloudyBorderIntensity,
  rectangleDifferences
}) {
  const isCloudy = (cloudyBorderIntensity ?? 0) > 0;
  const { width, height, x, y } = useMemo(() => {
    const outerW = rect.size.width;
    const outerH = rect.size.height;
    const innerW = Math.max(outerW - strokeWidth, 0);
    const innerH = Math.max(outerH - strokeWidth, 0);
    return {
      width: innerW,
      height: innerH,
      x: strokeWidth / 2,
      y: strokeWidth / 2
    };
  }, [rect, strokeWidth]);
  const cloudyPath = useMemo(() => {
    if (!isCloudy) return null;
    return generateCloudyRectanglePath(
      { x: 0, y: 0, width: rect.size.width, height: rect.size.height },
      rectangleDifferences,
      cloudyBorderIntensity,
      strokeWidth
    );
  }, [isCloudy, rect, rectangleDifferences, cloudyBorderIntensity, strokeWidth]);
  const svgWidth = rect.size.width * scale;
  const svgHeight = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$5 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
        zIndex: 2
      },
      width: svgWidth,
      height: svgHeight,
      viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
      overflow: "visible",
      children: [
        isCloudy && cloudyPath ? /* @__PURE__ */ jsx(
          "path",
          {
            d: cloudyPath.path,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : color === "transparent" ? "visibleStroke" : "visible"
            }
          }
        ) : /* @__PURE__ */ jsx(
          "rect",
          {
            x,
            y,
            width,
            height,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : color === "transparent" ? "visibleStroke" : "visible"
            }
          }
        ),
        !appearanceActive && (isCloudy && cloudyPath ? /* @__PURE__ */ jsx(
          "path",
          {
            d: cloudyPath.path,
            fill: color,
            opacity,
            style: {
              pointerEvents: "none",
              stroke: strokeColor ?? color,
              strokeWidth,
              strokeLinejoin: "round"
            }
          }
        ) : /* @__PURE__ */ jsx(
          "rect",
          {
            x,
            y,
            width,
            height,
            fill: color,
            opacity,
            style: {
              pointerEvents: "none",
              stroke: strokeColor ?? color,
              strokeWidth,
              ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
              }
            }
          }
        ))
      ]
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX$4 = 20;
function Circle({
  color = "#000000",
  strokeColor,
  opacity = 1,
  strokeWidth,
  strokeStyle = PdfAnnotationBorderStyle.SOLID,
  strokeDashArray,
  rect,
  scale,
  onClick,
  isSelected,
  appearanceActive = false,
  cloudyBorderIntensity,
  rectangleDifferences
}) {
  const isCloudy = (cloudyBorderIntensity ?? 0) > 0;
  const { width, height, cx, cy, rx, ry } = useMemo(() => {
    const outerW = rect.size.width;
    const outerH = rect.size.height;
    const innerW = Math.max(outerW - strokeWidth, 0);
    const innerH = Math.max(outerH - strokeWidth, 0);
    return {
      width: outerW,
      height: outerH,
      cx: strokeWidth / 2 + innerW / 2,
      cy: strokeWidth / 2 + innerH / 2,
      rx: innerW / 2,
      ry: innerH / 2
    };
  }, [rect, strokeWidth]);
  const cloudyPath = useMemo(() => {
    if (!isCloudy) return null;
    return generateCloudyEllipsePath(
      { x: 0, y: 0, width: rect.size.width, height: rect.size.height },
      rectangleDifferences,
      cloudyBorderIntensity,
      strokeWidth
    );
  }, [isCloudy, rect, rectangleDifferences, cloudyBorderIntensity, strokeWidth]);
  const svgWidth = width * scale;
  const svgHeight = height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$4 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
        zIndex: 2
      },
      width: svgWidth,
      height: svgHeight,
      viewBox: `0 0 ${width} ${height}`,
      overflow: "visible",
      children: [
        isCloudy && cloudyPath ? /* @__PURE__ */ jsx(
          "path",
          {
            d: cloudyPath.path,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : color === "transparent" ? "visibleStroke" : "visible"
            }
          }
        ) : /* @__PURE__ */ jsx(
          "ellipse",
          {
            cx,
            cy,
            rx,
            ry,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : color === "transparent" ? "visibleStroke" : "visible"
            }
          }
        ),
        !appearanceActive && (isCloudy && cloudyPath ? /* @__PURE__ */ jsx(
          "path",
          {
            d: cloudyPath.path,
            fill: color,
            opacity,
            style: {
              pointerEvents: "none",
              stroke: strokeColor ?? color,
              strokeWidth,
              strokeLinejoin: "round"
            }
          }
        ) : /* @__PURE__ */ jsx(
          "ellipse",
          {
            cx,
            cy,
            rx,
            ry,
            fill: color,
            opacity,
            style: {
              pointerEvents: "none",
              stroke: strokeColor ?? color,
              strokeWidth,
              ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
              }
            }
          }
        ))
      ]
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX$3 = 20;
function Line({
  color = "transparent",
  opacity = 1,
  strokeWidth,
  strokeColor = "#000000",
  strokeStyle = PdfAnnotationBorderStyle.SOLID,
  strokeDashArray,
  rect,
  linePoints,
  lineEndings,
  scale,
  onClick,
  isSelected,
  appearanceActive = false
}) {
  const { x1, y1, x2, y2 } = useMemo(() => {
    return {
      x1: linePoints.start.x - rect.origin.x,
      y1: linePoints.start.y - rect.origin.y,
      x2: linePoints.end.x - rect.origin.x,
      y2: linePoints.end.y - rect.origin.y
    };
  }, [linePoints, rect]);
  const endings = useMemo(() => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    return {
      start: patching.createEnding(lineEndings == null ? void 0 : lineEndings.start, strokeWidth, angle + Math.PI, x1, y1),
      end: patching.createEnding(lineEndings == null ? void 0 : lineEndings.end, strokeWidth, angle, x2, y2)
    };
  }, [lineEndings, strokeWidth, x1, y1, x2, y2]);
  const width = rect.size.width * scale;
  const height = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$3 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible"
      },
      width,
      height,
      viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
      children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1,
            y1,
            x2,
            y2,
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : "visibleStroke",
              strokeLinecap: "butt"
            }
          }
        ),
        endings.start && /* @__PURE__ */ jsx(
          "path",
          {
            d: endings.start.d,
            transform: endings.start.transform,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : endings.start.filled ? "visible" : "visibleStroke",
              strokeLinecap: "butt"
            }
          }
        ),
        endings.end && /* @__PURE__ */ jsx(
          "path",
          {
            d: endings.end.d,
            transform: endings.end.transform,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : endings.end.filled ? "visible" : "visibleStroke",
              strokeLinecap: "butt"
            }
          }
        ),
        !appearanceActive && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "line",
            {
              x1,
              y1,
              x2,
              y2,
              opacity,
              style: {
                pointerEvents: "none",
                stroke: strokeColor,
                strokeWidth,
                strokeLinecap: "butt",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          ),
          endings.start && /* @__PURE__ */ jsx(
            "path",
            {
              d: endings.start.d,
              transform: endings.start.transform,
              stroke: strokeColor,
              fill: endings.start.filled ? color : "none",
              style: {
                pointerEvents: "none",
                strokeWidth,
                strokeLinecap: "butt",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          ),
          endings.end && /* @__PURE__ */ jsx(
            "path",
            {
              d: endings.end.d,
              transform: endings.end.transform,
              stroke: strokeColor,
              fill: endings.end.filled ? color : "none",
              style: {
                pointerEvents: "none",
                strokeWidth,
                strokeLinecap: "butt",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          )
        ] })
      ]
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX$2 = 20;
function Polyline({
  rect,
  vertices,
  color = "transparent",
  strokeColor = "#000000",
  opacity = 1,
  strokeWidth,
  strokeStyle = PdfAnnotationBorderStyle.SOLID,
  strokeDashArray,
  scale,
  isSelected,
  onClick,
  lineEndings,
  appearanceActive = false
}) {
  const localPts = useMemo(
    () => vertices.map(({ x, y }) => ({ x: x - rect.origin.x, y: y - rect.origin.y })),
    [vertices, rect]
  );
  const pathData = useMemo(() => {
    if (!localPts.length) return "";
    const [first, ...rest] = localPts;
    return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y} `).join("").trim();
  }, [localPts]);
  const endings = useMemo(() => {
    if (localPts.length < 2) return { start: null, end: null };
    const toAngle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
    const startRad = toAngle(localPts[0], localPts[1]);
    const endRad = toAngle(localPts[localPts.length - 2], localPts[localPts.length - 1]);
    const start = patching.createEnding(
      lineEndings == null ? void 0 : lineEndings.start,
      strokeWidth,
      startRad + Math.PI,
      localPts[0].x,
      localPts[0].y
    );
    const end = patching.createEnding(
      lineEndings == null ? void 0 : lineEndings.end,
      strokeWidth,
      endRad,
      localPts[localPts.length - 1].x,
      localPts[localPts.length - 1].y
    );
    return { start, end };
  }, [localPts, lineEndings, strokeWidth]);
  const width = rect.size.width * scale;
  const height = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$2 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible"
      },
      width,
      height,
      viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: pathData,
            fill: "none",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : "visibleStroke",
              strokeLinecap: "butt",
              strokeLinejoin: "miter"
            }
          }
        ),
        endings.start && /* @__PURE__ */ jsx(
          "path",
          {
            d: endings.start.d,
            transform: endings.start.transform,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : endings.start.filled ? "visible" : "visibleStroke",
              strokeLinecap: "butt"
            }
          }
        ),
        endings.end && /* @__PURE__ */ jsx(
          "path",
          {
            d: endings.end.d,
            transform: endings.end.transform,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : endings.end.filled ? "visible" : "visibleStroke",
              strokeLinecap: "butt"
            }
          }
        ),
        !appearanceActive && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "path",
            {
              d: pathData,
              opacity,
              style: {
                fill: "none",
                stroke: strokeColor ?? color,
                strokeWidth,
                pointerEvents: "none",
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          ),
          endings.start && /* @__PURE__ */ jsx(
            "path",
            {
              d: endings.start.d,
              transform: endings.start.transform,
              stroke: strokeColor,
              fill: endings.start.filled ? color : "none",
              style: {
                pointerEvents: "none",
                strokeWidth,
                strokeLinecap: "butt",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          ),
          endings.end && /* @__PURE__ */ jsx(
            "path",
            {
              d: endings.end.d,
              transform: endings.end.transform,
              stroke: strokeColor,
              fill: endings.end.filled ? color : "none",
              style: {
                pointerEvents: "none",
                strokeWidth,
                strokeLinecap: "butt",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          )
        ] })
      ]
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX$1 = 20;
function Polygon({
  rect,
  vertices,
  color = "transparent",
  strokeColor = "#000000",
  opacity = 1,
  strokeWidth,
  strokeStyle = PdfAnnotationBorderStyle.SOLID,
  strokeDashArray,
  scale,
  isSelected,
  onClick,
  currentVertex,
  handleSize = 14,
  appearanceActive = false,
  cloudyBorderIntensity
}) {
  const isCloudy = (cloudyBorderIntensity ?? 0) > 0;
  const allPoints = currentVertex ? [...vertices, currentVertex] : vertices;
  const localPts = useMemo(
    () => allPoints.map(({ x, y }) => ({ x: x - rect.origin.x, y: y - rect.origin.y })),
    [allPoints, rect]
  );
  const pathData = useMemo(() => {
    if (!localPts.length) return "";
    const [first, ...rest] = localPts;
    const isPreview = !!currentVertex;
    return (`M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ") + (isPreview ? "" : " Z")).trim();
  }, [localPts, currentVertex]);
  const cloudyPath = useMemo(() => {
    if (!isCloudy || allPoints.length < 3) return null;
    return generateCloudyPolygonPath(allPoints, rect.origin, cloudyBorderIntensity, strokeWidth);
  }, [isCloudy, allPoints, rect.origin, cloudyBorderIntensity, strokeWidth]);
  const isPreviewing = currentVertex && vertices.length > 0;
  const width = rect.size.width * scale;
  const height = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX$1 / scale);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible"
      },
      width,
      height,
      viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: isCloudy && cloudyPath ? cloudyPath.path : pathData,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: hitStrokeWidth,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : color === "transparent" ? "visibleStroke" : "visible",
              strokeLinecap: "butt",
              strokeLinejoin: "miter"
            }
          }
        ),
        !appearanceActive && /* @__PURE__ */ jsx(Fragment, { children: isCloudy && cloudyPath ? /* @__PURE__ */ jsx(
          "path",
          {
            d: cloudyPath.path,
            opacity,
            style: {
              fill: color,
              stroke: strokeColor ?? color,
              strokeWidth,
              pointerEvents: "none",
              strokeLinejoin: "round"
            }
          }
        ) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "path",
            {
              d: pathData,
              opacity,
              style: {
                fill: currentVertex ? "none" : color,
                stroke: strokeColor ?? color,
                strokeWidth,
                pointerEvents: "none",
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                ...strokeStyle === PdfAnnotationBorderStyle.DASHED && {
                  strokeDasharray: strokeDashArray == null ? void 0 : strokeDashArray.join(",")
                }
              }
            }
          ),
          isPreviewing && vertices.length > 1 && /* @__PURE__ */ jsx(
            "path",
            {
              d: `M ${localPts[localPts.length - 1].x} ${localPts[localPts.length - 1].y} L ${localPts[0].x} ${localPts[0].y}`,
              fill: "none",
              style: {
                stroke: strokeColor,
                strokeWidth,
                strokeDasharray: "4,4",
                opacity: 0.7,
                pointerEvents: "none"
              }
            }
          ),
          isPreviewing && vertices.length >= 2 && /* @__PURE__ */ jsx(
            "rect",
            {
              x: localPts[0].x - handleSize / scale / 2,
              y: localPts[0].y - handleSize / scale / 2,
              width: handleSize / scale,
              height: handleSize / scale,
              fill: strokeColor,
              opacity: 0.4,
              stroke: strokeColor,
              strokeWidth: strokeWidth / 2,
              style: { pointerEvents: "none" }
            }
          )
        ] }) })
      ]
    }
  );
}
function Text({
  isSelected,
  color = "#facc15",
  opacity = 1,
  onClick,
  appearanceActive = false
}) {
  const lineColor = getContrastStrokeColor(color);
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: !onClick ? "none" : isSelected ? "none" : "auto",
        cursor: isSelected ? "move" : onClick ? "pointer" : "default"
      },
      onPointerDown: onClick,
      children: !appearanceActive && /* @__PURE__ */ jsxs(
        "svg",
        {
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none"
          },
          viewBox: "0 0 20 20",
          width: "100%",
          height: "100%",
          children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: "M 0.5 15.5 L 0.5 0.5 L 19.5 0.5 L 19.5 15.5 L 8.5 15.5 L 6.5 19.5 L 4.5 15.5 Z",
                fill: color,
                opacity,
                stroke: lineColor,
                strokeWidth: "1",
                strokeLinejoin: "miter"
              }
            ),
            /* @__PURE__ */ jsx("line", { x1: "2.5", y1: "4.25", x2: "17.5", y2: "4.25", stroke: lineColor, strokeWidth: "1" }),
            /* @__PURE__ */ jsx("line", { x1: "2.5", y1: "8", x2: "17.5", y2: "8", stroke: lineColor, strokeWidth: "1" }),
            /* @__PURE__ */ jsx("line", { x1: "2.5", y1: "11.75", x2: "17.5", y2: "11.75", stroke: lineColor, strokeWidth: "1" })
          ]
        }
      )
    }
  );
}
function FreeText({
  documentId,
  isSelected,
  isEditing,
  annotation,
  pageIndex,
  scale,
  onClick,
  appearanceActive = false
}) {
  const editorRef = useRef(null);
  const editingRef = useRef(false);
  const { provides: annotationCapability } = useAnnotationCapability();
  const annotationProvides = (annotationCapability == null ? void 0 : annotationCapability.forDocument(documentId)) ?? null;
  const { adjustedFontPx, wrapperStyle } = useIOSZoomPrevention(
    annotation.object.fontSize * scale,
    isEditing
  );
  useEffect(() => {
    var _a;
    if (isEditing && editorRef.current) {
      editingRef.current = true;
      const editor = editorRef.current;
      editor.focus();
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(annotation.object);
      const isDefaultContent = ((_a = tool == null ? void 0 : tool.defaults) == null ? void 0 : _a.contents) != null && annotation.object.contents === tool.defaults.contents;
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
    }
  }, [isEditing]);
  const handleBlur = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    if (!annotationProvides) return;
    if (!editorRef.current) return;
    annotationProvides.updateAnnotation(pageIndex, annotation.object.id, {
      contents: editorRef.current.innerText.replace(/\u00A0/g, " ")
    });
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        width: annotation.object.rect.size.width * scale,
        height: annotation.object.rect.size.height * scale,
        cursor: isSelected && !isEditing ? "move" : "default",
        pointerEvents: !onClick ? "none" : isSelected && !isEditing ? "none" : "auto",
        zIndex: 2,
        opacity: appearanceActive ? 0 : 1
      },
      onPointerDown: onClick,
      children: /* @__PURE__ */ jsx(
        "span",
        {
          ref: editorRef,
          onBlur: handleBlur,
          tabIndex: 0,
          style: {
            color: annotation.object.fontColor,
            fontSize: adjustedFontPx,
            ...standardFontCssProperties(annotation.object.fontFamily),
            textAlign: textAlignmentToCss(annotation.object.textAlign),
            flexDirection: "column",
            justifyContent: annotation.object.verticalAlign === PdfVerticalAlignment.Top ? "flex-start" : annotation.object.verticalAlign === PdfVerticalAlignment.Middle ? "center" : "flex-end",
            display: "flex",
            backgroundColor: annotation.object.color ?? annotation.object.backgroundColor,
            opacity: annotation.object.opacity,
            width: "100%",
            height: "100%",
            lineHeight: "1.18",
            overflow: "hidden",
            cursor: isEditing ? "text" : onClick ? "pointer" : "default",
            outline: "none",
            ...wrapperStyle
          },
          contentEditable: isEditing,
          ...suppressContentEditableWarningProps,
          children: annotation.object.contents
        }
      )
    }
  );
}
const MIN_HIT_AREA_SCREEN_PX = 20;
function CalloutFreeText({
  documentId,
  isSelected,
  isEditing,
  annotation,
  pageIndex,
  scale,
  onClick,
  appearanceActive = false
}) {
  const editorRef = useRef(null);
  const editingRef = useRef(false);
  const { provides: annotationCapability } = useAnnotationCapability();
  const annotationProvides = (annotationCapability == null ? void 0 : annotationCapability.forDocument(documentId)) ?? null;
  const obj = annotation.object;
  const rect = obj.rect;
  const rd = obj.rectangleDifferences;
  const calloutLine = obj.calloutLine;
  const strokeWidth = obj.strokeWidth ?? 1;
  const strokeColor = obj.strokeColor ?? "#000000";
  const textBox = useMemo(() => patching.computeTextBoxFromRD(rect, rd), [rect, rd]);
  const textBoxRelative = useMemo(
    () => ({
      left: (textBox.origin.x - rect.origin.x + strokeWidth / 2) * scale,
      top: (textBox.origin.y - rect.origin.y + strokeWidth / 2) * scale,
      width: (textBox.size.width - strokeWidth) * scale,
      height: (textBox.size.height - strokeWidth) * scale
    }),
    [textBox, rect, scale, strokeWidth]
  );
  const lineCoords = useMemo(() => {
    if (!calloutLine || calloutLine.length < 3) return null;
    return calloutLine.map((p) => ({
      x: p.x - rect.origin.x,
      y: p.y - rect.origin.y
    }));
  }, [calloutLine, rect]);
  const ending = useMemo(() => {
    if (!lineCoords || lineCoords.length < 2) return null;
    const angle = Math.atan2(lineCoords[1].y - lineCoords[0].y, lineCoords[1].x - lineCoords[0].x);
    return patching.createEnding(
      obj.lineEnding,
      strokeWidth,
      angle + Math.PI,
      lineCoords[0].x,
      lineCoords[0].y
    );
  }, [lineCoords, obj.lineEnding, strokeWidth]);
  const visualLineCoords = useMemo(() => {
    if (!lineCoords || lineCoords.length < 2) return lineCoords;
    const pts = lineCoords.map((p) => ({ ...p }));
    const last = pts.length - 1;
    const prev = last - 1;
    const dx = pts[last].x - pts[prev].x;
    const dy = pts[last].y - pts[prev].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      const halfBw = strokeWidth / 2;
      pts[last].x += dx / len * halfBw;
      pts[last].y += dy / len * halfBw;
    }
    return pts;
  }, [lineCoords, strokeWidth]);
  const { adjustedFontPx, wrapperStyle } = useIOSZoomPrevention(obj.fontSize * scale, isEditing);
  useEffect(() => {
    var _a;
    if (isEditing && editorRef.current) {
      editingRef.current = true;
      const editor = editorRef.current;
      editor.focus();
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(obj);
      const isDefaultContent = ((_a = tool == null ? void 0 : tool.defaults) == null ? void 0 : _a.contents) != null && obj.contents === tool.defaults.contents;
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
    }
  }, [isEditing]);
  const handleBlur = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    if (!annotationProvides) return;
    if (!editorRef.current) return;
    annotationProvides.updateAnnotation(pageIndex, obj.id, {
      contents: editorRef.current.innerText.replace(/\u00A0/g, " ")
    });
  };
  const width = rect.size.width * scale;
  const height = rect.size.height * scale;
  const hitStrokeWidth = Math.max(strokeWidth, MIN_HIT_AREA_SCREEN_PX / scale);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "absolute",
        width,
        height,
        cursor: isSelected && !isEditing ? "move" : "default",
        pointerEvents: "none",
        zIndex: 2,
        opacity: appearanceActive ? 0 : 1
      },
      children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            style: {
              position: "absolute",
              width,
              height,
              pointerEvents: "none",
              overflow: "visible"
            },
            width,
            height,
            viewBox: `0 0 ${rect.size.width} ${rect.size.height}`,
            children: [
              lineCoords && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "polyline",
                  {
                    points: lineCoords.map((p) => `${p.x},${p.y}`).join(" "),
                    fill: "none",
                    stroke: "transparent",
                    strokeWidth: hitStrokeWidth,
                    onPointerDown: onClick ? (e) => onClick(e) : void 0,
                    style: {
                      cursor: isSelected ? "move" : onClick ? "pointer" : "default",
                      pointerEvents: !onClick ? "none" : isSelected ? "none" : "visibleStroke"
                    }
                  }
                ),
                ending && /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: ending.d,
                    transform: ending.transform,
                    fill: "transparent",
                    stroke: "transparent",
                    strokeWidth: hitStrokeWidth,
                    onPointerDown: onClick ? (e) => onClick(e) : void 0,
                    style: {
                      cursor: isSelected ? "move" : onClick ? "pointer" : "default",
                      pointerEvents: !onClick ? "none" : isSelected ? "none" : ending.filled ? "visible" : "visibleStroke"
                    }
                  }
                )
              ] }),
              !appearanceActive && /* @__PURE__ */ jsxs(Fragment, { children: [
                visualLineCoords && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "polyline",
                    {
                      points: visualLineCoords.map((p) => `${p.x},${p.y}`).join(" "),
                      fill: "none",
                      stroke: strokeColor,
                      strokeWidth,
                      opacity: obj.opacity,
                      style: { pointerEvents: "none" }
                    }
                  ),
                  ending && /* @__PURE__ */ jsx(
                    "path",
                    {
                      d: ending.d,
                      transform: ending.transform,
                      stroke: strokeColor,
                      fill: ending.filled ? obj.color ?? "transparent" : "none",
                      strokeWidth,
                      opacity: obj.opacity,
                      style: { pointerEvents: "none" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "rect",
                  {
                    x: textBox.origin.x - rect.origin.x + strokeWidth / 2,
                    y: textBox.origin.y - rect.origin.y + strokeWidth / 2,
                    width: textBox.size.width - strokeWidth,
                    height: textBox.size.height - strokeWidth,
                    fill: obj.color ?? obj.backgroundColor ?? "transparent",
                    stroke: strokeColor,
                    strokeWidth,
                    opacity: obj.opacity,
                    style: { pointerEvents: "none" }
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            onPointerDown: onClick ? (e) => onClick(e) : void 0,
            style: {
              position: "absolute",
              left: (textBox.origin.x - rect.origin.x) * scale,
              top: (textBox.origin.y - rect.origin.y) * scale,
              width: textBox.size.width * scale,
              height: textBox.size.height * scale,
              cursor: isSelected && !isEditing ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected && !isEditing ? "none" : "auto"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "span",
          {
            ref: editorRef,
            onBlur: handleBlur,
            tabIndex: 0,
            style: {
              position: "absolute",
              left: textBoxRelative.left,
              top: textBoxRelative.top,
              width: textBoxRelative.width,
              height: textBoxRelative.height,
              color: obj.fontColor,
              fontSize: adjustedFontPx,
              ...standardFontCssProperties(obj.fontFamily),
              textAlign: textAlignmentToCss(obj.textAlign),
              flexDirection: "column",
              justifyContent: obj.verticalAlign === PdfVerticalAlignment.Top ? "flex-start" : obj.verticalAlign === PdfVerticalAlignment.Middle ? "center" : "flex-end",
              display: "flex",
              padding: strokeWidth * scale / 2 + 2 * scale,
              opacity: obj.opacity,
              lineHeight: "1.18",
              overflow: "hidden",
              cursor: isEditing ? "text" : "default",
              outline: "none",
              pointerEvents: isEditing ? "auto" : "none",
              ...wrapperStyle
            },
            contentEditable: isEditing,
            ...suppressContentEditableWarningProps,
            children: obj.contents
          }
        )
      ]
    }
  );
}
function CalloutFreeTextPreview({
  calloutLine,
  textBox,
  bounds,
  scale,
  strokeColor,
  strokeWidth,
  color,
  backgroundColor,
  opacity,
  lineEnding
}) {
  if (!calloutLine || calloutLine.length < 2) return /* @__PURE__ */ jsx(Fragment$1, {});
  const sw = strokeWidth ?? 1;
  const sc = strokeColor ?? "#000000";
  const op = opacity ?? 1;
  const w = bounds.size.width;
  const h = bounds.size.height;
  const ox = bounds.origin.x;
  const oy = bounds.origin.y;
  const lineCoords = calloutLine.map((p) => ({ x: p.x - ox, y: p.y - oy }));
  const angle = Math.atan2(lineCoords[1].y - lineCoords[0].y, lineCoords[1].x - lineCoords[0].x);
  const ending = patching.createEnding(
    lineEnding,
    sw,
    angle + Math.PI,
    lineCoords[0].x,
    lineCoords[0].y
  );
  const halfSw = sw / 2;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width: w * scale,
        height: h * scale,
        pointerEvents: "none",
        overflow: "visible"
      },
      width: w * scale,
      height: h * scale,
      viewBox: `0 0 ${w} ${h}`,
      children: [
        /* @__PURE__ */ jsx(
          "polyline",
          {
            points: lineCoords.map((p) => `${p.x},${p.y}`).join(" "),
            fill: "none",
            stroke: sc,
            strokeWidth: sw,
            opacity: op
          }
        ),
        ending && /* @__PURE__ */ jsx(
          "path",
          {
            d: ending.d,
            transform: ending.transform,
            stroke: sc,
            fill: ending.filled ? color ?? "transparent" : "none",
            strokeWidth: sw,
            opacity: op
          }
        ),
        textBox && /* @__PURE__ */ jsx(
          "rect",
          {
            x: textBox.origin.x - ox + halfSw,
            y: textBox.origin.y - oy + halfSw,
            width: textBox.size.width - sw,
            height: textBox.size.height - sw,
            fill: color ?? backgroundColor ?? "transparent",
            stroke: sc,
            strokeWidth: sw,
            opacity: op
          }
        )
      ]
    }
  );
}
function RenderAnnotation({
  documentId,
  pageIndex,
  annotation,
  scaleFactor = 1,
  unrotated,
  style,
  ...props
}) {
  const { provides: annotationProvides } = useAnnotationCapability();
  const [imageUrl, setImageUrl] = useState(null);
  const urlRef = useRef(null);
  const { width, height } = annotation.rect.size;
  useEffect(() => {
    if (annotationProvides) {
      const task = annotationProvides.forDocument(documentId).renderAnnotation({
        pageIndex,
        annotation,
        options: {
          scaleFactor,
          dpr: window.devicePixelRatio,
          unrotated
        }
      });
      task.wait((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        urlRef.current = url;
      }, ignore);
      return () => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
          urlRef.current = null;
        } else {
          task.abort({
            code: PdfErrorCode.Cancelled,
            message: "canceled render task"
          });
        }
      };
    }
  }, [
    pageIndex,
    scaleFactor,
    unrotated,
    annotationProvides,
    documentId,
    annotation.id,
    width,
    height
  ]);
  const handleImageLoad = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };
  return /* @__PURE__ */ jsx(Fragment$1, { children: imageUrl && /* @__PURE__ */ jsx(
    "img",
    {
      src: imageUrl,
      onLoad: handleImageLoad,
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
function Stamp({
  isSelected,
  annotation,
  documentId,
  pageIndex,
  scale,
  onClick
}) {
  const unrotated = !!annotation.object.rotation && !!annotation.object.unrotatedRect;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 2,
        pointerEvents: !onClick ? "none" : isSelected ? "none" : "auto",
        cursor: onClick ? "pointer" : "default"
      },
      onPointerDown: onClick,
      children: /* @__PURE__ */ jsx(
        RenderAnnotation,
        {
          documentId,
          pageIndex,
          annotation: { ...annotation.object, id: annotation.object.id },
          scaleFactor: scale,
          unrotated
        }
      )
    }
  );
}
function Link({
  isSelected,
  strokeColor = "#0000FF",
  strokeWidth = 2,
  strokeStyle = PdfAnnotationBorderStyle.UNDERLINE,
  strokeDashArray,
  rect,
  scale,
  onClick,
  hasIRT = false
}) {
  const { width, height } = useMemo(() => {
    return {
      width: rect.size.width,
      height: rect.size.height
    };
  }, [rect]);
  const svgWidth = width * scale;
  const svgHeight = height * scale;
  const dashArray = useMemo(() => {
    if (strokeStyle === PdfAnnotationBorderStyle.DASHED) {
      return (strokeDashArray == null ? void 0 : strokeDashArray.join(",")) ?? `${strokeWidth * 3},${strokeWidth}`;
    }
    return void 0;
  }, [strokeStyle, strokeDashArray, strokeWidth]);
  const isUnderline = strokeStyle === PdfAnnotationBorderStyle.UNDERLINE;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
        zIndex: 2
      },
      width: svgWidth,
      height: svgHeight,
      viewBox: `0 0 ${width} ${height}`,
      children: [
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 0,
            y: 0,
            width,
            height,
            fill: "transparent",
            onPointerDown: hasIRT ? void 0 : onClick,
            style: {
              cursor: hasIRT || !onClick ? "default" : isSelected ? "move" : "pointer",
              pointerEvents: hasIRT || !onClick ? "none" : isSelected ? "none" : "visible"
            }
          }
        ),
        isUnderline ? (
          // Underline style: line at bottom of rect
          /* @__PURE__ */ jsx(
            "line",
            {
              x1: 1,
              y1: height - 1,
              x2: width - 1,
              y2: height - 1,
              stroke: strokeColor,
              strokeWidth,
              strokeDasharray: dashArray,
              style: {
                pointerEvents: "none"
              }
            }
          )
        ) : (
          // Solid/Dashed style: rectangle border
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: strokeWidth / 2,
              y: strokeWidth / 2,
              width: Math.max(width - strokeWidth, 0),
              height: Math.max(height - strokeWidth, 0),
              fill: "transparent",
              stroke: strokeColor,
              strokeWidth,
              strokeDasharray: dashArray,
              style: {
                pointerEvents: "none"
              }
            }
          )
        )
      ]
    }
  );
}
function Highlight({
  strokeColor,
  opacity = 0.5,
  segmentRects,
  rect,
  scale,
  onClick,
  style,
  appearanceActive = false
}) {
  const resolvedColor = strokeColor ?? "#FFFF00";
  return /* @__PURE__ */ jsx(Fragment, { children: segmentRects.map((b, i) => /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: onClick,
      style: {
        position: "absolute",
        left: (rect ? b.origin.x - rect.origin.x : b.origin.x) * scale,
        top: (rect ? b.origin.y - rect.origin.y : b.origin.y) * scale,
        width: b.size.width * scale,
        height: b.size.height * scale,
        background: appearanceActive ? "transparent" : resolvedColor,
        opacity: appearanceActive ? void 0 : opacity,
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "pointer" : "default",
        zIndex: onClick ? 1 : void 0,
        ...style
      }
    },
    i
  )) });
}
function Underline({
  strokeColor,
  opacity = 0.5,
  segmentRects,
  rect,
  scale,
  onClick,
  style,
  appearanceActive = false
}) {
  const resolvedColor = strokeColor ?? "#FFFF00";
  const thickness = 2 * scale;
  return /* @__PURE__ */ jsx(Fragment, { children: segmentRects.map((r, i) => /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: onClick,
      style: {
        position: "absolute",
        left: (rect ? r.origin.x - rect.origin.x : r.origin.x) * scale,
        top: (rect ? r.origin.y - rect.origin.y : r.origin.y) * scale,
        width: r.size.width * scale,
        height: r.size.height * scale,
        background: "transparent",
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "pointer" : "default",
        zIndex: onClick ? 1 : 0,
        ...style
      },
      children: !appearanceActive && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: thickness,
            background: resolvedColor,
            opacity,
            pointerEvents: "none"
          }
        }
      )
    },
    i
  )) });
}
function Strikeout({
  strokeColor,
  opacity = 0.5,
  segmentRects,
  rect,
  scale,
  onClick,
  style,
  appearanceActive = false
}) {
  const resolvedColor = strokeColor ?? "#FFFF00";
  const thickness = 2 * scale;
  return /* @__PURE__ */ jsx(Fragment, { children: segmentRects.map((r, i) => /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: onClick,
      style: {
        position: "absolute",
        left: (rect ? r.origin.x - rect.origin.x : r.origin.x) * scale,
        top: (rect ? r.origin.y - rect.origin.y : r.origin.y) * scale,
        width: r.size.width * scale,
        height: r.size.height * scale,
        background: "transparent",
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "pointer" : "default",
        zIndex: onClick ? 1 : 0,
        ...style
      },
      children: !appearanceActive && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            position: "absolute",
            left: 0,
            top: "50%",
            width: "100%",
            height: thickness,
            background: resolvedColor,
            opacity,
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }
        }
      )
    },
    i
  )) });
}
function Squiggly({
  strokeColor,
  opacity = 0.5,
  segmentRects,
  rect,
  scale,
  onClick,
  style,
  appearanceActive = false
}) {
  const resolvedColor = strokeColor ?? "#FFFF00";
  const amplitude = 2 * scale;
  const period = 6 * scale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${amplitude * 2}" viewBox="0 0 ${period} ${amplitude * 2}">
      <path d="M0 ${amplitude} Q ${period / 4} 0 ${period / 2} ${amplitude} T ${period} ${amplitude}"
            fill="none" stroke="${resolvedColor}" stroke-width="${amplitude}" stroke-linecap="round"/>
    </svg>`;
  const svgDataUri = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return /* @__PURE__ */ jsx(Fragment, { children: segmentRects.map((r, i) => /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: onClick,
      style: {
        position: "absolute",
        left: (rect ? r.origin.x - rect.origin.x : r.origin.x) * scale,
        top: (rect ? r.origin.y - rect.origin.y : r.origin.y) * scale,
        width: r.size.width * scale,
        height: r.size.height * scale,
        background: "transparent",
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "pointer" : "default",
        zIndex: onClick ? 1 : 0,
        ...style
      },
      children: !appearanceActive && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: amplitude * 2,
            backgroundImage: svgDataUri,
            backgroundRepeat: "repeat-x",
            backgroundSize: `${period}px ${amplitude * 2}px`,
            opacity,
            pointerEvents: "none"
          }
        }
      )
    },
    i
  )) });
}
function Caret({
  isSelected,
  strokeColor = "#000000",
  opacity = 1,
  rect,
  scale,
  onClick,
  appearanceActive = false
}) {
  const { width, height, path } = useMemo(() => {
    const w = rect.size.width;
    const h = rect.size.height;
    const midX = w / 2;
    const d = [
      `M 0 ${h}`,
      `C ${w * 0.27} ${h} ${midX} ${h - h * 0.44} ${midX} 0`,
      `C ${midX} ${h - h * 0.44} ${w - w * 0.27} ${h} ${w} ${h}`,
      "Z"
    ].join(" ");
    return { width: w, height: h, path: d };
  }, [rect]);
  const svgWidth = width * scale;
  const svgHeight = height * scale;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      style: {
        position: "absolute",
        width: svgWidth,
        height: svgHeight,
        pointerEvents: "none",
        zIndex: 2
      },
      width: svgWidth,
      height: svgHeight,
      viewBox: `0 0 ${width} ${height}`,
      overflow: "visible",
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: path,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 4,
            onPointerDown: onClick,
            style: {
              cursor: isSelected ? "move" : onClick ? "pointer" : "default",
              pointerEvents: !onClick ? "none" : isSelected ? "none" : "visible"
            }
          }
        ),
        !appearanceActive && /* @__PURE__ */ jsx(
          "path",
          {
            d: path,
            fill: strokeColor,
            stroke: strokeColor,
            strokeWidth: 0.5,
            opacity,
            fillRule: "evenodd",
            style: { pointerEvents: "none" }
          }
        )
      ]
    }
  );
}
function LinkLockedMode({
  annotation,
  documentId
}) {
  const { provides } = useAnnotationCapability();
  const handleClick = useCallback(() => {
    const target = annotation.object.target;
    if (!target || !provides) return;
    provides.forDocument(documentId).navigateTarget(target);
  }, [annotation.object.target, provides, documentId]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      onClick: handleClick,
      style: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        pointerEvents: "auto"
      }
    }
  );
}
const builtInRenderers = [
  // --- Drawing ---
  createRenderer({
    id: "ink",
    matches: (a) => a.type === PdfAnnotationSubtype.INK,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.INK,
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Ink,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Ink, { isSelected: false, scale, ...data }),
    previewContainerStyle: ({ data }) => ({
      mixBlendMode: blendModeToCss(data.blendMode ?? PdfBlendMode.Normal)
    }),
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  // --- Shapes ---
  createRenderer({
    id: "square",
    matches: (a) => a.type === PdfAnnotationSubtype.SQUARE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.SQUARE,
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Square,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Square, { isSelected: false, scale, ...data }),
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  createRenderer({
    id: "circle",
    matches: (a) => a.type === PdfAnnotationSubtype.CIRCLE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.CIRCLE,
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Circle,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Circle, { isSelected: false, scale, ...data }),
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  // --- Lines & Vertex-based ---
  createRenderer({
    id: "line",
    matches: (a) => a.type === PdfAnnotationSubtype.LINE,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.LINE,
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsx(
      Line,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ) }),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Line, { isSelected: false, scale, ...data }),
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
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsx(
      Polyline,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ) }),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Polyline, { isSelected: false, scale, ...data }),
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
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsx(
      Polygon,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ) }),
    renderPreview: ({ data, scale }) => /* @__PURE__ */ jsx(Polygon, { isSelected: false, scale, ...data }),
    vertexConfig: {
      extractVertices: (a) => a.vertices,
      transformAnnotation: (a, vertices) => ({ ...a, vertices })
    },
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: true }
  }),
  // --- Text Markup ---
  createRenderer({
    id: "highlight",
    matches: (a) => a.type === PdfAnnotationSubtype.HIGHLIGHT,
    render: ({ currentObject, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Highlight,
      {
        ...currentObject,
        scale,
        onClick,
        appearanceActive
      }
    ),
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    defaultBlendMode: PdfBlendMode.Multiply
  }),
  createRenderer({
    id: "underline",
    matches: (a) => a.type === PdfAnnotationSubtype.UNDERLINE,
    render: ({ currentObject, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Underline,
      {
        ...currentObject,
        scale,
        onClick,
        appearanceActive
      }
    ),
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "strikeout",
    matches: (a) => a.type === PdfAnnotationSubtype.STRIKEOUT,
    render: ({ currentObject, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Strikeout,
      {
        ...currentObject,
        scale,
        onClick,
        appearanceActive
      }
    ),
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  createRenderer({
    id: "squiggly",
    matches: (a) => a.type === PdfAnnotationSubtype.SQUIGGLY,
    render: ({ currentObject, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Squiggly,
      {
        ...currentObject,
        scale,
        onClick,
        appearanceActive
      }
    ),
    zIndex: 0,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  // --- Text Comment ---
  createRenderer({
    id: "text",
    matches: (a) => a.type === PdfAnnotationSubtype.TEXT && !a.inReplyToId,
    render: ({ currentObject, isSelected, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Text,
      {
        isSelected,
        color: currentObject.strokeColor ?? currentObject.color,
        opacity: currentObject.opacity,
        onClick,
        appearanceActive
      }
    ),
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: false }
  }),
  // --- Caret ---
  createRenderer({
    id: "caret",
    matches: (a) => a.type === PdfAnnotationSubtype.CARET,
    render: ({ currentObject, isSelected, scale, onClick, appearanceActive }) => /* @__PURE__ */ jsx(
      Caret,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        appearanceActive
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false }
  }),
  // --- Callout FreeText (must appear before regular FreeText to match first) ---
  createRenderer({
    id: "freeTextCallout",
    matches: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent === "FreeTextCallout",
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.FREETEXT && !!p.data.calloutLine,
    render: ({
      annotation,
      currentObject,
      isSelected,
      isEditing,
      scale,
      pageIndex,
      documentId,
      onClick,
      appearanceActive
    }) => /* @__PURE__ */ jsx(
      CalloutFreeText,
      {
        documentId,
        isSelected,
        isEditing,
        annotation: { ...annotation, object: currentObject },
        pageIndex,
        scale,
        onClick,
        appearanceActive
      }
    ),
    renderPreview: ({ data, bounds, scale }) => /* @__PURE__ */ jsx(
      CalloutFreeTextPreview,
      {
        calloutLine: data.calloutLine,
        textBox: data.textBox,
        bounds,
        scale,
        strokeColor: data.strokeColor,
        strokeWidth: data.strokeWidth,
        color: data.color,
        backgroundColor: data.backgroundColor,
        opacity: data.opacity,
        lineEnding: data.lineEnding
      }
    ),
    vertexConfig: patching.calloutVertexConfig,
    interactionDefaults: { isDraggable: true, isResizable: false, isRotatable: false },
    isDraggable: (toolDraggable, { isEditing }) => toolDraggable && !isEditing,
    onDoubleClick: (id, setEditingId) => setEditingId(id)
  }),
  // --- FreeText ---
  createRenderer({
    id: "freeText",
    matches: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent !== "FreeTextCallout",
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.FREETEXT && !p.data.calloutLine,
    render: ({
      annotation,
      currentObject,
      isSelected,
      isEditing,
      scale,
      pageIndex,
      documentId,
      onClick,
      appearanceActive
    }) => /* @__PURE__ */ jsx(
      FreeText,
      {
        documentId,
        isSelected,
        isEditing,
        annotation: { ...annotation, object: currentObject },
        pageIndex,
        scale,
        onClick,
        appearanceActive
      }
    ),
    renderPreview: ({ data }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          border: `1px dashed ${data.fontColor || "#000000"}`,
          backgroundColor: "transparent"
        }
      }
    ),
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true },
    isDraggable: (toolDraggable, { isEditing }) => toolDraggable && !isEditing,
    onDoubleClick: (id, setEditingId) => setEditingId(id)
  }),
  // --- Stamp ---
  createRenderer({
    id: "stamp",
    matches: (a) => a.type === PdfAnnotationSubtype.STAMP,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.STAMP,
    render: ({ annotation, isSelected, documentId, pageIndex, scale, onClick }) => /* @__PURE__ */ jsx(
      Stamp,
      {
        isSelected,
        annotation,
        documentId,
        pageIndex,
        scale,
        onClick
      }
    ),
    renderPreview: ({ data }) => {
      const rotationDeg = (4 - data.pageRotation) % 4 * 90;
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: data.ghostUrl,
          style: {
            width: "100%",
            height: "100%",
            opacity: 0.6,
            objectFit: "contain",
            pointerEvents: "none",
            transform: rotationDeg ? `rotate(${rotationDeg}deg)` : void 0
          },
          alt: ""
        }
      );
    },
    useAppearanceStream: false,
    interactionDefaults: { isDraggable: true, isResizable: true, isRotatable: true }
  }),
  // --- Link ---
  createRenderer({
    id: "link",
    matches: (a) => a.type === PdfAnnotationSubtype.LINK,
    matchesPreview: (p) => p.type === PdfAnnotationSubtype.LINK,
    render: ({ currentObject, isSelected, scale, onClick }) => /* @__PURE__ */ jsx(
      Link,
      {
        ...currentObject,
        isSelected,
        scale,
        onClick,
        hasIRT: !!currentObject.inReplyToId
      }
    ),
    renderPreview: ({ data, bounds, scale }) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: bounds.size.width * scale,
          height: bounds.size.height * scale,
          borderBottom: `${data.strokeWidth * scale}px solid ${data.strokeColor}`,
          backgroundColor: "rgba(0, 0, 255, 0.05)",
          boxSizing: "border-box"
        }
      }
    ),
    interactionDefaults: {
      isDraggable: true,
      isResizable: true,
      isRotatable: false
    },
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
    renderLocked: (props) => /* @__PURE__ */ jsx(LinkLockedMode, { ...props })
  })
];
function Annotations(annotationsProps) {
  const { documentId, pageIndex, scale, pageWidth, pageHeight, selectionMenu } = annotationsProps;
  const { provides: annotationCapability } = useAnnotationCapability();
  const { provides: selectionProvides } = useSelectionCapability();
  const [annotations, setAnnotations] = useState([]);
  const { register } = usePointerHandlers({ documentId, pageIndex });
  const [allSelectedIds, setAllSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [appearanceMap, setAppearanceMap] = useState({});
  const [, setLockedMode] = useState({ type: LockModeType.None });
  const prevScaleRef = useRef(scale);
  const annotationProvides = useMemo(
    () => annotationCapability ? annotationCapability.forDocument(documentId) : null,
    [annotationCapability, documentId]
  );
  const isMultiSelected = allSelectedIds.length > 1;
  useEffect(() => {
    if (annotationProvides) {
      const currentState = annotationProvides.getState();
      setAnnotations(getAnnotationsByPageIndex(currentState, pageIndex));
      setAllSelectedIds(getSelectedAnnotationIds(currentState));
      setLockedMode(currentState.locked);
      return annotationProvides.onStateChange((state) => {
        setAnnotations(getAnnotationsByPageIndex(state, pageIndex));
        setAllSelectedIds(getSelectedAnnotationIds(state));
        setLockedMode(state.locked);
      });
    }
  }, [annotationProvides, pageIndex]);
  useEffect(() => {
    if (!annotationProvides) return;
    return annotationProvides.onAnnotationEvent((event) => {
      if (event.type === "create" && event.editAfterCreate) {
        setEditingId(event.annotation.id);
      }
    });
  }, [annotationProvides]);
  useEffect(() => {
    if (!annotationProvides) return;
    if (prevScaleRef.current !== scale) {
      annotationProvides.invalidatePageAppearances(pageIndex);
      prevScaleRef.current = scale;
    }
    const task = annotationProvides.getPageAppearances(pageIndex, {
      scaleFactor: scale,
      dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1
    });
    task.wait(
      (map) => setAppearanceMap(map),
      () => setAppearanceMap({})
    );
  }, [annotationProvides, pageIndex, scale]);
  const handlers = useMemo(
    () => ({
      onPointerDown: (_, pe) => {
        if (pe.target === pe.currentTarget && annotationProvides) {
          if (editingId && annotations.some((a) => a.object.id === editingId)) {
            pe.stopImmediatePropagation();
          }
          annotationProvides.deselectAnnotation();
          setEditingId(null);
        }
      }
    }),
    [annotationProvides, editingId, annotations]
  );
  const handleClick = useCallback(
    (e, annotation) => {
      e.stopPropagation();
      if (annotationProvides && selectionProvides) {
        selectionProvides.clear();
        const isModifierPressed = "metaKey" in e ? e.metaKey || e.ctrlKey : false;
        if (isModifierPressed) {
          annotationProvides.toggleSelection(pageIndex, annotation.object.id);
        } else {
          annotationProvides.selectAnnotation(pageIndex, annotation.object.id);
        }
        if (annotation.object.id !== editingId) {
          setEditingId(null);
        }
      }
    },
    [annotationProvides, selectionProvides, editingId, pageIndex]
  );
  useEffect(() => {
    return register(handlers, {
      documentId
    });
  }, [register, handlers]);
  const selectedAnnotationsOnPage = useMemo(() => {
    return annotations.filter((anno) => allSelectedIds.includes(anno.object.id));
  }, [annotations, allSelectedIds]);
  const areAllSelectedDraggable = useMemo(() => {
    if (selectedAnnotationsOnPage.length < 2) return false;
    return selectedAnnotationsOnPage.every((ta) => {
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(ta.object);
      const groupDraggable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isGroupDraggable,
        ta.object,
        true
      );
      const singleDraggable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isDraggable,
        ta.object,
        true
      );
      return (tool == null ? void 0 : tool.interaction.isGroupDraggable) !== void 0 ? groupDraggable : singleDraggable;
    });
  }, [selectedAnnotationsOnPage, annotationProvides]);
  const areAllSelectedResizable = useMemo(() => {
    if (selectedAnnotationsOnPage.length < 2) return false;
    return selectedAnnotationsOnPage.every((ta) => {
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(ta.object);
      const groupResizable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isGroupResizable,
        ta.object,
        true
      );
      const singleResizable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isResizable,
        ta.object,
        true
      );
      return (tool == null ? void 0 : tool.interaction.isGroupResizable) !== void 0 ? groupResizable : singleResizable;
    });
  }, [selectedAnnotationsOnPage, annotationProvides]);
  const areAllSelectedRotatable = useMemo(() => {
    if (selectedAnnotationsOnPage.length < 2) return false;
    return selectedAnnotationsOnPage.every((ta) => {
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(ta.object);
      const groupRotatable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isGroupRotatable,
        ta.object,
        true
      );
      const singleRotatable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isRotatable,
        ta.object,
        true
      );
      return (tool == null ? void 0 : tool.interaction.isGroupRotatable) !== void 0 ? groupRotatable : singleRotatable;
    });
  }, [selectedAnnotationsOnPage, annotationProvides]);
  const shouldLockGroupAspectRatio = useMemo(() => {
    if (selectedAnnotationsOnPage.length < 2) return false;
    return selectedAnnotationsOnPage.some((ta) => {
      const tool = annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(ta.object);
      const groupLock = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.lockGroupAspectRatio,
        ta.object,
        false
      );
      const singleLock = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.lockAspectRatio,
        ta.object,
        false
      );
      return (tool == null ? void 0 : tool.interaction.lockGroupAspectRatio) !== void 0 ? groupLock : singleLock;
    });
  }, [selectedAnnotationsOnPage, annotationProvides]);
  const allSelectedOnSamePage = useMemo(() => {
    if (!annotationProvides) return false;
    const allSelected = annotationProvides.getSelectedAnnotations();
    return allSelected.length > 1 && allSelected.every((ta) => ta.object.pageIndex === pageIndex);
  }, [annotationProvides, pageIndex, allSelectedIds]);
  const getAppearanceForAnnotation = useCallback(
    (ta) => {
      if (ta.dictMode) return null;
      if (ta.object.rotation && ta.object.unrotatedRect) return null;
      const appearances = appearanceMap[ta.object.id];
      if (!(appearances == null ? void 0 : appearances.normal)) return null;
      return appearances;
    },
    [appearanceMap]
  );
  const allRenderers = useMemo(() => {
    const external = annotationsProps.annotationRenderers ?? [];
    const externalIds = new Set(external.map((r) => r.id));
    return [...external, ...builtInRenderers.filter((r) => !externalIds.has(r.id))];
  }, [annotationsProps.annotationRenderers]);
  const resolveRenderer = useCallback(
    (annotation) => allRenderers.find((r) => r.matches(annotation.object)) ?? null,
    [allRenderers]
  );
  const selectHelpers = useMemo(
    () => ({
      defaultSelect: handleClick,
      selectAnnotation: (pi, id) => annotationProvides == null ? void 0 : annotationProvides.selectAnnotation(pi, id),
      clearSelection: () => selectionProvides == null ? void 0 : selectionProvides.clear(),
      allAnnotations: annotations,
      pageIndex
    }),
    [handleClick, annotationProvides, selectionProvides, annotations, pageIndex]
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    annotations.map((annotation) => {
      var _a, _b, _c;
      const renderer = resolveRenderer(annotation);
      if (!renderer) return null;
      if (hasNoViewFlag(annotation.object)) return null;
      if (hasHiddenFlag(annotation.object)) return null;
      const tool = (annotationProvides == null ? void 0 : annotationProvides.findToolForAnnotation(annotation.object)) ?? null;
      const nonInteractive = annotationProvides ? !annotationProvides.isAnnotationInteractive(annotation.object) : false;
      const structurallyLocked = annotationProvides ? annotationProvides.isAnnotationStructurallyLocked(annotation.object) : false;
      const contentLocked = annotationProvides ? annotationProvides.isAnnotationContentLocked(annotation.object) : false;
      if (nonInteractive && renderer.hiddenWhenLocked) return null;
      const hasRenderLocked = nonInteractive && !!renderer.renderLocked;
      const isSelected = nonInteractive ? false : allSelectedIds.includes(annotation.object.id);
      const isEditing = nonInteractive ? false : editingId === annotation.object.id;
      const defaults = renderer.interactionDefaults;
      const resolvedDraggable = resolveInteractionProp(
        tool == null ? void 0 : tool.interaction.isDraggable,
        annotation.object,
        (defaults == null ? void 0 : defaults.isDraggable) ?? true
      );
      const finalDraggable = structurallyLocked ? false : renderer.isDraggable ? renderer.isDraggable(resolvedDraggable, { isEditing }) : resolvedDraggable;
      const useAP = ((_a = tool == null ? void 0 : tool.behavior) == null ? void 0 : _a.useAppearanceStream) ?? renderer.useAppearanceStream ?? true;
      const appearance = hasRenderLocked ? void 0 : useAP ? getAppearanceForAnnotation(annotation) : void 0;
      const noopSelect = (e) => {
        e.stopPropagation();
      };
      const onSelect = nonInteractive ? noopSelect : renderer.selectOverride ? (e) => renderer.selectOverride(e, annotation, selectHelpers) : (e) => handleClick(e, annotation);
      return /* @__PURE__ */ jsx(
        AnnotationContainer,
        {
          trackedAnnotation: annotation,
          isSelected,
          isEditing,
          isMultiSelected: nonInteractive ? false : isMultiSelected,
          isDraggable: finalDraggable,
          isResizable: structurallyLocked ? false : resolveInteractionProp(
            tool == null ? void 0 : tool.interaction.isResizable,
            annotation.object,
            (defaults == null ? void 0 : defaults.isResizable) ?? false
          ),
          lockAspectRatio: resolveInteractionProp(
            tool == null ? void 0 : tool.interaction.lockAspectRatio,
            annotation.object,
            (defaults == null ? void 0 : defaults.lockAspectRatio) ?? false
          ),
          isRotatable: structurallyLocked ? false : resolveInteractionProp(
            tool == null ? void 0 : tool.interaction.isRotatable,
            annotation.object,
            (defaults == null ? void 0 : defaults.isRotatable) ?? false
          ),
          vertexConfig: structurallyLocked ? void 0 : renderer.vertexConfig,
          selectionMenu: nonInteractive ? void 0 : ((_b = renderer.hideSelectionMenu) == null ? void 0 : _b.call(renderer, annotation.object)) ? void 0 : selectionMenu,
          structurallyLocked,
          contentLocked,
          onSelect,
          onDoubleClick: nonInteractive || contentLocked ? void 0 : renderer.onDoubleClick ? (e) => {
            e.stopPropagation();
            renderer.onDoubleClick(annotation.object.id, setEditingId);
          } : void 0,
          zIndex: renderer.zIndex,
          blendMode: blendModeToCss(
            annotation.object.blendMode ?? renderer.defaultBlendMode ?? PdfBlendMode.Normal
          ),
          style: (_c = renderer.containerStyle) == null ? void 0 : _c.call(renderer, annotation.object),
          appearance,
          ...annotationsProps,
          children: (currentObject, { appearanceActive }) => {
            if (hasRenderLocked) {
              return renderer.renderLocked({
                annotation,
                currentObject,
                isSelected: false,
                isEditing: false,
                scale,
                pageIndex,
                documentId,
                onClick: void 0,
                appearanceActive
              });
            }
            return renderer.render({
              annotation,
              currentObject,
              isSelected,
              isEditing,
              scale,
              pageIndex,
              documentId,
              onClick: nonInteractive ? void 0 : onSelect,
              appearanceActive
            });
          }
        },
        annotation.object.id
      );
    }),
    allSelectedOnSamePage && selectedAnnotationsOnPage.length >= 2 && /* @__PURE__ */ jsx(
      GroupSelectionBox,
      {
        documentId,
        pageIndex,
        scale,
        rotation: annotationsProps.rotation,
        pageWidth,
        pageHeight,
        selectedAnnotations: selectedAnnotationsOnPage,
        isDraggable: areAllSelectedDraggable,
        isResizable: areAllSelectedResizable,
        isRotatable: areAllSelectedRotatable,
        lockAspectRatio: shouldLockGroupAspectRatio,
        resizeUI: annotationsProps.resizeUI,
        rotationUI: annotationsProps.rotationUI,
        selectionOutlineColor: annotationsProps.selectionOutlineColor,
        selectionOutline: annotationsProps.groupSelectionOutline ?? annotationsProps.selectionOutline,
        groupSelectionMenu: annotationsProps.groupSelectionMenu
      }
    )
  ] });
}
function TextMarkup({ documentId, pageIndex, scale }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const { provides: selectionProvides } = useSelectionCapability();
  const { provides: annotationProvides } = useAnnotationCapability();
  const [rects, setRects] = useState([]);
  const [boundingRect, setBoundingRect] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  useEffect(() => {
    if (!selectionProvides) return;
    return selectionProvides.forDocument(documentId).onSelectionChange(() => {
      setRects(selectionProvides.forDocument(documentId).getHighlightRectsForPage(pageIndex));
      setBoundingRect(selectionProvides.forDocument(documentId).getBoundingRectForPage(pageIndex));
    });
  }, [selectionProvides, documentId, pageIndex]);
  useEffect(() => {
    if (!annotationProvides) return;
    setActiveTool(annotationProvides.forDocument(documentId).getActiveTool());
    return annotationProvides.forDocument(documentId).onActiveToolChange((event) => setActiveTool(event));
  }, [annotationProvides, documentId]);
  if (!boundingRect) return null;
  if (!activeTool || !activeTool.defaults) return null;
  switch (activeTool.defaults.type) {
    case PdfAnnotationSubtype.UNDERLINE:
      return /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            mixBlendMode: blendModeToCss(((_a = activeTool.defaults) == null ? void 0 : _a.blendMode) ?? PdfBlendMode.Normal),
            pointerEvents: "none",
            position: "absolute",
            inset: 0
          },
          children: /* @__PURE__ */ jsx(
            Underline,
            {
              strokeColor: (_b = activeTool.defaults) == null ? void 0 : _b.strokeColor,
              opacity: (_c = activeTool.defaults) == null ? void 0 : _c.opacity,
              segmentRects: rects,
              scale
            }
          )
        }
      );
    case PdfAnnotationSubtype.HIGHLIGHT:
      return /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            mixBlendMode: blendModeToCss(((_d = activeTool.defaults) == null ? void 0 : _d.blendMode) ?? PdfBlendMode.Multiply),
            pointerEvents: "none",
            position: "absolute",
            inset: 0
          },
          children: /* @__PURE__ */ jsx(
            Highlight,
            {
              strokeColor: (_e = activeTool.defaults) == null ? void 0 : _e.strokeColor,
              opacity: (_f = activeTool.defaults) == null ? void 0 : _f.opacity,
              segmentRects: rects,
              scale
            }
          )
        }
      );
    case PdfAnnotationSubtype.STRIKEOUT:
      return /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            mixBlendMode: blendModeToCss(((_g = activeTool.defaults) == null ? void 0 : _g.blendMode) ?? PdfBlendMode.Normal),
            pointerEvents: "none",
            position: "absolute",
            inset: 0
          },
          children: /* @__PURE__ */ jsx(
            Strikeout,
            {
              strokeColor: (_h = activeTool.defaults) == null ? void 0 : _h.strokeColor,
              opacity: (_i = activeTool.defaults) == null ? void 0 : _i.opacity,
              segmentRects: rects,
              scale
            }
          )
        }
      );
    case PdfAnnotationSubtype.SQUIGGLY:
      return /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            mixBlendMode: blendModeToCss(((_j = activeTool.defaults) == null ? void 0 : _j.blendMode) ?? PdfBlendMode.Normal),
            pointerEvents: "none",
            position: "absolute",
            inset: 0
          },
          children: /* @__PURE__ */ jsx(
            Squiggly,
            {
              strokeColor: (_k = activeTool.defaults) == null ? void 0 : _k.strokeColor,
              opacity: (_l = activeTool.defaults) == null ? void 0 : _l.opacity,
              segmentRects: rects,
              scale
            }
          )
        }
      );
    case PdfAnnotationSubtype.CARET:
      return null;
    default:
      return null;
  }
}
function PreviewRenderer({ toolId, preview, scale }) {
  var _a;
  const { bounds } = preview;
  const registeredRenderers = useRegisteredRenderers();
  const allRenderers = useMemo(() => {
    const externalIds = new Set(registeredRenderers.map((r) => r.id));
    return [...registeredRenderers, ...builtInRenderers.filter((r) => !externalIds.has(r.id))];
  }, [registeredRenderers]);
  const style = {
    position: "absolute",
    left: bounds.origin.x * scale,
    top: bounds.origin.y * scale,
    width: bounds.size.width * scale,
    height: bounds.size.height * scale,
    pointerEvents: "none",
    zIndex: 10
  };
  const match = allRenderers.find((r) => {
    var _a2;
    return ((_a2 = r.matchesPreview) == null ? void 0 : _a2.call(r, preview)) && r.renderPreview;
  }) ?? allRenderers.find((r) => r.id === toolId && r.renderPreview);
  if (match == null ? void 0 : match.renderPreview) {
    const containerExtra = (_a = match.previewContainerStyle) == null ? void 0 : _a.call(match, {
      data: preview.data,
      bounds: preview.bounds,
      scale
    });
    return /* @__PURE__ */ jsx("div", { style: { ...style, ...containerExtra }, children: match.renderPreview({ data: preview.data, bounds: preview.bounds, scale }) });
  }
  return null;
}
function AnnotationPaintLayer({ documentId, pageIndex, scale }) {
  const { plugin: annotationPlugin } = useAnnotationPlugin();
  const [previews, setPreviews] = useState(/* @__PURE__ */ new Map());
  const fileInputRef = useRef(null);
  const services = useMemo(
    () => ({
      requestFile: ({ accept, onFile }) => {
        if (!fileInputRef.current) return;
        const input = fileInputRef.current;
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
    }),
    []
  );
  useEffect(() => {
    if (!annotationPlugin) return;
    return annotationPlugin.registerPageHandlers(documentId, pageIndex, scale, {
      services,
      onPreview: (toolId, state) => {
        setPreviews((prev) => {
          const next = new Map(prev);
          if (state) {
            next.set(toolId, state);
          } else {
            next.delete(toolId);
          }
          return next;
        });
      }
    });
  }, [documentId, pageIndex, scale, annotationPlugin, services]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", style: { display: "none" } }),
    Array.from(previews.entries()).map(([toolId, preview]) => /* @__PURE__ */ jsx(PreviewRenderer, { toolId, preview, scale }, toolId))
  ] });
}
function AnnotationLayer({
  style,
  documentId,
  pageIndex,
  scale: overrideScale,
  rotation: overrideRotation,
  selectionMenu,
  groupSelectionMenu,
  resizeUI,
  vertexUI,
  rotationUI,
  selectionOutlineColor,
  selectionOutline,
  groupSelectionOutline,
  customAnnotationRenderer,
  annotationRenderers,
  ...props
}) {
  var _a, _b, _c, _d;
  const documentState = useDocumentState(documentId);
  const page = (_b = (_a = documentState == null ? void 0 : documentState.document) == null ? void 0 : _a.pages) == null ? void 0 : _b[pageIndex];
  const width = ((_c = page == null ? void 0 : page.size) == null ? void 0 : _c.width) ?? 0;
  const height = ((_d = page == null ? void 0 : page.size) == null ? void 0 : _d.height) ?? 0;
  const contextRenderers = useRegisteredRenderers();
  const allRenderers = useMemo(() => {
    const merged = [...contextRenderers];
    for (const renderer of annotationRenderers ?? []) {
      const idx = merged.findIndex((r) => r.id === renderer.id);
      if (idx >= 0) merged[idx] = renderer;
      else merged.push(renderer);
    }
    return merged;
  }, [contextRenderers, annotationRenderers]);
  const actualScale = useMemo(() => {
    if (overrideScale !== void 0) return overrideScale;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [overrideScale, documentState == null ? void 0 : documentState.scale]);
  const actualRotation = useMemo(() => {
    if (overrideRotation !== void 0) return overrideRotation;
    const pageRotation = (page == null ? void 0 : page.rotation) ?? 0;
    const docRotation = (documentState == null ? void 0 : documentState.rotation) ?? 0;
    return (pageRotation + docRotation) % 4;
  }, [overrideRotation, page == null ? void 0 : page.rotation, documentState == null ? void 0 : documentState.rotation]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        ...style
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          Annotations,
          {
            documentId,
            selectionMenu,
            groupSelectionMenu,
            pageIndex,
            scale: actualScale,
            rotation: actualRotation,
            pageWidth: width,
            pageHeight: height,
            resizeUI,
            vertexUI,
            rotationUI,
            selectionOutlineColor,
            selectionOutline,
            groupSelectionOutline,
            customAnnotationRenderer,
            annotationRenderers: allRenderers
          }
        ),
        /* @__PURE__ */ jsx(TextMarkup, { documentId, pageIndex, scale: actualScale }),
        /* @__PURE__ */ jsx(AnnotationPaintLayer, { documentId, pageIndex, scale: actualScale })
      ]
    }
  );
}
const AnnotationPluginPackage = createPluginPackage(AnnotationPluginPackage$1).addWrapper(AnnotationRendererProvider).addUtility(AnnotationNavigationHandler).build();
export {
  AnnotationLayer,
  AnnotationPluginPackage,
  AnnotationRendererProvider,
  GroupSelectionBox,
  createRenderer,
  useAnnotation,
  useAnnotationCapability,
  useAnnotationPlugin,
  useIOSZoomPrevention,
  useRegisterRenderers,
  useRegisteredRenderers,
  useRendererRegistry
};
//# sourceMappingURL=index.js.map
