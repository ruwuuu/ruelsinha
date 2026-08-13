import { createPluginPackage } from "@embedpdf/core";
import { SignaturePlugin, SignatureCreationType, SignaturePluginPackage as SignaturePluginPackage$1 } from "@embedpdf/plugin-signature";
export * from "@embedpdf/plugin-signature";
import { usePlugin, useCapability } from "@embedpdf/core/vue";
import { ref, watch, toValue, defineComponent, onMounted, onUnmounted, openBlock, createElementBlock, computed, createBlock, resolveDynamicComponent, toDisplayString, createElementVNode, normalizeStyle } from "vue";
const useSignaturePlugin = () => usePlugin(SignaturePlugin.id);
const useSignatureCapability = () => useCapability(SignaturePlugin.id);
const useSignatureEntries = () => {
  const { provides } = useSignatureCapability();
  const entries = ref([]);
  watch(
    provides,
    (capability, _, onCleanup) => {
      if (!capability) {
        entries.value = [];
        return;
      }
      entries.value = capability.getEntries();
      const unsubscribe = capability.onEntriesChange((updated) => {
        entries.value = updated;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return { entries };
};
const useActivePlacement = (documentId) => {
  const { provides } = useSignatureCapability();
  const activePlacement = ref(null);
  watch(
    [provides, () => toValue(documentId)],
    ([capability, docId], _, onCleanup) => {
      if (!capability || !docId) {
        activePlacement.value = null;
        return;
      }
      const scope = capability.forDocument(docId);
      activePlacement.value = scope.getActivePlacement();
      const unsubscribe = scope.onActivePlacementChange((placement) => {
        activePlacement.value = placement;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return activePlacement;
};
function useSignatureUpload({
  accept = "image/png,image/jpeg,image/svg+xml",
  onResult
}) {
  const inputRef = ref(null);
  const previewUrl = ref(null);
  const isDragging = ref(false);
  function processFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const blob = new Blob([arrayBuffer], { type: file.type });
      const dataUrl = URL.createObjectURL(blob);
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = dataUrl;
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
    isDragging.value = false;
    const files = (_a = e.dataTransfer) == null ? void 0 : _a.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }
  function handleDragOver(e) {
    e.preventDefault();
    isDragging.value = true;
  }
  function handleDragLeave() {
    isDragging.value = false;
  }
  function openFilePicker() {
    var _a;
    (_a = inputRef.value) == null ? void 0 : _a.click();
  }
  function clear() {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
    onResult(null);
    if (inputRef.value) {
      inputRef.value.value = "";
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
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SignatureDrawPad",
  props: {
    onResult: {},
    strokeColor: { default: "#000000" },
    strokeWidth: { default: 4 }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const canvasRef = ref(null);
    const strokes = ref([]);
    let isDrawing = false;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    let observer = null;
    function getCanvasPos(e) {
      const canvas = canvasRef.value;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / dpr / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / dpr / rect.height)
      };
    }
    function redraw(currentStrokes) {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = props.strokeWidth;
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
        props.onResult(null);
        return;
      }
      const canvas = canvasRef.value;
      if (!canvas) return;
      const cropped = cropCanvas(canvas, Math.ceil(props.strokeWidth * dpr));
      if (!cropped) {
        props.onResult(null);
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
          strokeWidth: props.strokeWidth,
          strokeColor: props.strokeColor,
          size: { width: croppedWidth, height: croppedHeight }
        },
        previewDataUrl: cropped.canvas.toDataURL("image/png")
      };
      props.onResult(result);
    }
    function clear() {
      strokes.value = [];
      redraw([]);
      props.onResult(null);
    }
    __expose({ clear });
    function handlePointerDown(e) {
      var _a, _b;
      isDrawing = true;
      const pos = getCanvasPos(e);
      strokes.value = [...strokes.value, { points: [pos] }];
      redraw(strokes.value);
      (_b = (_a = e.target) == null ? void 0 : _a.setPointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
    }
    function handlePointerMove(e) {
      if (!isDrawing) return;
      const pos = getCanvasPos(e);
      const last = strokes.value[strokes.value.length - 1];
      if (last) {
        last.points.push(pos);
        strokes.value = [...strokes.value];
        redraw(strokes.value);
      }
    }
    function handlePointerUp(e) {
      var _a, _b;
      isDrawing = false;
      (_b = (_a = e.target) == null ? void 0 : _a.releasePointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
      emitResult(strokes.value);
    }
    watch([() => props.strokeColor, () => props.strokeWidth], () => {
      redraw(strokes.value);
      if (strokes.value.length > 0 && strokes.value.some((s) => s.points.length >= 2)) {
        emitResult(strokes.value);
      }
    });
    onMounted(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      observer = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        if (w > 0 && h > 0 && canvasRef.value) {
          canvasRef.value.width = Math.round(w) * dpr;
          canvasRef.value.height = Math.round(h) * dpr;
          redraw(strokes.value);
        }
      });
      observer.observe(canvas);
    });
    onUnmounted(() => {
      observer == null ? void 0 : observer.disconnect();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("canvas", {
        ref_key: "canvasRef",
        ref: canvasRef,
        style: { touchAction: "none", width: "100%", height: "100%", display: "block" },
        onPointerdown: handlePointerDown,
        onPointermove: handlePointerMove,
        onPointerup: handlePointerUp
      }, null, 544);
    };
  }
});
const _hoisted_1 = ["value", "placeholder"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SignatureTypePad",
  props: {
    onResult: {},
    fontFamily: { default: "'Dancing Script', cursive" },
    fontSize: { default: 48 },
    color: { default: "#000000" },
    placeholder: { default: "Type your signature..." }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const wrapperRef = ref(null);
    const canvasRef = ref(null);
    const text = ref("");
    const inputId = `sig-type-${Math.random().toString(36).slice(2, 8)}`;
    let size = { width: 0, height: 0 };
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    let observer = null;
    const placeholderStyle = computed(
      () => `#${inputId}::placeholder { color: ${props.color}; opacity: 0.5; }`
    );
    const inputStyle = computed(() => ({
      fontFamily: props.fontFamily,
      fontSize: `${Math.min(props.fontSize, 32)}px`,
      color: props.color,
      width: "100%",
      height: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      textIndent: "8px"
    }));
    function renderText(currentText) {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const { width, height } = size;
      if (width === 0 || height === 0) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!currentText.trim()) {
        props.onResult(null);
        return;
      }
      ctx.scale(dpr, dpr);
      ctx.fillStyle = props.color;
      ctx.font = `${props.fontSize}px ${props.fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(currentText, width / 2, height / 2, width - 20);
      const cropped = cropCanvas(canvas, Math.ceil(4 * dpr));
      if (!cropped) {
        props.onResult(null);
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
          props.onResult(result);
        });
      }, "image/png");
    }
    function clear() {
      text.value = "";
      props.onResult(null);
    }
    __expose({ clear });
    function handleInput(e) {
      text.value = e.target.value;
    }
    watch([text, () => props.fontFamily, () => props.color], () => {
      renderText(text.value);
    });
    onMounted(() => {
      const wrapper = wrapperRef.value;
      if (!wrapper) return;
      observer = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        if (w > 0 && h > 0) {
          size = { width: Math.round(w), height: Math.round(h) };
          renderText(text.value);
        }
      });
      observer.observe(wrapper);
    });
    onUnmounted(() => {
      observer == null ? void 0 : observer.disconnect();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "wrapperRef",
        ref: wrapperRef,
        style: { width: "100%", height: "100%" }
      }, [
        (openBlock(), createBlock(resolveDynamicComponent("style"), {
          textContent: toDisplayString(placeholderStyle.value)
        }, null, 8, ["textContent"])),
        createElementVNode("input", {
          id: inputId,
          type: "text",
          value: text.value,
          onInput: handleInput,
          placeholder: __props.placeholder,
          style: normalizeStyle(inputStyle.value)
        }, null, 44, _hoisted_1),
        createElementVNode("canvas", {
          ref_key: "canvasRef",
          ref: canvasRef,
          style: { display: "none" }
        }, null, 512)
      ], 512);
    };
  }
});
const SignaturePluginPackage = createPluginPackage(SignaturePluginPackage$1).build();
export {
  _sfc_main$1 as SignatureDrawPad,
  SignaturePluginPackage,
  _sfc_main as SignatureTypePad,
  useActivePlacement,
  useSignatureCapability,
  useSignatureEntries,
  useSignaturePlugin,
  useSignatureUpload
};
//# sourceMappingURL=index.js.map
