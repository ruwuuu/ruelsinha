import { jsx } from "react/jsx-runtime";
import { getCounterRotation } from "@embedpdf/utils";
import { useRef, useEffect, Fragment, useCallback, useMemo } from "react";
import { rotatePointAround, calculateRotatedRectAABB, normalizeAngle } from "@embedpdf/models";
const dblClickProp = "onDoubleClick";
function CounterRotate({ children, ...props }) {
  const { rect, rotation } = props;
  const { matrix, width, height } = getCounterRotation(rect, rotation);
  const elementRef = useRef(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const handlePointerDown = (e) => {
      e.stopPropagation();
    };
    const handleTouchStart = (e) => {
      e.stopPropagation();
    };
    element.addEventListener("pointerdown", handlePointerDown, { capture: true });
    element.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    return () => {
      element.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      element.removeEventListener("touchstart", handleTouchStart, { capture: true });
    };
  }, []);
  const menuWrapperStyle = {
    position: "absolute",
    left: rect.origin.x,
    top: rect.origin.y,
    transform: matrix,
    transformOrigin: "0 0",
    width,
    height,
    pointerEvents: "none",
    zIndex: 3
  };
  const menuWrapperProps = {
    style: menuWrapperStyle,
    ref: (el) => {
      elementRef.current = el;
    }
  };
  return /* @__PURE__ */ jsx(Fragment, { children: children({
    menuWrapperProps,
    matrix,
    rect: {
      origin: { x: rect.origin.x, y: rect.origin.y },
      size: { width, height }
    }
  }) });
}
function getAnchor(handle) {
  return {
    x: handle.includes("e") ? "left" : handle.includes("w") ? "right" : "center",
    y: handle.includes("s") ? "top" : handle.includes("n") ? "bottom" : "center"
  };
}
function getAnchorPoint(rect, anchor) {
  const x = anchor.x === "left" ? rect.origin.x : anchor.x === "right" ? rect.origin.x + rect.size.width : rect.origin.x + rect.size.width / 2;
  const y = anchor.y === "top" ? rect.origin.y : anchor.y === "bottom" ? rect.origin.y + rect.size.height : rect.origin.y + rect.size.height / 2;
  return { x, y };
}
function applyResizeDelta(startRect, delta, anchor) {
  let x = startRect.origin.x;
  let y = startRect.origin.y;
  let width = startRect.size.width;
  let height = startRect.size.height;
  if (anchor.x === "left") {
    width += delta.x;
  } else if (anchor.x === "right") {
    x += delta.x;
    width -= delta.x;
  }
  if (anchor.y === "top") {
    height += delta.y;
  } else if (anchor.y === "bottom") {
    y += delta.y;
    height -= delta.y;
  }
  return { origin: { x, y }, size: { width, height } };
}
function enforceAspectRatio(rect, startRect, anchor, aspectRatio) {
  let { x, y } = rect.origin;
  let { width, height } = rect.size;
  const isEdgeHandle = anchor.x === "center" || anchor.y === "center";
  if (isEdgeHandle) {
    if (anchor.y === "center") {
      height = width / aspectRatio;
      y = startRect.origin.y + (startRect.size.height - height) / 2;
    } else {
      width = height * aspectRatio;
      x = startRect.origin.x + (startRect.size.width - width) / 2;
    }
  } else {
    const dw = Math.abs(width - startRect.size.width);
    const dh = Math.abs(height - startRect.size.height);
    const total = dw + dh;
    if (total === 0) {
      width = startRect.size.width;
      height = startRect.size.height;
    } else {
      const wWeight = dw / total;
      const hWeight = dh / total;
      const wFromW = width;
      const hFromW = width / aspectRatio;
      const wFromH = height * aspectRatio;
      const hFromH = height;
      width = wWeight * wFromW + hWeight * wFromH;
      height = wWeight * hFromW + hWeight * hFromH;
    }
  }
  if (anchor.x === "right") {
    x = startRect.origin.x + startRect.size.width - width;
  }
  if (anchor.y === "bottom") {
    y = startRect.origin.y + startRect.size.height - height;
  }
  return { origin: { x, y }, size: { width, height } };
}
function clampToBounds(rect, startRect, anchor, bbox, maintainAspectRatio) {
  if (!bbox) return rect;
  let { x, y } = rect.origin;
  let { width, height } = rect.size;
  width = Math.max(1, width);
  height = Math.max(1, height);
  const anchorX = anchor.x === "left" ? startRect.origin.x : startRect.origin.x + startRect.size.width;
  const anchorY = anchor.y === "top" ? startRect.origin.y : startRect.origin.y + startRect.size.height;
  const maxW = anchor.x === "left" ? bbox.width - anchorX : anchor.x === "right" ? anchorX : Math.min(startRect.origin.x, bbox.width - startRect.origin.x - startRect.size.width) * 2 + startRect.size.width;
  const maxH = anchor.y === "top" ? bbox.height - anchorY : anchor.y === "bottom" ? anchorY : Math.min(startRect.origin.y, bbox.height - startRect.origin.y - startRect.size.height) * 2 + startRect.size.height;
  if (maintainAspectRatio) {
    const scaleW = width > maxW ? maxW / width : 1;
    const scaleH = height > maxH ? maxH / height : 1;
    const scale = Math.min(scaleW, scaleH);
    if (scale < 1) {
      width *= scale;
      height *= scale;
    }
  } else {
    width = Math.min(width, maxW);
    height = Math.min(height, maxH);
  }
  if (anchor.x === "left") {
    x = anchorX;
  } else if (anchor.x === "right") {
    x = anchorX - width;
  } else {
    x = startRect.origin.x + (startRect.size.width - width) / 2;
  }
  if (anchor.y === "top") {
    y = anchorY;
  } else if (anchor.y === "bottom") {
    y = anchorY - height;
  } else {
    y = startRect.origin.y + (startRect.size.height - height) / 2;
  }
  x = Math.max(0, Math.min(x, bbox.width - width));
  y = Math.max(0, Math.min(y, bbox.height - height));
  return { origin: { x, y }, size: { width, height } };
}
function reanchorRect(rect, startRect, anchor) {
  let x;
  let y;
  if (anchor.x === "left") {
    x = startRect.origin.x;
  } else if (anchor.x === "right") {
    x = startRect.origin.x + startRect.size.width - rect.size.width;
  } else {
    x = startRect.origin.x + (startRect.size.width - rect.size.width) / 2;
  }
  if (anchor.y === "top") {
    y = startRect.origin.y;
  } else if (anchor.y === "bottom") {
    y = startRect.origin.y + startRect.size.height - rect.size.height;
  } else {
    y = startRect.origin.y + (startRect.size.height - rect.size.height) / 2;
  }
  return { origin: { x, y }, size: rect.size };
}
function applyConstraints(position, constraints, maintainAspectRatio, skipBoundingClamp = false) {
  if (!constraints) return position;
  let {
    origin: { x, y },
    size: { width, height }
  } = position;
  const minW = constraints.minWidth ?? 1;
  const minH = constraints.minHeight ?? 1;
  const maxW = constraints.maxWidth;
  const maxH = constraints.maxHeight;
  if (maintainAspectRatio && width > 0 && height > 0) {
    const ratio = width / height;
    if (width < minW) {
      width = minW;
      height = width / ratio;
    }
    if (height < minH) {
      height = minH;
      width = height * ratio;
    }
    if (maxW !== void 0 && width > maxW) {
      width = maxW;
      height = width / ratio;
    }
    if (maxH !== void 0 && height > maxH) {
      height = maxH;
      width = height * ratio;
    }
  } else {
    width = Math.max(minW, width);
    height = Math.max(minH, height);
    if (maxW !== void 0) width = Math.min(maxW, width);
    if (maxH !== void 0) height = Math.min(maxH, height);
  }
  if (constraints.boundingBox && !skipBoundingClamp) {
    x = Math.max(0, Math.min(x, constraints.boundingBox.width - width));
    y = Math.max(0, Math.min(y, constraints.boundingBox.height - height));
  }
  return { origin: { x, y }, size: { width, height } };
}
function isRectWithinRotatedBounds(rect, angleDegrees, bbox) {
  const eps = 1e-6;
  const aabb = calculateRotatedRectAABB(rect, angleDegrees);
  return aabb.origin.x >= -eps && aabb.origin.y >= -eps && aabb.origin.x + aabb.size.width <= bbox.width + eps && aabb.origin.y + aabb.size.height <= bbox.height + eps;
}
function computeResizeStep(delta, handle, config, clampLocalBounds, skipConstraintBoundingClamp) {
  const { startRect, maintainAspectRatio = false, annotationRotation = 0, constraints } = config;
  const anchor = getAnchor(handle);
  const aspectRatio = startRect.size.width / startRect.size.height || 1;
  let rect = applyResizeDelta(startRect, delta, anchor);
  if (maintainAspectRatio) {
    rect = enforceAspectRatio(rect, startRect, anchor, aspectRatio);
  }
  if (clampLocalBounds) {
    rect = clampToBounds(rect, startRect, anchor, constraints == null ? void 0 : constraints.boundingBox, maintainAspectRatio);
  }
  rect = applyConstraints(rect, constraints, maintainAspectRatio, skipConstraintBoundingClamp);
  if (skipConstraintBoundingClamp) {
    rect = reanchorRect(rect, startRect, anchor);
  }
  if (annotationRotation !== 0) {
    const anchorPt = getAnchorPoint(startRect, anchor);
    const oldCenter = {
      x: startRect.origin.x + startRect.size.width / 2,
      y: startRect.origin.y + startRect.size.height / 2
    };
    const newCenter = {
      x: rect.origin.x + rect.size.width / 2,
      y: rect.origin.y + rect.size.height / 2
    };
    const oldVisual = rotatePointAround(anchorPt, oldCenter, annotationRotation);
    const newVisual = rotatePointAround(anchorPt, newCenter, annotationRotation);
    rect = {
      origin: {
        x: rect.origin.x + (oldVisual.x - newVisual.x),
        y: rect.origin.y + (oldVisual.y - newVisual.y)
      },
      size: rect.size
    };
  }
  return rect;
}
function computeResizedRect(delta, handle, config) {
  const { annotationRotation = 0, constraints } = config;
  const bbox = constraints == null ? void 0 : constraints.boundingBox;
  if (annotationRotation !== 0 && bbox) {
    const target = computeResizeStep(delta, handle, config, false, true);
    if (isRectWithinRotatedBounds(target, annotationRotation, bbox)) {
      return target;
    }
    let best = computeResizeStep({ x: 0, y: 0 }, handle, config, false, true);
    let low = 0;
    let high = 1;
    for (let i = 0; i < 20; i += 1) {
      const mid = (low + high) / 2;
      const trial = computeResizeStep(
        { x: delta.x * mid, y: delta.y * mid },
        handle,
        config,
        false,
        true
      );
      if (isRectWithinRotatedBounds(trial, annotationRotation, bbox)) {
        best = trial;
        low = mid;
      } else {
        high = mid;
      }
    }
    return best;
  }
  return computeResizeStep(delta, handle, config, true, false);
}
const ROTATION_HANDLE_MARGIN = 35;
const HANDLE_BASE_ANGLE = {
  n: 0,
  ne: 45,
  e: 90,
  se: 135,
  s: 180,
  sw: 225,
  w: 270,
  nw: 315
};
const SECTOR_CURSORS = [
  "ns-resize",
  // 0: north
  "nesw-resize",
  // 1: NE
  "ew-resize",
  // 2: east
  "nwse-resize",
  // 3: SE
  "ns-resize",
  // 4: south
  "nesw-resize",
  // 5: SW
  "ew-resize",
  // 6: west
  "nwse-resize"
  // 7: NW
];
function diagonalCursor(handle, pageQuarterTurns, annotationRotation = 0) {
  const pageAngle = pageQuarterTurns * 90;
  const totalAngle = HANDLE_BASE_ANGLE[handle] + pageAngle + annotationRotation;
  const normalized = (totalAngle % 360 + 360) % 360;
  const sector = Math.round(normalized / 45) % 8;
  return SECTOR_CURSORS[sector];
}
function edgeOffset(k, spacing, mode) {
  const base = -k / 2;
  if (mode === "center") return base;
  return mode === "outside" ? base - spacing : base + spacing;
}
function describeResizeFromConfig(cfg, ui = {}) {
  const {
    handleSize = 8,
    spacing = 1,
    offsetMode = "outside",
    includeSides = false,
    zIndex = 3,
    rotationAwareCursor = true
  } = ui;
  const pageQuarterTurns = (cfg.pageRotation ?? 0) % 4;
  const annotationRot = cfg.annotationRotation ?? 0;
  const off = (edge) => ({
    [edge]: edgeOffset(handleSize, spacing, offsetMode) + "px"
  });
  const corners = [
    ["nw", { ...off("top"), ...off("left") }],
    ["ne", { ...off("top"), ...off("right") }],
    ["sw", { ...off("bottom"), ...off("left") }],
    ["se", { ...off("bottom"), ...off("right") }]
  ];
  const sides = includeSides ? [
    ["n", { ...off("top"), left: `calc(50% - ${handleSize / 2}px)` }],
    ["s", { ...off("bottom"), left: `calc(50% - ${handleSize / 2}px)` }],
    ["w", { ...off("left"), top: `calc(50% - ${handleSize / 2}px)` }],
    ["e", { ...off("right"), top: `calc(50% - ${handleSize / 2}px)` }]
  ] : [];
  const all = [...corners, ...sides];
  return all.map(([handle, pos]) => ({
    handle,
    style: {
      position: "absolute",
      width: handleSize + "px",
      height: handleSize + "px",
      borderRadius: "50%",
      zIndex,
      cursor: rotationAwareCursor ? diagonalCursor(handle, pageQuarterTurns, annotationRot) : "default",
      pointerEvents: "auto",
      touchAction: "none",
      ...pos
    },
    attrs: { "data-epdf-handle": handle }
  }));
}
function describeVerticesFromConfig(cfg, ui = {}, liveVertices) {
  const { vertexSize = 12, zIndex = 4 } = ui;
  const rect = cfg.element;
  const scale = cfg.scale ?? 1;
  const verts = liveVertices ?? cfg.vertices ?? [];
  return verts.map((v, i) => {
    const left = (v.x - rect.origin.x) * scale - vertexSize / 2;
    const top = (v.y - rect.origin.y) * scale - vertexSize / 2;
    return {
      handle: "nw",
      // not used; kept for type
      style: {
        position: "absolute",
        left: left + "px",
        top: top + "px",
        width: vertexSize + "px",
        height: vertexSize + "px",
        borderRadius: "50%",
        cursor: "pointer",
        zIndex,
        pointerEvents: "auto",
        touchAction: "none"
      },
      attrs: { "data-epdf-vertex": i }
    };
  });
}
function describeRotationFromConfig(cfg, ui = {}, currentAngle = 0) {
  const { handleSize = 16, zIndex = 5, showConnector = true, connectorWidth = 1 } = ui;
  const scale = cfg.scale ?? 1;
  const rect = cfg.element;
  const orbitRect = cfg.rotationElement ?? rect;
  const orbitCenter = cfg.rotationCenter ?? {
    x: rect.origin.x + rect.size.width / 2,
    y: rect.origin.y + rect.size.height / 2
  };
  orbitRect.size.width * scale;
  orbitRect.size.height * scale;
  const centerX = (orbitCenter.x - orbitRect.origin.x) * scale;
  const centerY = (orbitCenter.y - orbitRect.origin.y) * scale;
  const angleRad = currentAngle * Math.PI / 180;
  const margin = ui.margin ?? ROTATION_HANDLE_MARGIN;
  const radius = rect.size.height * scale / 2 + margin;
  const handleCenterX = centerX + radius * Math.sin(angleRad);
  const handleCenterY = centerY - radius * Math.cos(angleRad);
  const handleLeft = handleCenterX - handleSize / 2;
  const handleTop = handleCenterY - handleSize / 2;
  return {
    handleStyle: {
      position: "absolute",
      left: handleLeft + "px",
      top: handleTop + "px",
      width: handleSize + "px",
      height: handleSize + "px",
      borderRadius: "50%",
      cursor: "grab",
      zIndex,
      pointerEvents: "auto",
      touchAction: "none"
    },
    connectorStyle: showConnector ? {
      position: "absolute",
      left: centerX - connectorWidth / 2 + "px",
      top: centerY - radius + "px",
      width: connectorWidth + "px",
      height: radius + "px",
      transformOrigin: "center bottom",
      transform: `rotate(${currentAngle}deg)`,
      zIndex: zIndex - 1,
      pointerEvents: "none"
    } : {},
    radius,
    attrs: { "data-epdf-rotation-handle": true }
  };
}
class DragResizeController {
  constructor(config, onUpdate) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.state = "idle";
    this.startPoint = null;
    this.startElement = null;
    this.startRotationElement = null;
    this.gestureRotationCenter = null;
    this.activeHandle = null;
    this.currentPosition = null;
    this.activeVertexIndex = null;
    this.startVertices = [];
    this.currentVertices = [];
    this.rotationCenter = null;
    this.centerScreen = null;
    this.initialRotation = 0;
    this.lastComputedRotation = 0;
    this.rotationDelta = 0;
    this.rotationSnappedAngle = null;
    this.currentVertices = config.vertices || [];
  }
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (this.state !== "vertex-editing") {
      this.currentVertices = config.vertices || [];
    }
  }
  // ---------------------------------------------------------------------------
  // Gesture start
  // ---------------------------------------------------------------------------
  startDrag(clientX, clientY) {
    this.state = "dragging";
    this.startPoint = { x: clientX, y: clientY };
    this.startElement = { ...this.config.element };
    this.startRotationElement = this.config.rotationElement ? { ...this.config.rotationElement } : null;
    this.currentPosition = { ...this.config.element };
    this.onUpdate({
      state: "start",
      transformData: {
        type: "move",
        changes: { rect: this.startElement }
      }
    });
  }
  startResize(handle, clientX, clientY) {
    this.state = "resizing";
    this.activeHandle = handle;
    this.startPoint = { x: clientX, y: clientY };
    this.startElement = { ...this.config.element };
    this.currentPosition = { ...this.config.element };
    this.onUpdate({
      state: "start",
      transformData: {
        type: "resize",
        changes: { rect: this.startElement },
        metadata: {
          handle: this.activeHandle,
          maintainAspectRatio: this.config.maintainAspectRatio
        }
      }
    });
  }
  startVertexEdit(vertexIndex, clientX, clientY) {
    this.currentVertices = [...this.config.vertices ?? this.currentVertices];
    if (vertexIndex < 0 || vertexIndex >= this.currentVertices.length) return;
    this.state = "vertex-editing";
    this.activeVertexIndex = vertexIndex;
    this.startPoint = { x: clientX, y: clientY };
    this.startVertices = [...this.currentVertices];
    this.gestureRotationCenter = this.config.rotationCenter ?? {
      x: this.config.element.origin.x + this.config.element.size.width / 2,
      y: this.config.element.origin.y + this.config.element.size.height / 2
    };
    this.onUpdate({
      state: "start",
      transformData: {
        type: "vertex-edit",
        changes: { vertices: this.startVertices },
        metadata: { vertexIndex }
      }
    });
  }
  startRotation(clientX, clientY, initialRotation = 0, orbitRadiusPx) {
    this.state = "rotating";
    this.startPoint = { x: clientX, y: clientY };
    this.startElement = { ...this.config.element };
    this.rotationCenter = this.config.rotationCenter ?? {
      x: this.config.element.origin.x + this.config.element.size.width / 2,
      y: this.config.element.origin.y + this.config.element.size.height / 2
    };
    const { scale = 1 } = this.config;
    const orbitRect = this.config.rotationElement ?? this.config.element;
    const sw = orbitRect.size.width * scale;
    const sh = orbitRect.size.height * scale;
    const radius = orbitRadiusPx ?? Math.max(sw, sh) / 2 + ROTATION_HANDLE_MARGIN;
    const pageRotOffset = (this.config.pageRotation ?? 0) * 90;
    const screenAngleRad = (initialRotation + pageRotOffset) * Math.PI / 180;
    this.centerScreen = {
      x: clientX - radius * Math.sin(screenAngleRad),
      y: clientY + radius * Math.cos(screenAngleRad)
    };
    this.initialRotation = initialRotation;
    this.lastComputedRotation = initialRotation;
    this.rotationDelta = 0;
    this.rotationSnappedAngle = null;
    this.onUpdate({
      state: "start",
      transformData: {
        type: "rotate",
        changes: { rotation: initialRotation },
        metadata: {
          rotationAngle: initialRotation,
          rotationDelta: 0,
          rotationCenter: this.rotationCenter,
          isSnapped: false
        }
      }
    });
  }
  // ---------------------------------------------------------------------------
  // Gesture move
  // ---------------------------------------------------------------------------
  move(clientX, clientY, buttons, lockAspectRatio) {
    if (this.state === "idle" || !this.startPoint) return;
    if (buttons !== void 0 && buttons === 0) {
      this.end();
      return;
    }
    if (this.state === "dragging" && this.startElement) {
      const delta = this.calculateDelta(clientX, clientY);
      const position = this.calculateDragPosition(delta);
      this.currentPosition = position;
      this.onUpdate({
        state: "move",
        transformData: { type: "move", changes: { rect: position } }
      });
    } else if (this.state === "resizing" && this.activeHandle && this.startElement) {
      const delta = this.calculateLocalDelta(clientX, clientY);
      const position = computeResizedRect(delta, this.activeHandle, {
        startRect: this.startElement,
        maintainAspectRatio: this.config.maintainAspectRatio || !!lockAspectRatio,
        annotationRotation: this.config.annotationRotation,
        constraints: this.config.constraints
      });
      this.currentPosition = position;
      this.onUpdate({
        state: "move",
        transformData: {
          type: "resize",
          changes: { rect: position },
          metadata: {
            handle: this.activeHandle,
            maintainAspectRatio: this.config.maintainAspectRatio || !!lockAspectRatio
          }
        }
      });
    } else if (this.state === "vertex-editing" && this.activeVertexIndex !== null) {
      const vertices = this.calculateVertexPosition(clientX, clientY);
      this.currentVertices = vertices;
      this.onUpdate({
        state: "move",
        transformData: {
          type: "vertex-edit",
          changes: { vertices },
          metadata: { vertexIndex: this.activeVertexIndex }
        }
      });
    } else if (this.state === "rotating" && this.rotationCenter) {
      const absoluteAngle = this.calculateAngleFromMouse(clientX, clientY);
      const snapResult = this.applyRotationSnapping(absoluteAngle);
      const snappedAngle = normalizeAngle(snapResult.angle);
      const previousAngle = this.lastComputedRotation;
      const rawDelta = snappedAngle - previousAngle;
      const adjustedDelta = rawDelta > 180 ? rawDelta - 360 : rawDelta < -180 ? rawDelta + 360 : rawDelta;
      this.rotationDelta += adjustedDelta;
      this.lastComputedRotation = snappedAngle;
      this.rotationSnappedAngle = snapResult.isSnapped ? snappedAngle : null;
      this.onUpdate({
        state: "move",
        transformData: {
          type: "rotate",
          changes: { rotation: snappedAngle },
          metadata: {
            rotationAngle: snappedAngle,
            rotationDelta: this.rotationDelta,
            rotationCenter: this.rotationCenter,
            isSnapped: snapResult.isSnapped,
            snappedAngle: this.rotationSnappedAngle ?? void 0,
            cursorPosition: { clientX, clientY }
          }
        }
      });
    }
  }
  // ---------------------------------------------------------------------------
  // Gesture end / cancel
  // ---------------------------------------------------------------------------
  end() {
    if (this.state === "idle") return;
    const wasState = this.state;
    const handle = this.activeHandle;
    const vertexIndex = this.activeVertexIndex;
    if (wasState === "vertex-editing") {
      this.onUpdate({
        state: "end",
        transformData: {
          type: "vertex-edit",
          changes: { vertices: this.currentVertices },
          metadata: { vertexIndex: vertexIndex || void 0 }
        }
      });
    } else if (wasState === "rotating") {
      this.onUpdate({
        state: "end",
        transformData: {
          type: "rotate",
          changes: { rotation: this.lastComputedRotation },
          metadata: {
            rotationAngle: this.lastComputedRotation,
            rotationDelta: this.rotationDelta,
            rotationCenter: this.rotationCenter || void 0,
            isSnapped: this.rotationSnappedAngle !== null,
            snappedAngle: this.rotationSnappedAngle ?? void 0
          }
        }
      });
    } else {
      const finalPosition = this.currentPosition || this.config.element;
      this.onUpdate({
        state: "end",
        transformData: {
          type: wasState === "dragging" ? "move" : "resize",
          changes: { rect: finalPosition },
          metadata: wasState === "dragging" ? void 0 : {
            handle: handle || void 0,
            maintainAspectRatio: this.config.maintainAspectRatio
          }
        }
      });
    }
    this.reset();
  }
  cancel() {
    if (this.state === "idle") return;
    if (this.state === "vertex-editing") {
      this.onUpdate({
        state: "end",
        transformData: {
          type: "vertex-edit",
          changes: { vertices: this.startVertices },
          metadata: { vertexIndex: this.activeVertexIndex || void 0 }
        }
      });
    } else if (this.state === "rotating") {
      this.onUpdate({
        state: "end",
        transformData: {
          type: "rotate",
          changes: { rotation: this.initialRotation },
          metadata: {
            rotationAngle: this.initialRotation,
            rotationDelta: 0,
            rotationCenter: this.rotationCenter || void 0,
            isSnapped: false
          }
        }
      });
    } else if (this.startElement) {
      this.onUpdate({
        state: "end",
        transformData: {
          type: this.state === "dragging" ? "move" : "resize",
          changes: { rect: this.startElement },
          metadata: this.state === "dragging" ? void 0 : {
            handle: this.activeHandle || void 0,
            maintainAspectRatio: this.config.maintainAspectRatio
          }
        }
      });
    }
    this.reset();
  }
  // ---------------------------------------------------------------------------
  // Private: state management
  // ---------------------------------------------------------------------------
  reset() {
    this.state = "idle";
    this.startPoint = null;
    this.startElement = null;
    this.startRotationElement = null;
    this.gestureRotationCenter = null;
    this.activeHandle = null;
    this.currentPosition = null;
    this.activeVertexIndex = null;
    this.startVertices = [];
    this.rotationCenter = null;
    this.centerScreen = null;
    this.initialRotation = 0;
    this.lastComputedRotation = 0;
    this.rotationDelta = 0;
    this.rotationSnappedAngle = null;
  }
  // ---------------------------------------------------------------------------
  // Private: coordinate transformation (screen → page → local)
  // ---------------------------------------------------------------------------
  calculateDelta(clientX, clientY) {
    if (!this.startPoint) return { x: 0, y: 0 };
    const rawDelta = {
      x: clientX - this.startPoint.x,
      y: clientY - this.startPoint.y
    };
    return this.transformDelta(rawDelta);
  }
  transformDelta(delta) {
    const { pageRotation = 0, scale = 1 } = this.config;
    const rad = pageRotation * Math.PI / 2;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const scaledX = delta.x / scale;
    const scaledY = delta.y / scale;
    return {
      x: cos * scaledX + sin * scaledY,
      y: -sin * scaledX + cos * scaledY
    };
  }
  /**
   * Calculate delta projected into the annotation's local (unrotated) coordinate space.
   * Used for resize and vertex-edit where mouse movement must be mapped to the
   * annotation's own axes, accounting for its rotation.
   */
  calculateLocalDelta(clientX, clientY) {
    const pageDelta = this.calculateDelta(clientX, clientY);
    const { annotationRotation = 0 } = this.config;
    if (annotationRotation === 0) return pageDelta;
    const rad = annotationRotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cos * pageDelta.x + sin * pageDelta.y,
      y: -sin * pageDelta.x + cos * pageDelta.y
    };
  }
  // ---------------------------------------------------------------------------
  // Private: vertex clamping
  // ---------------------------------------------------------------------------
  clampPoint(p) {
    var _a;
    const bbox = (_a = this.config.constraints) == null ? void 0 : _a.boundingBox;
    if (!bbox) return p;
    const { annotationRotation = 0 } = this.config;
    if (annotationRotation === 0) {
      return {
        x: Math.max(0, Math.min(p.x, bbox.width)),
        y: Math.max(0, Math.min(p.y, bbox.height))
      };
    }
    const center = this.gestureRotationCenter ?? this.config.rotationCenter ?? {
      x: this.config.element.origin.x + this.config.element.size.width / 2,
      y: this.config.element.origin.y + this.config.element.size.height / 2
    };
    const visual = rotatePointAround(p, center, annotationRotation);
    const clampedX = Math.max(0, Math.min(visual.x, bbox.width));
    const clampedY = Math.max(0, Math.min(visual.y, bbox.height));
    if (clampedX === visual.x && clampedY === visual.y) return p;
    return rotatePointAround({ x: clampedX, y: clampedY }, center, -annotationRotation);
  }
  calculateVertexPosition(clientX, clientY) {
    if (this.activeVertexIndex === null) return this.startVertices;
    const delta = this.calculateLocalDelta(clientX, clientY);
    const newVertices = [...this.startVertices];
    const currentVertex = newVertices[this.activeVertexIndex];
    const moved = {
      x: currentVertex.x + delta.x,
      y: currentVertex.y + delta.y
    };
    newVertices[this.activeVertexIndex] = this.clampPoint(moved);
    return newVertices;
  }
  // ---------------------------------------------------------------------------
  // Private: drag position
  // ---------------------------------------------------------------------------
  calculateDragPosition(delta) {
    if (!this.startElement) return this.config.element;
    const position = {
      origin: {
        x: this.startElement.origin.x + delta.x,
        y: this.startElement.origin.y + delta.y
      },
      size: {
        width: this.startElement.size.width,
        height: this.startElement.size.height
      }
    };
    const { annotationRotation = 0, constraints } = this.config;
    const bbox = constraints == null ? void 0 : constraints.boundingBox;
    if (annotationRotation !== 0 && bbox) {
      let aabbW;
      let aabbH;
      let offsetX;
      let offsetY;
      if (this.startRotationElement) {
        aabbW = this.startRotationElement.size.width;
        aabbH = this.startRotationElement.size.height;
        offsetX = this.startRotationElement.origin.x - this.startElement.origin.x;
        offsetY = this.startRotationElement.origin.y - this.startElement.origin.y;
      } else {
        const rad = Math.abs(annotationRotation * Math.PI / 180);
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const w = position.size.width;
        const h = position.size.height;
        aabbW = w * cos + h * sin;
        aabbH = w * sin + h * cos;
        offsetX = (w - aabbW) / 2;
        offsetY = (h - aabbH) / 2;
      }
      let { x, y } = position.origin;
      x = Math.max(-offsetX, Math.min(x, bbox.width - aabbW - offsetX));
      y = Math.max(-offsetY, Math.min(y, bbox.height - aabbH - offsetY));
      return { origin: { x, y }, size: position.size };
    }
    return applyConstraints(position, constraints, this.config.maintainAspectRatio ?? false);
  }
  // ---------------------------------------------------------------------------
  // Private: rotation
  // ---------------------------------------------------------------------------
  /**
   * Calculate the angle from the center to a point in screen coordinates.
   */
  calculateAngleFromMouse(clientX, clientY) {
    if (!this.centerScreen) return this.initialRotation;
    const dx = clientX - this.centerScreen.x;
    const dy = clientY - this.centerScreen.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return this.lastComputedRotation;
    const pageRotOffset = (this.config.pageRotation ?? 0) * 90;
    const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90 - pageRotOffset;
    return normalizeAngle(Math.round(angleDeg));
  }
  applyRotationSnapping(angle) {
    const snapAngles = this.config.rotationSnapAngles ?? [0, 90, 180, 270];
    const threshold = this.config.rotationSnapThreshold ?? 4;
    const normalizedAngle = normalizeAngle(angle);
    for (const candidate of snapAngles) {
      const normalizedCandidate = normalizeAngle(candidate);
      const diff = Math.abs(normalizedAngle - normalizedCandidate);
      const minimalDiff = Math.min(diff, 360 - diff);
      if (minimalDiff <= threshold) {
        return {
          angle: normalizedCandidate,
          isSnapped: true,
          snapTarget: normalizedCandidate
        };
      }
    }
    return { angle: normalizedAngle, isSnapped: false };
  }
}
function useDragResize(options) {
  const { onUpdate, enabled = true, ...config } = options;
  const controllerRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  const activePointerIdRef = useRef(null);
  const activeTargetRef = useRef(null);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new DragResizeController(
        config,
        (event) => {
          var _a;
          return (_a = onUpdateRef.current) == null ? void 0 : _a.call(onUpdateRef, event);
        }
      );
    } else {
      controllerRef.current.updateConfig(config);
    }
  }, [
    config.element,
    config.rotationCenter,
    config.rotationElement,
    config.constraints,
    config.maintainAspectRatio,
    config.pageRotation,
    config.annotationRotation,
    config.scale,
    config.vertices
  ]);
  const endPointerSession = useCallback((pointerId) => {
    var _a, _b;
    const activePointerId = activePointerIdRef.current;
    const target = activeTargetRef.current;
    const id = pointerId ?? activePointerId;
    if (target && id !== null) {
      try {
        if ((_a = target.hasPointerCapture) == null ? void 0 : _a.call(target, id)) {
          (_b = target.releasePointerCapture) == null ? void 0 : _b.call(target, id);
        }
      } catch {
      }
    }
    activePointerIdRef.current = null;
    activeTargetRef.current = null;
  }, []);
  const startPointerSession = useCallback(
    (e) => {
      var _a;
      if (activePointerIdRef.current !== null && activePointerIdRef.current !== e.pointerId) {
        (_a = controllerRef.current) == null ? void 0 : _a.end();
        endPointerSession(activePointerIdRef.current);
      }
      const target = e.currentTarget;
      activePointerIdRef.current = e.pointerId;
      activeTargetRef.current = target;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
      }
    },
    [endPointerSession]
  );
  useEffect(() => {
    const eventTarget = globalThis;
    const handleGlobalPointerEnd = (e) => {
      var _a;
      const activePointerId = activePointerIdRef.current;
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      (_a = controllerRef.current) == null ? void 0 : _a.end();
      endPointerSession(e.pointerId);
    };
    const handleWindowBlur = () => {
      var _a;
      if (activePointerIdRef.current === null) return;
      (_a = controllerRef.current) == null ? void 0 : _a.end();
      endPointerSession();
    };
    eventTarget.addEventListener("pointerup", handleGlobalPointerEnd, true);
    eventTarget.addEventListener("pointercancel", handleGlobalPointerEnd, true);
    eventTarget.addEventListener("blur", handleWindowBlur, true);
    return () => {
      eventTarget.removeEventListener("pointerup", handleGlobalPointerEnd, true);
      eventTarget.removeEventListener("pointercancel", handleGlobalPointerEnd, true);
      eventTarget.removeEventListener("blur", handleWindowBlur, true);
    };
  }, [endPointerSession]);
  useEffect(() => {
    return () => {
      var _a;
      if (activePointerIdRef.current !== null) {
        (_a = controllerRef.current) == null ? void 0 : _a.end();
        endPointerSession();
      }
    };
  }, [endPointerSession]);
  const handleDragStart = useCallback(
    (e) => {
      var _a;
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
      (_a = controllerRef.current) == null ? void 0 : _a.startDrag(e.clientX, e.clientY);
      startPointerSession(e);
    },
    [enabled, startPointerSession]
  );
  const handleMove = useCallback(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const activePointerId = activePointerIdRef.current;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      (_a = controllerRef.current) == null ? void 0 : _a.move(e.clientX, e.clientY, e.buttons, e.shiftKey);
      if (activePointerIdRef.current === e.pointerId && e.buttons === 0) {
        endPointerSession(e.pointerId);
      }
    },
    [endPointerSession]
  );
  const handleEndLike = useCallback(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const activePointerId = activePointerIdRef.current;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      (_a = controllerRef.current) == null ? void 0 : _a.end();
      endPointerSession(e.pointerId);
    },
    [endPointerSession]
  );
  const handleLostPointerCapture = useCallback(
    (e) => {
      var _a;
      const activePointerId = activePointerIdRef.current;
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      (_a = controllerRef.current) == null ? void 0 : _a.end();
      endPointerSession(e.pointerId);
    },
    [endPointerSession]
  );
  const createResizeHandler = useCallback(
    (handle) => ({
      onPointerDown: (e) => {
        var _a;
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        (_a = controllerRef.current) == null ? void 0 : _a.startResize(handle, e.clientX, e.clientY);
        startPointerSession(e);
      },
      onPointerMove: handleMove,
      onPointerUp: handleEndLike,
      onPointerCancel: handleEndLike,
      onLostPointerCapture: handleLostPointerCapture
    }),
    [enabled, handleMove, handleEndLike, handleLostPointerCapture, startPointerSession]
  );
  const createVertexHandler = useCallback(
    (vertexIndex) => ({
      onPointerDown: (e) => {
        var _a;
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        (_a = controllerRef.current) == null ? void 0 : _a.startVertexEdit(vertexIndex, e.clientX, e.clientY);
        startPointerSession(e);
      },
      onPointerMove: handleMove,
      onPointerUp: handleEndLike,
      onPointerCancel: handleEndLike,
      onLostPointerCapture: handleLostPointerCapture
    }),
    [enabled, handleMove, handleEndLike, handleLostPointerCapture, startPointerSession]
  );
  const createRotationHandler = useCallback(
    (initialRotation = 0, orbitRadiusPx) => ({
      onPointerDown: (e) => {
        var _a;
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        const handleRect = e.currentTarget.getBoundingClientRect();
        const handleCenterX = handleRect.left + handleRect.width / 2;
        const handleCenterY = handleRect.top + handleRect.height / 2;
        (_a = controllerRef.current) == null ? void 0 : _a.startRotation(
          handleCenterX,
          handleCenterY,
          initialRotation,
          orbitRadiusPx
        );
        startPointerSession(e);
      },
      onPointerMove: handleMove,
      onPointerUp: handleEndLike,
      onPointerCancel: handleEndLike,
      onLostPointerCapture: handleLostPointerCapture
    }),
    [enabled, handleMove, handleEndLike, handleLostPointerCapture, startPointerSession]
  );
  return {
    dragProps: enabled ? {
      onPointerDown: handleDragStart,
      onPointerMove: handleMove,
      onPointerUp: handleEndLike,
      onPointerCancel: handleEndLike,
      onLostPointerCapture: handleLostPointerCapture
    } : {},
    createResizeProps: createResizeHandler,
    createVertexProps: createVertexHandler,
    createRotationProps: createRotationHandler
  };
}
function useInteractionHandles(opts) {
  var _a, _b, _c, _d, _e, _f;
  const {
    controller,
    resizeUI,
    vertexUI,
    rotationUI,
    includeVertices = false,
    includeRotation = false,
    currentRotation = 0,
    handleAttrs,
    vertexAttrs,
    rotationAttrs
  } = opts;
  const { dragProps, createResizeProps, createVertexProps, createRotationProps } = useDragResize(controller);
  const resize = useMemo(() => {
    const desc = describeResizeFromConfig(controller, resizeUI);
    return desc.map((d) => {
      var _a2;
      return {
        key: (_a2 = d.attrs) == null ? void 0 : _a2["data-epdf-handle"],
        style: d.style,
        ...createResizeProps(d.handle),
        ...d.attrs ?? {},
        ...(handleAttrs == null ? void 0 : handleAttrs(d.handle)) ?? {}
      };
    });
  }, [
    controller.element.origin.x,
    controller.element.origin.y,
    controller.element.size.width,
    controller.element.size.height,
    controller.scale,
    controller.pageRotation,
    controller.annotationRotation,
    controller.maintainAspectRatio,
    resizeUI == null ? void 0 : resizeUI.handleSize,
    resizeUI == null ? void 0 : resizeUI.spacing,
    resizeUI == null ? void 0 : resizeUI.offsetMode,
    resizeUI == null ? void 0 : resizeUI.includeSides,
    resizeUI == null ? void 0 : resizeUI.zIndex,
    resizeUI == null ? void 0 : resizeUI.rotationAwareCursor,
    createResizeProps,
    handleAttrs
  ]);
  const vertices = useMemo(() => {
    if (!includeVertices) return [];
    const desc = describeVerticesFromConfig(controller, vertexUI, controller.vertices);
    return desc.map((d, i) => ({
      key: i,
      style: d.style,
      ...createVertexProps(i),
      ...d.attrs ?? {},
      ...(vertexAttrs == null ? void 0 : vertexAttrs(i)) ?? {}
    }));
  }, [
    includeVertices,
    controller.element.origin.x,
    controller.element.origin.y,
    controller.element.size.width,
    controller.element.size.height,
    controller.scale,
    controller.vertices,
    // identity/content drives recalculation
    vertexUI == null ? void 0 : vertexUI.vertexSize,
    vertexUI == null ? void 0 : vertexUI.zIndex,
    createVertexProps,
    vertexAttrs
  ]);
  const rotation = useMemo(() => {
    if (!includeRotation) return null;
    const desc = describeRotationFromConfig(controller, rotationUI, currentRotation);
    return {
      handle: {
        style: desc.handleStyle,
        ...createRotationProps(currentRotation, desc.radius),
        ...desc.attrs ?? {},
        ...(rotationAttrs == null ? void 0 : rotationAttrs()) ?? {}
      },
      connector: {
        style: desc.connectorStyle,
        "data-epdf-rotation-connector": true
      }
    };
  }, [
    includeRotation,
    controller.element.origin.x,
    controller.element.origin.y,
    controller.element.size.width,
    controller.element.size.height,
    (_a = controller.rotationCenter) == null ? void 0 : _a.x,
    (_b = controller.rotationCenter) == null ? void 0 : _b.y,
    (_c = controller.rotationElement) == null ? void 0 : _c.origin.x,
    (_d = controller.rotationElement) == null ? void 0 : _d.origin.y,
    (_e = controller.rotationElement) == null ? void 0 : _e.size.width,
    (_f = controller.rotationElement) == null ? void 0 : _f.size.height,
    controller.scale,
    currentRotation,
    rotationUI == null ? void 0 : rotationUI.handleSize,
    rotationUI == null ? void 0 : rotationUI.margin,
    rotationUI == null ? void 0 : rotationUI.zIndex,
    rotationUI == null ? void 0 : rotationUI.showConnector,
    rotationUI == null ? void 0 : rotationUI.connectorWidth,
    createRotationProps,
    rotationAttrs
  ]);
  return { dragProps, resize, vertices, rotation };
}
function useDoublePressProps(onDouble, { delay = 300, tolerancePx = 18 } = {}) {
  const last = useRef({ t: 0, x: 0, y: 0 });
  const handlePointerUp = useCallback(
    (e) => {
      if (!onDouble) return;
      if (e.pointerType === "mouse" || e.isPrimary === false) return;
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;
      const withinTime = now - last.current.t <= delay;
      const dx = x - last.current.x;
      const dy = y - last.current.y;
      const withinDist = dx * dx + dy * dy <= tolerancePx * tolerancePx;
      if (withinTime && withinDist) onDouble == null ? void 0 : onDouble(e);
      last.current = { t: now, x, y };
    },
    [onDouble, delay, tolerancePx]
  );
  const handleDouble = useCallback(
    (e) => {
      onDouble == null ? void 0 : onDouble(e);
    },
    [onDouble]
  );
  return onDouble ? {
    // Computed property uses the framework’s name ('onDoubleClick' or 'onDblClick')
    [dblClickProp]: handleDouble,
    onPointerUpCapture: handlePointerUp
  } : {};
}
export {
  CounterRotate,
  useDoublePressProps,
  useDragResize,
  useInteractionHandles
};
//# sourceMappingURL=index.js.map
