import { createPluginPackage } from "@embedpdf/core";
import { SelectionPlugin, SelectionPluginPackage as SelectionPluginPackage$1 } from "@embedpdf/plugin-selection";
export * from "@embedpdf/plugin-selection";
import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo, Fragment as Fragment$1 } from "react";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/react";
import { CounterRotate } from "@embedpdf/utils/react";
const useSelectionCapability = () => useCapability(SelectionPlugin.id);
const useSelectionPlugin = () => usePlugin(SelectionPlugin.id);
function TextSelection({
  documentId,
  pageIndex,
  scale: scaleOverride,
  rotation: rotationOverride,
  background = "rgba(33,150,243)",
  selectionMenu
}) {
  var _a, _b;
  const { plugin: selPlugin } = useSelectionPlugin();
  const documentState = useDocumentState(documentId);
  const page = (_b = (_a = documentState == null ? void 0 : documentState.document) == null ? void 0 : _a.pages) == null ? void 0 : _b[pageIndex];
  const [rects, setRects] = useState([]);
  const [boundingRect, setBoundingRect] = useState(null);
  const [placement, setPlacement] = useState(null);
  useEffect(() => {
    if (!selPlugin || !documentId) return;
    return selPlugin.registerSelectionOnPage({
      documentId,
      pageIndex,
      onRectsChange: ({ rects: rects2, boundingRect: boundingRect2 }) => {
        setRects(rects2);
        setBoundingRect(boundingRect2);
      }
    });
  }, [selPlugin, documentId, pageIndex]);
  useEffect(() => {
    if (!selPlugin || !documentId) return;
    return selPlugin.onMenuPlacement(documentId, (newPlacement) => {
      setPlacement(newPlacement);
    });
  }, [selPlugin, documentId]);
  const actualScale = useMemo(() => {
    if (scaleOverride !== void 0) return scaleOverride;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scaleOverride, documentState == null ? void 0 : documentState.scale]);
  const actualRotation = useMemo(() => {
    if (rotationOverride !== void 0) return rotationOverride;
    const pageRotation = (page == null ? void 0 : page.rotation) ?? 0;
    const docRotation = (documentState == null ? void 0 : documentState.rotation) ?? 0;
    return (pageRotation + docRotation) % 4;
  }, [rotationOverride, page == null ? void 0 : page.rotation, documentState == null ? void 0 : documentState.rotation]);
  const shouldRenderMenu = selectionMenu && placement && placement.pageIndex === pageIndex && placement.isVisible;
  if (!boundingRect) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: boundingRect.origin.x * actualScale,
          top: boundingRect.origin.y * actualScale,
          width: boundingRect.size.width * actualScale,
          height: boundingRect.size.height * actualScale,
          mixBlendMode: "multiply",
          isolation: "isolate",
          pointerEvents: "none"
        },
        children: rects.map((b, i) => /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: (b.origin.x - boundingRect.origin.x) * actualScale,
              top: (b.origin.y - boundingRect.origin.y) * actualScale,
              width: b.size.width * actualScale,
              height: b.size.height * actualScale,
              background
            }
          },
          i
        ))
      }
    ),
    shouldRenderMenu && /* @__PURE__ */ jsx(
      CounterRotate,
      {
        rect: {
          origin: {
            x: placement.rect.origin.x * actualScale,
            y: placement.rect.origin.y * actualScale
          },
          size: {
            width: placement.rect.size.width * actualScale,
            height: placement.rect.size.height * actualScale
          }
        },
        rotation: actualRotation,
        children: (props) => selectionMenu({
          ...props,
          context: {
            type: "selection",
            pageIndex
          },
          selected: true,
          placement
        })
      }
    )
  ] });
}
const MarqueeSelection = ({
  documentId,
  pageIndex,
  scale,
  className,
  background,
  borderColor,
  borderStyle = "dashed",
  stroke,
  fill
}) => {
  const { plugin: selPlugin } = useSelectionPlugin();
  const documentState = useDocumentState(documentId);
  const [rect, setRect] = useState(null);
  const resolvedBorderColor = borderColor ?? stroke ?? "rgba(0,122,204,0.8)";
  const resolvedBackground = background ?? fill ?? "rgba(0,122,204,0.15)";
  const actualScale = useMemo(() => {
    if (scale !== void 0) return scale;
    return (documentState == null ? void 0 : documentState.scale) ?? 1;
  }, [scale, documentState == null ? void 0 : documentState.scale]);
  useEffect(() => {
    if (!selPlugin || !documentId) return;
    return selPlugin.registerMarqueeOnPage({
      documentId,
      pageIndex,
      scale: actualScale,
      onRectChange: setRect
    });
  }, [selPlugin, documentId, pageIndex, actualScale]);
  if (!rect) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        pointerEvents: "none",
        left: rect.origin.x * actualScale,
        top: rect.origin.y * actualScale,
        width: rect.size.width * actualScale,
        height: rect.size.height * actualScale,
        border: `1px ${borderStyle} ${resolvedBorderColor}`,
        background: resolvedBackground,
        boxSizing: "border-box",
        zIndex: 1e3
      },
      className
    }
  );
};
function SelectionLayer({
  documentId,
  pageIndex,
  scale,
  rotation,
  background,
  textStyle,
  marqueeStyle,
  marqueeClassName,
  selectionMenu
}) {
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx(
      TextSelection,
      {
        documentId,
        pageIndex,
        scale,
        rotation,
        background: (textStyle == null ? void 0 : textStyle.background) ?? background,
        selectionMenu
      }
    ),
    /* @__PURE__ */ jsx(
      MarqueeSelection,
      {
        documentId,
        pageIndex,
        scale,
        background: marqueeStyle == null ? void 0 : marqueeStyle.background,
        borderColor: marqueeStyle == null ? void 0 : marqueeStyle.borderColor,
        borderStyle: marqueeStyle == null ? void 0 : marqueeStyle.borderStyle,
        className: marqueeClassName
      }
    )
  ] });
}
function CopyToClipboard() {
  const { provides: sel } = useSelectionCapability();
  useEffect(() => {
    if (!sel) return;
    return sel.onCopyToClipboard(({ text }) => {
      navigator.clipboard.writeText(text);
    });
  }, [sel]);
  return null;
}
const SelectionPluginPackage = createPluginPackage(SelectionPluginPackage$1).addUtility(CopyToClipboard).build();
export {
  CopyToClipboard,
  MarqueeSelection,
  SelectionLayer,
  SelectionPluginPackage,
  TextSelection,
  useSelectionCapability,
  useSelectionPlugin
};
//# sourceMappingURL=index.js.map
