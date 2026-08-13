import { createPluginPackage } from "@embedpdf/core";
import { SignaturePlugin, SignatureCreationType, SignaturePluginPackage as SignaturePluginPackage$1 } from "@embedpdf/plugin-signature";
export * from "@embedpdf/plugin-signature";
import { useCapability, usePlugin } from "@embedpdf/core/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
const useSignaturePlugin = () => usePlugin(SignaturePlugin.id);
const useSignatureCapability = () => useCapability(SignaturePlugin.id);
const useSignatureEntries = () => {
  const { provides } = useSignatureCapability();
  const [entries, setEntries] = useState((provides == null ? void 0 : provides.getEntries()) ?? []);
  useEffect(() => {
    if (!provides) return;
    setEntries(provides.getEntries());
    return provides.onEntriesChange((updated) => {
      setEntries(updated);
    });
  }, [provides]);
  return { entries, provides };
};
const useActivePlacement = (documentId) => {
  const { provides } = useSignatureCapability();
  const [activePlacement, setActivePlacement] = useState(null);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    setActivePlacement(scope.getActivePlacement());
    return scope.onActivePlacementChange(setActivePlacement);
  }, [provides, documentId]);
  return activePlacement;
};
function useSignatureUpload({
  accept = "image/png,image/jpeg,image/svg+xml",
  onResult
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const processFile = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], { type: file.type });
        const dataUrl = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return dataUrl;
        });
        const img = new Image();
        img.onload = () => {
          const previewCanvas = document.createElement("canvas");
          previewCanvas.width = img.width;
          previewCanvas.height = img.height;
          const ctx = previewCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          const result = {
            creationType: SignatureCreationType.Upload,
            imageMimeType: file.type,
            imageSize: { width: img.width, height: img.height },
            previewDataUrl: previewCanvas.toDataURL("image/png"),
            imageData: arrayBuffer
          };
          onResult(result);
        };
        img.src = dataUrl;
      };
      reader.readAsArrayBuffer(file);
    },
    [onResult]
  );
  const handleFileInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files[0]) {
        processFile(files[0]);
      }
    },
    [processFile]
  );
  const handleDrop = useCallback(
    (e) => {
      var _a;
      e.preventDefault();
      setIsDragging(false);
      const files = (_a = e.dataTransfer) == null ? void 0 : _a.files;
      if (files && files[0]) {
        processFile(files[0]);
      }
    },
    [processFile]
  );
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  const openFilePicker = useCallback(() => {
    var _a;
    (_a = inputRef.current) == null ? void 0 : _a.click();
  }, []);
  const clear = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onResult]);
  return {
    inputRef,
    openFilePicker,
    processFile,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    previewUrl,
    isDragging,
    clear,
    accept
  };
}
function cropCanvas(source, padding = 4) {
  const ctx = source.getContext("2d");
  if (!ctx) return null;
  const { width, height } = source;
  if (width === 0 || height === 0) return null;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropW = Math.min(width, maxX + padding + 1) - cropX;
  const cropH = Math.min(height, maxY + padding + 1) - cropY;
  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) return null;
  croppedCtx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return {
    canvas: cropped,
    bounds: { x: cropX, y: cropY, width: cropW, height: cropH }
  };
}
function SignatureDrawPad({
  onResult,
  padRef,
  strokeColor = "#000000",
  strokeWidth = 4,
  className
}) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const isDrawingRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const getCanvasPos = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / dpr / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / dpr / rect.height)
      };
    },
    [dpr]
  );
  const redraw = useCallback(
    (currentStrokes) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const stroke of currentStrokes) {
        if (stroke.points.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    },
    [dpr, strokeColor, strokeWidth]
  );
  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;
  const emitResult = useCallback(
    (currentStrokes) => {
      if (currentStrokes.length === 0 || currentStrokes.every((s) => s.points.length < 2)) {
        onResult(null);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cropped = cropCanvas(canvas, Math.ceil(strokeWidth * dpr));
      if (!cropped) {
        onResult(null);
        return;
      }
      const offsetX = cropped.bounds.x / dpr;
      const offsetY = cropped.bounds.y / dpr;
      const croppedWidth = Math.round(cropped.bounds.width / dpr);
      const croppedHeight = Math.round(cropped.bounds.height / dpr);
      const result = {
        creationType: SignatureCreationType.Draw,
        inkData: {
          inkList: currentStrokes.filter((s) => s.points.length >= 2).map((s) => ({
            points: s.points.map((p) => ({
              x: p.x - offsetX,
              y: p.y - offsetY
            }))
          })),
          strokeWidth,
          strokeColor,
          size: { width: croppedWidth, height: croppedHeight }
        },
        previewDataUrl: cropped.canvas.toDataURL("image/png")
      };
      onResult(result);
    },
    [onResult, strokeWidth, strokeColor, dpr]
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        sizeRef.current = { width: Math.round(w), height: Math.round(h) };
        canvas.width = Math.round(w) * dpr;
        canvas.height = Math.round(h) * dpr;
        redrawRef.current(strokesRef.current);
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [dpr]);
  useEffect(() => {
    redraw(strokes);
    if (strokes.length > 0 && strokes.some((s) => s.points.length >= 2)) {
      emitResult(strokes);
    }
  }, [strokeColor, strokeWidth]);
  const handleClear = useCallback(() => {
    setStrokes([]);
    redraw([]);
    onResult(null);
  }, [redraw, onResult]);
  useEffect(() => {
    padRef == null ? void 0 : padRef({ clear: handleClear });
    return () => padRef == null ? void 0 : padRef(null);
  }, [padRef, handleClear]);
  const handlePointerDown = useCallback(
    (e) => {
      var _a, _b;
      isDrawingRef.current = true;
      const pos = getCanvasPos(e);
      const newStrokes = [...strokes, { points: [pos] }];
      setStrokes(newStrokes);
      redraw(newStrokes);
      (_b = (_a = e.target) == null ? void 0 : _a.setPointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
    },
    [strokes, getCanvasPos, redraw]
  );
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;
      const pos = getCanvasPos(e);
      const newStrokes = [...strokes];
      const last = newStrokes[newStrokes.length - 1];
      if (last) {
        last.points.push(pos);
        setStrokes(newStrokes);
        redraw(newStrokes);
      }
    },
    [strokes, getCanvasPos, redraw]
  );
  const handlePointerUp = useCallback(
    (e) => {
      var _a, _b;
      isDrawingRef.current = false;
      (_b = (_a = e.target) == null ? void 0 : _a.releasePointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
      emitResult(strokes);
    },
    [strokes, emitResult]
  );
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: canvasRef,
      className,
      style: { touchAction: "none", width: "100%", height: "100%", display: "block" },
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp
    }
  );
}
function SignatureTypePad({
  onResult,
  padRef,
  fontFamily = "'Dancing Script', cursive",
  fontSize = 48,
  color = "#000000",
  className,
  placeholder = "Type your signature..."
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputId = useRef(`sig-type-${Math.random().toString(36).slice(2, 8)}`).current;
  const sizeRef = useRef({ width: 0, height: 0 });
  const [text, setText] = useState("");
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const renderText = useCallback(
    (currentText) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!currentText.trim()) {
        onResult(null);
        return;
      }
      ctx.scale(dpr, dpr);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(currentText, width / 2, height / 2, width - 20);
      const cropped = cropCanvas(canvas, Math.ceil(4 * dpr));
      if (!cropped) {
        onResult(null);
        return;
      }
      const croppedWidth = Math.round(cropped.bounds.width / dpr);
      const croppedHeight = Math.round(cropped.bounds.height / dpr);
      cropped.canvas.toBlob((blob) => {
        if (!blob) return;
        blob.arrayBuffer().then((imageData) => {
          const result = {
            creationType: SignatureCreationType.Type,
            label: currentText,
            imageMimeType: "image/png",
            imageSize: { width: croppedWidth, height: croppedHeight },
            previewDataUrl: cropped.canvas.toDataURL("image/png"),
            imageData
          };
          onResult(result);
        });
      }, "image/png");
    },
    [onResult, color, fontSize, fontFamily, dpr]
  );
  const renderTextRef = useRef(renderText);
  renderTextRef.current = renderText;
  const textRef = useRef(text);
  textRef.current = text;
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        sizeRef.current = { width: Math.round(w), height: Math.round(h) };
        renderTextRef.current(textRef.current);
      }
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    renderText(text);
  }, [text, fontFamily, renderText]);
  const handleClear = useCallback(() => {
    setText("");
    onResult(null);
  }, [onResult]);
  useEffect(() => {
    padRef == null ? void 0 : padRef({ clear: handleClear });
    return () => padRef == null ? void 0 : padRef(null);
  }, [padRef, handleClear]);
  const handleTextChange = useCallback((e) => {
    setText(e.target.value);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref: wrapperRef, className, style: { width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ jsx("style", { children: `#${inputId}::placeholder { color: ${color}; opacity: 0.5; }` }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id: inputId,
        type: "text",
        value: text,
        onInput: handleTextChange,
        placeholder,
        style: {
          fontFamily,
          fontSize: `${Math.min(fontSize, 32)}px`,
          color,
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          textIndent: "8px"
        }
      }
    ),
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { display: "none" } })
  ] });
}
const SignaturePluginPackage = createPluginPackage(SignaturePluginPackage$1).build();
export {
  SignatureDrawPad,
  SignaturePluginPackage,
  SignatureTypePad,
  useActivePlacement,
  useSignatureCapability,
  useSignatureEntries,
  useSignaturePlugin,
  useSignatureUpload
};
//# sourceMappingURL=index.js.map
