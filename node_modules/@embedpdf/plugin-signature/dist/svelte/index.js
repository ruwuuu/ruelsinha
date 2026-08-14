import { createPluginPackage } from "@embedpdf/core";
import { SignaturePlugin, SignatureCreationType, SignaturePluginPackage as SignaturePluginPackage$1 } from "@embedpdf/plugin-signature";
export * from "@embedpdf/plugin-signature";
import * as $ from "svelte/internal/client";
import { usePlugin, useCapability } from "@embedpdf/core/svelte";
import "svelte/internal/disclose-version";
const useSignaturePlugin = () => usePlugin(SignaturePlugin.id);
const useSignatureCapability = () => useCapability(SignaturePlugin.id);
function useSignatureEntries() {
  const capability = useSignatureCapability();
  let entries = $.state($.proxy([]));
  $.user_effect(() => {
    if (!capability.provides) {
      $.set(entries, [], true);
      return;
    }
    $.set(entries, capability.provides.getEntries(), true);
    return capability.provides.onEntriesChange((updated) => {
      $.set(entries, updated, true);
    });
  });
  return {
    get entries() {
      return $.get(entries);
    }
  };
}
function useActivePlacement(getDocumentId) {
  const capability = useSignatureCapability();
  let activePlacement = $.state(null);
  const documentId = $.derived(getDocumentId);
  $.user_effect(() => {
    if (!capability.provides || !$.get(documentId)) {
      $.set(activePlacement, null);
      return;
    }
    const scope = capability.provides.forDocument($.get(documentId));
    $.set(activePlacement, scope.getActivePlacement(), true);
    return scope.onActivePlacementChange((placement) => {
      $.set(activePlacement, placement, true);
    });
  });
  return {
    get activePlacement() {
      return $.get(activePlacement);
    }
  };
}
function useSignatureUpload({ accept = "image/png,image/jpeg,image/svg+xml", onResult }) {
  const inputRef = { current: null };
  let previewUrl = $.state(null);
  let isDragging = $.state(false);
  function processFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const blob = new Blob([arrayBuffer], { type: file.type });
      const dataUrl = URL.createObjectURL(blob);
      if ($.get(previewUrl)) URL.revokeObjectURL($.get(previewUrl));
      $.set(previewUrl, dataUrl, true);
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
  }
  function handleFileInputChange(e) {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }
  function handleDrop(e) {
    var _a;
    e.preventDefault();
    $.set(isDragging, false);
    const files = (_a = e.dataTransfer) == null ? void 0 : _a.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }
  function handleDragOver(e) {
    e.preventDefault();
    $.set(isDragging, true);
  }
  function handleDragLeave() {
    $.set(isDragging, false);
  }
  function openFilePicker() {
    var _a;
    (_a = inputRef.current) == null ? void 0 : _a.click();
  }
  function clear() {
    if ($.get(previewUrl)) URL.revokeObjectURL($.get(previewUrl));
    $.set(previewUrl, null);
    onResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  return {
    inputRef,
    openFilePicker,
    processFile,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    get previewUrl() {
      return $.get(previewUrl);
    },
    get isDragging() {
      return $.get(isDragging);
    },
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
var root$1 = $.from_html(`<canvas style="touch-action: none; width: 100%; height: 100%; display: block;"></canvas>`);
function SignatureDrawPad($$anchor, $$props) {
  $.push($$props, true);
  let strokeColor = $.prop($$props, "strokeColor", 3, "#000000"), strokeWidth = $.prop($$props, "strokeWidth", 3, 4), className = $.prop($$props, "class", 3, "");
  let canvasEl = $.state(void 0);
  let strokes = $.state($.proxy([]));
  let isDrawing = false;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  function getCanvasPos(e) {
    if (!$.get(canvasEl)) return { x: 0, y: 0 };
    const rect = $.get(canvasEl).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * ($.get(canvasEl).width / dpr / rect.width),
      y: (e.clientY - rect.top) * ($.get(canvasEl).height / dpr / rect.height)
    };
  }
  function redraw(currentStrokes) {
    if (!$.get(canvasEl)) return;
    const ctx = $.get(canvasEl).getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, $.get(canvasEl).width, $.get(canvasEl).height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = strokeWidth();
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
  }
  function emitResult(currentStrokes) {
    if (currentStrokes.length === 0 || currentStrokes.every((s) => s.points.length < 2)) {
      $$props.onResult(null);
      return;
    }
    if (!$.get(canvasEl)) return;
    const cropped = cropCanvas($.get(canvasEl), Math.ceil(strokeWidth() * dpr));
    if (!cropped) {
      $$props.onResult(null);
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
          points: s.points.map((p) => ({ x: p.x - offsetX, y: p.y - offsetY }))
        })),
        strokeWidth: strokeWidth(),
        strokeColor: strokeColor(),
        size: { width: croppedWidth, height: croppedHeight }
      },
      previewDataUrl: cropped.canvas.toDataURL("image/png")
    };
    $$props.onResult(result);
  }
  function clear() {
    $.set(strokes, [], true);
    redraw([]);
    $$props.onResult(null);
  }
  function handlePointerDown(e) {
    var _a, _b;
    isDrawing = true;
    const pos = getCanvasPos(e);
    $.set(strokes, [...$.get(strokes), { points: [pos] }], true);
    redraw($.get(strokes));
    (_b = (_a = e.target) == null ? void 0 : _a.setPointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
  }
  function handlePointerMove(e) {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    const last = $.get(strokes)[$.get(strokes).length - 1];
    if (last) {
      last.points.push(pos);
      $.set(strokes, [...$.get(strokes)], true);
      redraw($.get(strokes));
    }
  }
  function handlePointerUp(e) {
    var _a, _b;
    isDrawing = false;
    (_b = (_a = e.target) == null ? void 0 : _a.releasePointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
    emitResult($.get(strokes));
  }
  $.user_effect(() => {
    if (!$.get(canvasEl)) return;
    const observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0 && $.get(canvasEl)) {
        $.get(canvasEl).width = Math.round(w) * dpr;
        $.get(canvasEl).height = Math.round(h) * dpr;
        redraw($.get(strokes));
      }
    });
    observer.observe($.get(canvasEl));
    return () => observer.disconnect();
  });
  $.user_effect(() => {
    void strokeColor();
    void strokeWidth();
    redraw($.get(strokes));
    if ($.get(strokes).length > 0 && $.get(strokes).some((s) => s.points.length >= 2)) {
      emitResult($.get(strokes));
    }
  });
  var $$exports = { clear };
  var canvas = root$1();
  canvas.__pointerdown = handlePointerDown;
  canvas.__pointermove = handlePointerMove;
  canvas.__pointerup = handlePointerUp;
  $.bind_this(canvas, ($$value) => $.set(canvasEl, $$value), () => $.get(canvasEl));
  $.template_effect(() => $.set_class(canvas, 1, $.clsx(className())));
  $.append($$anchor, canvas);
  return $.pop($$exports);
}
$.delegate(["pointerdown", "pointermove", "pointerup"]);
var root = $.from_html(`<div style="width: 100%; height: 100%;"><!> <input type="text"/> <canvas style="display: none;"></canvas></div>`);
function SignatureTypePad($$anchor, $$props) {
  $.push($$props, true);
  let fontFamily = $.prop($$props, "fontFamily", 3, "'Dancing Script', cursive"), fontSize = $.prop($$props, "fontSize", 3, 48), color = $.prop($$props, "color", 3, "#000000"), className = $.prop($$props, "class", 3, ""), placeholder = $.prop($$props, "placeholder", 3, "Type your signature...");
  let wrapperEl = $.state(void 0);
  let canvasEl = $.state(void 0);
  let text = $.state("");
  let size = { width: 0, height: 0 };
  const inputId = `sig-type-${Math.random().toString(36).slice(2, 8)}`;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  function renderText(currentText) {
    if (!$.get(canvasEl)) return;
    const { width, height } = size;
    if (width === 0 || height === 0) return;
    $.get(canvasEl).width = width * dpr;
    $.get(canvasEl).height = height * dpr;
    const ctx = $.get(canvasEl).getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, $.get(canvasEl).width, $.get(canvasEl).height);
    if (!currentText.trim()) {
      $$props.onResult(null);
      return;
    }
    ctx.scale(dpr, dpr);
    ctx.fillStyle = color();
    ctx.font = `${fontSize()}px ${fontFamily()}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(currentText, width / 2, height / 2, width - 20);
    const cropped = cropCanvas($.get(canvasEl), Math.ceil(4 * dpr));
    if (!cropped) {
      $$props.onResult(null);
      return;
    }
    const croppedWidth = Math.round(cropped.bounds.width / dpr);
    const croppedHeight = Math.round(cropped.bounds.height / dpr);
    cropped.canvas.toBlob(
      (blob) => {
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
          $$props.onResult(result);
        });
      },
      "image/png"
    );
  }
  function clear() {
    $.set(text, "");
    $$props.onResult(null);
  }
  function handleInput(e) {
    $.set(text, e.target.value, true);
  }
  $.user_effect(() => {
    if (!$.get(wrapperEl)) return;
    const observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        size = { width: Math.round(w), height: Math.round(h) };
        renderText($.get(text));
      }
    });
    observer.observe($.get(wrapperEl));
    return () => observer.disconnect();
  });
  $.user_effect(() => {
    void fontFamily();
    void color();
    renderText($.get(text));
  });
  var $$exports = { clear };
  var div = root();
  var node = $.child(div);
  $.html(node, () => `<style>#${inputId}::placeholder { color: ${color()}; opacity: 0.5; }</style>`);
  var input = $.sibling(node, 2);
  $.remove_input_defaults(input);
  input.__input = handleInput;
  var canvas = $.sibling(input, 2);
  $.bind_this(canvas, ($$value) => $.set(canvasEl, $$value), () => $.get(canvasEl));
  $.reset(div);
  $.bind_this(div, ($$value) => $.set(wrapperEl, $$value), () => $.get(wrapperEl));
  $.template_effect(
    ($0) => {
      $.set_class(div, 1, $.clsx(className()));
      $.set_attribute(input, "id", inputId);
      $.set_value(input, $.get(text));
      $.set_attribute(input, "placeholder", placeholder());
      $.set_style(input, `font-family: ${fontFamily() ?? ""}; font-size: ${$0 ?? ""}px; color: ${color() ?? ""}; width: 100%; height: 100%; border: none; outline: none; background: transparent; text-indent: 8px;`);
    },
    [() => Math.min(fontSize(), 32)]
  );
  $.append($$anchor, div);
  return $.pop($$exports);
}
$.delegate(["input"]);
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
