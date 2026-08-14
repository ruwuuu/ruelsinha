import { createPluginPackage } from "@embedpdf/core";
import { initialDocumentState, RedactionPlugin, RedactionPluginPackage as RedactionPluginPackage$1 } from "@embedpdf/plugin-redaction";
export * from "@embedpdf/plugin-redaction";
import { createRenderer, useRegisterRenderers } from "@embedpdf/plugin-annotation/react";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PdfStandardFont, PdfTextAlignment, textAlignmentToCss, standardFontCssProperties, PdfAnnotationSubtype, Rotation } from "@embedpdf/models";
import { useState, useMemo, useEffect, useCallback, Fragment as Fragment$1 } from "react";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/react";
import { CounterRotate } from "@embedpdf/utils/react";
function RedactHighlight({
  annotation,
  isSelected,
  scale,
  onClick,
  style
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const segmentRects = object.segmentRects ?? [];
  const rect = object.rect;
  const strokeColor = object.strokeColor ?? "#FF0000";
  const color = object.color ?? "#000000";
  const opacity = object.opacity ?? 1;
  const textColor = object.fontColor ?? object.overlayColor ?? "#FFFFFF";
  const overlayText = object.overlayText;
  const overlayTextRepeat = object.overlayTextRepeat ?? false;
  const fontSize = object.fontSize ?? 12;
  const fontFamily = object.fontFamily ?? PdfStandardFont.Helvetica;
  const textAlign = object.textAlign ?? PdfTextAlignment.Center;
  const renderOverlayText = () => {
    if (!overlayText) return null;
    if (!overlayTextRepeat) return overlayText;
    const reps = 10;
    return Array(reps).fill(overlayText).join(" ");
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: { position: "absolute", inset: 0 },
      children: segmentRects.map((b, i) => /* @__PURE__ */ jsx(
        "div",
        {
          onPointerDown: onClick,
          style: {
            position: "absolute",
            left: (rect ? b.origin.x - rect.origin.x : b.origin.x) * scale,
            top: (rect ? b.origin.y - rect.origin.y : b.origin.y) * scale,
            width: b.size.width * scale,
            height: b.size.height * scale,
            // Default: transparent background with strokeColor (C) border
            // Hovered: color (IC) background fill, no border
            // Selected: no border (container handles it)
            background: isHovered ? color : "transparent",
            border: !isHovered ? `2px solid ${strokeColor}` : "none",
            opacity: isHovered ? opacity : 1,
            boxSizing: "border-box",
            pointerEvents: "auto",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: textAlign === PdfTextAlignment.Left ? "flex-start" : textAlign === PdfTextAlignment.Right ? "flex-end" : "center",
            overflow: "hidden",
            ...style
          },
          children: isHovered && overlayText && /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                color: textColor,
                fontSize: Math.min(fontSize * scale, b.size.height * scale * 0.8),
                ...standardFontCssProperties(fontFamily),
                textAlign: textAlignmentToCss(textAlign),
                whiteSpace: overlayTextRepeat ? "normal" : "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1
              },
              children: renderOverlayText()
            }
          )
        },
        i
      ))
    }
  );
}
function RedactArea({ annotation, isSelected, scale, onClick, style }) {
  const [isHovered, setIsHovered] = useState(false);
  const { object } = annotation;
  const strokeColor = object.strokeColor ?? "#FF0000";
  const color = object.color ?? "#000000";
  const opacity = object.opacity ?? 1;
  const textColor = object.fontColor ?? object.overlayColor ?? "#FFFFFF";
  const overlayText = object.overlayText;
  const overlayTextRepeat = object.overlayTextRepeat ?? false;
  const fontSize = object.fontSize ?? 12;
  const fontFamily = object.fontFamily ?? PdfStandardFont.Helvetica;
  const textAlign = object.textAlign ?? PdfTextAlignment.Center;
  const renderOverlayText = () => {
    if (!overlayText) return null;
    if (!overlayTextRepeat) return overlayText;
    const reps = 10;
    return Array(reps).fill(overlayText).join(" ");
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
        // Default: transparent background with strokeColor (C) border
        // Hovered: color (IC) background fill, no border
        // Selected: no border (container handles it)
        background: isHovered ? color : "transparent",
        border: !isHovered ? `2px solid ${strokeColor}` : "none",
        opacity: isHovered ? opacity : 1,
        boxSizing: "border-box",
        pointerEvents: "auto",
        cursor: isSelected ? "move" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: textAlign === PdfTextAlignment.Left ? "flex-start" : textAlign === PdfTextAlignment.Right ? "flex-end" : "center",
        overflow: "hidden",
        ...style
      },
      children: isHovered && overlayText && /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            color: textColor,
            fontSize: fontSize * scale,
            ...standardFontCssProperties(fontFamily),
            textAlign: textAlignmentToCss(textAlign),
            whiteSpace: overlayTextRepeat ? "normal" : "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "4px"
          },
          children: renderOverlayText()
        }
      )
    }
  );
}
const redactRenderers = [
  createRenderer({
    id: "redactHighlight",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && "segmentRects" in a && (((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0) > 0;
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      RedactHighlight,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  }),
  createRenderer({
    id: "redactArea",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && (!("segmentRects" in a) || !(((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0));
    },
    render: ({ annotation, isSelected, scale, pageIndex, onClick }) => /* @__PURE__ */ jsx(
      RedactArea,
      {
        annotation,
        isSelected,
        scale,
        pageIndex,
        onClick
      }
    ),
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  })
];
function RedactRendererRegistration() {
  useRegisterRenderers(redactRenderers);
  return null;
}
const useRedactionPlugin = () => usePlugin(RedactionPlugin.id);
const useRedactionCapability = () => useCapability(RedactionPlugin.id);
const useRedaction = (documentId) => {
  const { provides } = useRedactionCapability();
  const [state, setState] = useState(initialDocumentState);
  const scope = useMemo(
    () => provides ? provides.forDocument(documentId) : null,
    [provides, documentId]
  );
  useEffect(() => {
    if (!scope) {
      setState(initialDocumentState);
      return;
    }
    try {
      setState(scope.getState());
    } catch (e) {
      setState(initialDocumentState);
    }
    const unsubscribe = scope.onStateChange((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [scope]);
  return {
    state,
    provides: scope
  };
};
const MarqueeRedact = ({
  documentId,
  pageIndex,
  scale: scaleOverride,
  className,
  stroke,
  fill = "transparent"
}) => {
  const { plugin: redactionPlugin } = useRedactionPlugin();
  const documentState = useDocumentState(documentId);
  const [rect, setRect] = useState(null);
  const scale = scaleOverride ?? (documentState == null ? void 0 : documentState.scale) ?? 1;
  const strokeColor = stroke ?? (redactionPlugin == null ? void 0 : redactionPlugin.getPreviewStrokeColor()) ?? "red";
  useEffect(() => {
    if (!redactionPlugin || !documentId) return;
    return redactionPlugin.onRedactionMarqueeChange(documentId, (data) => {
      setRect(data.pageIndex === pageIndex ? data.rect : null);
    });
  }, [redactionPlugin, documentId, pageIndex]);
  if (!rect) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        pointerEvents: "none",
        left: rect.origin.x * scale,
        top: rect.origin.y * scale,
        width: rect.size.width * scale,
        height: rect.size.height * scale,
        border: `1px solid ${strokeColor}`,
        background: fill,
        boxSizing: "border-box"
      },
      className
    }
  );
};
function Highlight({
  color = "#FFFF00",
  opacity = 1,
  border = "1px solid red",
  rects,
  rect,
  scale,
  onClick,
  style,
  ...props
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: rects.map((b, i) => /* @__PURE__ */ jsx(
    "div",
    {
      onPointerDown: onClick,
      style: {
        position: "absolute",
        border,
        left: (rect ? b.origin.x - rect.origin.x : b.origin.x) * scale,
        top: (rect ? b.origin.y - rect.origin.y : b.origin.y) * scale,
        width: b.size.width * scale,
        height: b.size.height * scale,
        background: color,
        opacity,
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "pointer" : "default",
        zIndex: onClick ? 1 : void 0,
        ...style
      },
      ...props
    },
    i
  )) });
}
function SelectionRedact({ documentId, pageIndex, scale }) {
  const { plugin: redactionPlugin } = useRedactionPlugin();
  const [rects, setRects] = useState([]);
  const [boundingRect, setBoundingRect] = useState(null);
  const strokeColor = (redactionPlugin == null ? void 0 : redactionPlugin.getPreviewStrokeColor()) ?? "red";
  useEffect(() => {
    if (!redactionPlugin) return;
    return redactionPlugin.onRedactionSelectionChange(documentId, (formattedSelection) => {
      const selection = formattedSelection.find((s) => s.pageIndex === pageIndex);
      setRects((selection == null ? void 0 : selection.segmentRects) ?? []);
      setBoundingRect((selection == null ? void 0 : selection.rect) ?? null);
    });
  }, [redactionPlugin, documentId, pageIndex]);
  if (!boundingRect) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        mixBlendMode: "normal",
        pointerEvents: "none",
        position: "absolute",
        inset: 0
      },
      children: /* @__PURE__ */ jsx(
        Highlight,
        {
          color: "transparent",
          opacity: 1,
          rects,
          scale,
          border: `1px solid ${strokeColor}`
        }
      )
    }
  );
}
function PendingRedactions({
  documentId,
  pageIndex,
  scale,
  bboxStroke = "rgba(0,0,0,0.8)",
  rotation = Rotation.Degree0,
  selectionMenu
}) {
  const { provides: redaction } = useRedactionCapability();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!redaction) return;
    const scoped = redaction.forDocument(documentId);
    const currentState = scoped.getState();
    setItems((currentState.pending[pageIndex] ?? []).filter((it) => it.source === "legacy"));
    setSelectedId(
      currentState.selected && currentState.selected.page === pageIndex ? currentState.selected.id : null
    );
    const off1 = scoped.onPendingChange((map) => {
      setItems((map[pageIndex] ?? []).filter((it) => it.source === "legacy"));
    });
    const off2 = scoped.onSelectedChange((sel) => {
      setSelectedId(sel && sel.page === pageIndex ? sel.id : null);
    });
    return () => {
      off1 == null ? void 0 : off1();
      off2 == null ? void 0 : off2();
    };
  }, [redaction, documentId, pageIndex]);
  const select = useCallback(
    (e, id) => {
      e.stopPropagation();
      if (!redaction) return;
      redaction.forDocument(documentId).selectPending(pageIndex, id);
    },
    [redaction, documentId, pageIndex]
  );
  if (!items.length) return null;
  return /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: items.map((it) => {
    if (it.kind === "area") {
      const r = it.rect;
      return /* @__PURE__ */ jsxs(Fragment$1, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: r.origin.x * scale,
              top: r.origin.y * scale,
              width: r.size.width * scale,
              height: r.size.height * scale,
              background: "transparent",
              outline: selectedId === it.id ? `1px solid ${bboxStroke}` : "none",
              outlineOffset: "2px",
              border: `1px solid ${it.markColor}`,
              pointerEvents: "auto",
              cursor: "pointer"
            },
            onPointerDown: (e) => select(e, it.id)
          }
        ),
        selectionMenu && /* @__PURE__ */ jsx(
          CounterRotate,
          {
            rect: {
              origin: { x: r.origin.x * scale, y: r.origin.y * scale },
              size: { width: r.size.width * scale, height: r.size.height * scale }
            },
            rotation,
            children: (props) => selectionMenu({
              ...props,
              context: {
                type: "redaction",
                item: it,
                pageIndex
              },
              selected: selectedId === it.id,
              placement: {
                suggestTop: false
              }
            })
          }
        )
      ] }, it.id);
    }
    const b = it.rect;
    return /* @__PURE__ */ jsxs(Fragment$1, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            position: "absolute",
            left: b.origin.x * scale,
            top: b.origin.y * scale,
            width: b.size.width * scale,
            height: b.size.height * scale,
            background: "transparent",
            outline: selectedId === it.id ? `1px solid ${bboxStroke}` : "none",
            outlineOffset: "2px",
            pointerEvents: "auto",
            cursor: selectedId === it.id ? "pointer" : "default"
          },
          children: /* @__PURE__ */ jsx(
            Highlight,
            {
              rect: b,
              rects: it.rects,
              color: "transparent",
              border: `1px solid ${it.markColor}`,
              scale,
              onClick: (e) => select(e, it.id)
            }
          )
        }
      ),
      selectionMenu && /* @__PURE__ */ jsx(
        CounterRotate,
        {
          rect: {
            origin: { x: b.origin.x * scale, y: b.origin.y * scale },
            size: { width: b.size.width * scale, height: b.size.height * scale }
          },
          rotation,
          children: (props) => selectionMenu({
            ...props,
            context: {
              type: "redaction",
              item: it,
              pageIndex
            },
            selected: selectedId === it.id,
            placement: {
              suggestTop: false
            }
          })
        }
      )
    ] }, it.id);
  }) });
}
const RedactionLayer = ({
  documentId,
  pageIndex,
  scale,
  rotation,
  selectionMenu
}) => {
  var _a, _b;
  const documentState = useDocumentState(documentId);
  const page = (_b = (_a = documentState == null ? void 0 : documentState.document) == null ? void 0 : _a.pages) == null ? void 0 : _b[pageIndex];
  const actualScale = useMemo(() => {
    if (scale !== void 0) return scale;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scale, documentState == null ? void 0 : documentState.scale]);
  const actualRotation = useMemo(() => {
    if (rotation !== void 0) return rotation;
    const pageRotation = (page == null ? void 0 : page.rotation) ?? 0;
    const docRotation = (documentState == null ? void 0 : documentState.rotation) ?? 0;
    return (pageRotation + docRotation) % 4;
  }, [rotation, page == null ? void 0 : page.rotation, documentState == null ? void 0 : documentState.rotation]);
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx(
      PendingRedactions,
      {
        documentId,
        pageIndex,
        scale: actualScale,
        rotation: actualRotation,
        selectionMenu
      }
    ),
    /* @__PURE__ */ jsx(MarqueeRedact, { documentId, pageIndex, scale: actualScale }),
    /* @__PURE__ */ jsx(SelectionRedact, { documentId, pageIndex, scale: actualScale })
  ] });
};
const RedactionPluginPackage = createPluginPackage(RedactionPluginPackage$1).addUtility(RedactRendererRegistration).build();
export {
  RedactArea,
  RedactHighlight,
  RedactRendererRegistration,
  RedactionLayer,
  RedactionPluginPackage,
  redactRenderers,
  useRedaction,
  useRedactionCapability,
  useRedactionPlugin
};
//# sourceMappingURL=index.js.map
