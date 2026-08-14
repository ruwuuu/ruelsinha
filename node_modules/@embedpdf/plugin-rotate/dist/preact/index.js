import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/preact";
import { initialDocumentState, RotatePlugin } from "@embedpdf/plugin-rotate";
export * from "@embedpdf/plugin-rotate";
import "preact";
import { useState, useEffect } from "preact/hooks";
import { jsx } from "preact/jsx-runtime";
const useRotatePlugin = () => usePlugin(RotatePlugin.id);
const useRotateCapability = () => useCapability(RotatePlugin.id);
const useRotate = (documentId) => {
  const { provides } = useRotateCapability();
  const [rotation, setRotation] = useState(initialDocumentState.rotation);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setRotation(scope.getRotation());
    return scope.onRotateChange((newRotation) => {
      setRotation(newRotation);
    });
  }, [provides, documentId]);
  return {
    rotation,
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null
  };
};
function Rotate({
  children,
  documentId,
  pageIndex,
  rotation: rotationOverride,
  scale: scaleOverride,
  style,
  ...props
}) {
  var _a, _b, _c, _d;
  const { plugin: rotatePlugin } = useRotatePlugin();
  const documentState = useDocumentState(documentId);
  const page = (_b = (_a = documentState == null ? void 0 : documentState.document) == null ? void 0 : _a.pages) == null ? void 0 : _b[pageIndex];
  const width = ((_c = page == null ? void 0 : page.size) == null ? void 0 : _c.width) ?? 0;
  const height = ((_d = page == null ? void 0 : page.size) == null ? void 0 : _d.height) ?? 0;
  const pageRotation = (page == null ? void 0 : page.rotation) ?? 0;
  const docRotation = (documentState == null ? void 0 : documentState.rotation) ?? 0;
  const rotation = rotationOverride !== void 0 ? rotationOverride : (pageRotation + docRotation) % 4;
  const scale = scaleOverride ?? (documentState == null ? void 0 : documentState.scale) ?? 1;
  const matrix = (rotatePlugin == null ? void 0 : rotatePlugin.getMatrixAsString({
    width: width * scale,
    height: height * scale,
    rotation
  })) ?? "matrix(1, 0, 0, 1, 0, 0)";
  if (!page) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      style: {
        position: "absolute",
        transformOrigin: "0 0",
        transform: matrix,
        ...style
      },
      children
    }
  );
}
export {
  Rotate,
  useRotate,
  useRotateCapability,
  useRotatePlugin
};
//# sourceMappingURL=index.js.map
