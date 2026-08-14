import { clamp, BasePlugin, createEmitter, createBehaviorEmitter, setScale } from "@embedpdf/core";
import { rotateRect } from "@embedpdf/models";
var ZoomMode = /* @__PURE__ */ ((ZoomMode2) => {
  ZoomMode2["Automatic"] = "automatic";
  ZoomMode2["FitPage"] = "fit-page";
  ZoomMode2["FitWidth"] = "fit-width";
  return ZoomMode2;
})(ZoomMode || {});
var VerticalZoomFocus = /* @__PURE__ */ ((VerticalZoomFocus2) => {
  VerticalZoomFocus2[VerticalZoomFocus2["Center"] = 0] = "Center";
  VerticalZoomFocus2[VerticalZoomFocus2["Top"] = 1] = "Top";
  return VerticalZoomFocus2;
})(VerticalZoomFocus || {});
const ZOOM_PLUGIN_ID = "zoom";
const manifest = {
  id: ZOOM_PLUGIN_ID,
  name: "Zoom Plugin",
  version: "1.0.0",
  provides: ["zoom"],
  requires: ["viewport", "scroll"],
  optional: ["interaction-manager", "spread"],
  defaultConfig: {
    defaultZoomLevel: ZoomMode.Automatic,
    minZoom: 0.2,
    maxZoom: 60,
    zoomStep: 0.1,
    zoomRanges: [
      {
        min: 0.2,
        max: 0.5,
        step: 0.05
      },
      {
        min: 0.5,
        max: 1,
        step: 0.1
      },
      {
        min: 1,
        max: 2,
        step: 0.2
      },
      {
        min: 2,
        max: 4,
        step: 0.4
      },
      {
        min: 4,
        max: 10,
        step: 0.8
      },
      {
        min: 10,
        max: 20,
        step: 1.6
      },
      {
        min: 20,
        max: 40,
        step: 3.2
      },
      {
        min: 40,
        max: 60,
        step: 6.4
      }
    ],
    presets: [
      {
        name: "Fit Page",
        value: ZoomMode.FitPage
      },
      {
        name: "Fit Width",
        value: ZoomMode.FitWidth
      },
      {
        name: "Automatic",
        value: ZoomMode.Automatic
      },
      {
        name: "25%",
        value: 0.25
      },
      {
        name: "50%",
        value: 0.5
      },
      {
        name: "100%",
        value: 1
      },
      {
        name: "125%",
        value: 1.25
      },
      {
        name: "150%",
        value: 1.5
      },
      {
        name: "200%",
        value: 2
      },
      {
        name: "400%",
        value: 4
      },
      {
        name: "800%",
        value: 8
      },
      {
        name: "1600%",
        value: 16
      }
    ]
  }
};
const INIT_ZOOM_STATE = "ZOOM/INIT_STATE";
const CLEANUP_ZOOM_STATE = "ZOOM/CLEANUP_STATE";
const SET_ACTIVE_DOCUMENT = "ZOOM/SET_ACTIVE_DOCUMENT";
const SET_ZOOM_LEVEL = "ZOOM/SET_ZOOM_LEVEL";
const SET_MARQUEE_ZOOM_ACTIVE = "ZOOM/SET_MARQUEE_ZOOM_ACTIVE";
function initZoomState(documentId, state) {
  return { type: INIT_ZOOM_STATE, payload: { documentId, state } };
}
function cleanupZoomState(documentId) {
  return { type: CLEANUP_ZOOM_STATE, payload: documentId };
}
function setZoomLevel(documentId, zoomLevel, currentZoomLevel) {
  return { type: SET_ZOOM_LEVEL, payload: { documentId, zoomLevel, currentZoomLevel } };
}
function setMarqueeZoomActive(documentId, isActive) {
  return { type: SET_MARQUEE_ZOOM_ACTIVE, payload: { documentId, isActive } };
}
const initialDocumentState = {
  zoomLevel: ZoomMode.Automatic,
  currentZoomLevel: 1,
  isMarqueeZoomActive: false
};
const initialState = {
  documents: {},
  activeDocumentId: null
};
const zoomReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_ZOOM_STATE: {
      const { documentId, state: docState } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        },
        // Set as active if no active document
        activeDocumentId: state.activeDocumentId ?? documentId
      };
    }
    case CLEANUP_ZOOM_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_ZOOM_LEVEL: {
      const { documentId, zoomLevel, currentZoomLevel } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            zoomLevel,
            currentZoomLevel
          }
        }
      };
    }
    case SET_MARQUEE_ZOOM_ACTIVE: {
      const { documentId, isActive } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            isMarqueeZoomActive: isActive
          }
        }
      };
    }
    default:
      return state;
  }
};
function createMarqueeHandler(opts) {
  const { pageSize, scale, minDragPx = 5, onPreview, onCommit, onSmallDrag } = opts;
  let start = null;
  let last = null;
  return {
    onPointerDown: (pos, evt) => {
      var _a;
      start = pos;
      last = { origin: { x: pos.x, y: pos.y }, size: { width: 0, height: 0 } };
      onPreview == null ? void 0 : onPreview(last);
      (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
    },
    onPointerMove: (pos) => {
      if (!start) return;
      const x = clamp(pos.x, 0, pageSize.width);
      const y = clamp(pos.y, 0, pageSize.height);
      last = {
        origin: { x: Math.min(start.x, x), y: Math.min(start.y, y) },
        size: { width: Math.abs(x - start.x), height: Math.abs(y - start.y) }
      };
      onPreview == null ? void 0 : onPreview(last);
    },
    onPointerUp: (_pos, evt) => {
      var _a;
      if (last) {
        const dragPx = Math.max(last.size.width, last.size.height) * scale;
        if (dragPx > minDragPx) {
          onCommit == null ? void 0 : onCommit(last);
        } else {
          onSmallDrag == null ? void 0 : onSmallDrag();
        }
      }
      start = null;
      last = null;
      onPreview == null ? void 0 : onPreview(null);
      (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
    },
    onPointerCancel: (_pos, evt) => {
      var _a;
      start = null;
      last = null;
      onPreview == null ? void 0 : onPreview(null);
      (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
    }
  };
}
const _ZoomPlugin = class _ZoomPlugin extends BasePlugin {
  constructor(id, registry, cfg) {
    var _a, _b, _c;
    super(id, registry);
    this.zoom$ = createEmitter();
    this.state$ = createBehaviorEmitter();
    this.viewportPlugin = registry.getPlugin("viewport");
    this.viewport = this.viewportPlugin.provides();
    this.scroll = registry.getPlugin("scroll").provides();
    const interactionManager = registry.getPlugin("interaction-manager");
    this.interactionManager = (interactionManager == null ? void 0 : interactionManager.provides()) ?? null;
    const spread = registry.getPlugin("spread");
    this.spread = (spread == null ? void 0 : spread.provides()) ?? null;
    this.minZoom = cfg.minZoom ?? 0.25;
    this.maxZoom = cfg.maxZoom ?? 10;
    this.zoomStep = cfg.zoomStep ?? 0.1;
    this.defaultZoomLevel = cfg.defaultZoomLevel;
    this.presets = cfg.presets ?? [];
    this.zoomRanges = this.normalizeRanges(cfg.zoomRanges ?? []);
    this.viewport.onViewportResize(
      (event) => this.recalcAuto(event.documentId, VerticalZoomFocus.Top),
      {
        mode: "debounce",
        wait: 150,
        keyExtractor: (event) => event.documentId
      }
    );
    (_a = this.spread) == null ? void 0 : _a.onSpreadChange((event) => {
      this.recalcAuto(event.documentId, VerticalZoomFocus.Top);
    });
    (_b = this.interactionManager) == null ? void 0 : _b.registerMode({
      id: "marqueeZoom",
      scope: "page",
      exclusive: true,
      cursor: "zoom-in"
    });
    (_c = this.interactionManager) == null ? void 0 : _c.onModeChange((state) => {
      const isMarqueeActive = state.activeMode === "marqueeZoom";
      const docState = this.getDocumentState(state.documentId);
      if (docState && docState.isMarqueeZoomActive !== isMarqueeActive) {
        this.dispatch(setMarqueeZoomActive(state.documentId, isMarqueeActive));
      }
    });
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.viewport.gate("zoom", documentId);
    const docState = {
      ...initialDocumentState,
      zoomLevel: this.defaultZoomLevel
    };
    this.dispatch(initZoomState(documentId, docState));
    this.logger.debug(
      "ZoomPlugin",
      "DocumentOpened",
      `Initialized zoom state for document: ${documentId}`
    );
  }
  onDocumentLoaded(documentId) {
    this.recalcAuto(documentId, VerticalZoomFocus.Top);
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupZoomState(documentId));
    this.logger.debug(
      "ZoomPlugin",
      "DocumentClosed",
      `Cleaned up zoom state for document: ${documentId}`
    );
  }
  onRotationChanged(documentId) {
    this.recalcAuto(documentId, VerticalZoomFocus.Top);
  }
  /*
  protected override onPagesChanged(documentId: string): void {
    // Recalculate auto modes when pages change
    this.recalcAuto(documentId, VerticalZoomFocus.Top);
  }*/
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      requestZoom: (level, c) => this.requestZoom(level, c),
      requestZoomBy: (d, c) => this.requestZoomBy(d, c),
      zoomIn: () => this.zoomIn(),
      zoomOut: () => this.zoomOut(),
      zoomToArea: (pageIndex, rect) => this.zoomToArea(pageIndex, rect),
      enableMarqueeZoom: () => this.enableMarqueeZoom(),
      disableMarqueeZoom: () => this.disableMarqueeZoom(),
      toggleMarqueeZoom: () => this.toggleMarqueeZoom(),
      isMarqueeZoomActive: () => this.isMarqueeZoomActive(),
      getState: () => this.getDocumentStateOrThrow(),
      // Document-scoped operations
      forDocument: (documentId) => this.createZoomScope(documentId),
      // Global
      registerMarqueeOnPage: (opts) => this.registerMarqueeOnPage(opts),
      getPresets: () => this.presets,
      // Events
      onZoomChange: this.zoom$.on,
      onStateChange: this.state$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createZoomScope(documentId) {
    return {
      requestZoom: (level, c) => this.requestZoom(level, c, documentId),
      requestZoomBy: (d, c) => this.requestZoomBy(d, c, documentId),
      zoomIn: () => this.zoomIn(documentId),
      zoomOut: () => this.zoomOut(documentId),
      zoomToArea: (pageIndex, rect) => this.zoomToArea(pageIndex, rect, documentId),
      enableMarqueeZoom: () => this.enableMarqueeZoom(documentId),
      disableMarqueeZoom: () => this.disableMarqueeZoom(documentId),
      toggleMarqueeZoom: () => this.toggleMarqueeZoom(documentId),
      isMarqueeZoomActive: () => this.isMarqueeZoomActive(documentId),
      getState: () => this.getDocumentStateOrThrow(documentId),
      onZoomChange: (listener) => this.zoom$.on((event) => {
        if (event.documentId === documentId) listener(event);
      }),
      onStateChange: (listener) => this.state$.on((event) => {
        if (event.documentId === documentId) listener(event.state);
      })
    };
  }
  // ─────────────────────────────────────────────────────────
  // State Helpers
  // ─────────────────────────────────────────────────────────
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    return this.state.documents[id] ?? null;
  }
  getDocumentStateOrThrow(documentId) {
    const state = this.getDocumentState(documentId);
    if (!state) {
      throw new Error(`Zoom state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  requestZoom(level, center, documentId) {
    this.handleRequest({ level, center }, documentId);
  }
  requestZoomBy(delta, center, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const cur = docState.currentZoomLevel;
    const target = this.toZoom(cur + delta);
    this.handleRequest({ level: target, center }, id);
  }
  zoomIn(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const cur = docState.currentZoomLevel;
    this.handleRequest({ level: cur, delta: this.stepFor(cur) }, id);
  }
  zoomOut(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const cur = docState.currentZoomLevel;
    this.handleRequest({ level: cur, delta: -this.stepFor(cur) }, id);
  }
  zoomToArea(pageIndex, rect, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    this.handleZoomToArea(id, pageIndex, rect);
  }
  enableMarqueeZoom(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    (_a = this.interactionManager) == null ? void 0 : _a.forDocument(id).activate("marqueeZoom");
  }
  disableMarqueeZoom(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    (_a = this.interactionManager) == null ? void 0 : _a.forDocument(id).activateDefaultMode();
  }
  toggleMarqueeZoom(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const scope = (_a = this.interactionManager) == null ? void 0 : _a.forDocument(id);
    if ((scope == null ? void 0 : scope.getActiveMode()) === "marqueeZoom") {
      scope.activateDefaultMode();
    } else {
      scope == null ? void 0 : scope.activate("marqueeZoom");
    }
  }
  isMarqueeZoomActive(documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    return ((_a = this.interactionManager) == null ? void 0 : _a.forDocument(id).getActiveMode()) === "marqueeZoom";
  }
  // ─────────────────────────────────────────────────────────
  // Main Zoom Logic
  // ─────────────────────────────────────────────────────────
  handleRequest({ level, delta = 0, center, focus = VerticalZoomFocus.Center, align = "keep" }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const coreDoc = this.coreState.core.documents[id];
    if (!coreDoc) return;
    const viewport = this.viewport.forDocument(id);
    const metrics = viewport.getMetrics();
    const oldZoom = docState.currentZoomLevel;
    if (metrics.clientWidth === 0 || metrics.clientHeight === 0) {
      return;
    }
    const base = typeof level === "number" ? level : this.computeZoomForMode(id, level, metrics);
    if (base === false) return;
    const exactZoom = clamp(base + delta, this.minZoom, this.maxZoom);
    const newZoom = Math.floor(exactZoom * 1e3) / 1e3;
    const focusPoint = center ?? {
      vx: metrics.clientWidth / 2,
      vy: focus === VerticalZoomFocus.Top ? 0 : metrics.clientHeight / 2
    };
    const { desiredScrollLeft, desiredScrollTop } = this.computeScrollForZoomChange(
      id,
      metrics,
      oldZoom,
      newZoom,
      focusPoint,
      align
    );
    if (!isNaN(desiredScrollLeft) && !isNaN(desiredScrollTop)) {
      this.viewportPlugin.setViewportScrollMetrics(id, {
        scrollLeft: desiredScrollLeft,
        scrollTop: desiredScrollTop
      });
    }
    this.dispatch(setZoomLevel(id, typeof level === "number" ? newZoom : level, newZoom));
    this.dispatchCoreAction(setScale(newZoom, id));
    if (this.viewport.isGated(id)) {
      this.viewport.releaseGate("zoom", id);
    }
    viewport.scrollTo({
      x: desiredScrollLeft,
      y: desiredScrollTop,
      behavior: "instant"
    });
    const evt = {
      documentId: id,
      oldZoom,
      newZoom,
      level,
      center: focusPoint,
      desiredScrollLeft,
      desiredScrollTop,
      viewport: metrics
    };
    this.zoom$.emit(evt);
  }
  computeZoomForMode(documentId, mode, vp) {
    const coreDoc = this.coreState.core.documents[documentId];
    if (!coreDoc) return false;
    const scrollScope = this.scroll.forDocument(documentId);
    const pgGap = scrollScope ? this.scroll.getPageGap() : 0;
    const vpGap = this.viewport.getViewportGap();
    const spreads = scrollScope.getSpreadPagesWithRotatedSize();
    if (!spreads.length) return false;
    if (vp.clientWidth === 0 || vp.clientHeight === 0) return false;
    const availableWidth = vp.clientWidth - 2 * vpGap;
    const availableHeight = vp.clientHeight - 2 * vpGap;
    if (availableWidth <= 0 || availableHeight <= 0) return false;
    let maxContentW = 0, maxContentH = 0;
    spreads.forEach((spread) => {
      const contentW = spread.reduce((s, p, i) => s + p.rotatedSize.width + (i ? pgGap : 0), 0);
      const contentH = Math.max(...spread.map((p) => p.rotatedSize.height));
      maxContentW = Math.max(maxContentW, contentW);
      maxContentH = Math.max(maxContentH, contentH);
    });
    switch (mode) {
      case ZoomMode.FitWidth:
        return availableWidth / maxContentW;
      case ZoomMode.FitPage:
        return Math.min(availableWidth / maxContentW, availableHeight / maxContentH);
      case ZoomMode.Automatic:
        return Math.min(availableWidth / maxContentW, 1);
      default:
        return 1;
    }
  }
  computeScrollForZoomChange(documentId, vp, oldZoom, newZoom, focus, align = "keep") {
    const scrollScope = this.scroll.forDocument(documentId);
    const layout = scrollScope.getLayout();
    const vpGap = this.viewport.getViewportGap();
    const contentW = layout.totalContentSize.width;
    const contentH = layout.totalContentSize.height;
    const availableWidth = vp.clientWidth - 2 * vpGap;
    const availableHeight = vp.clientHeight - 2 * vpGap;
    const off = (availableSpace, cw, zoom) => cw * zoom < availableSpace ? (availableSpace - cw * zoom) / 2 : 0;
    const offXold = off(availableWidth, contentW, oldZoom);
    const offYold = off(availableHeight, contentH, oldZoom);
    const offXnew = off(availableWidth, contentW, newZoom);
    const offYnew = off(availableHeight, contentH, newZoom);
    const cx = (vp.scrollLeft + focus.vx - vpGap - offXold) / oldZoom;
    const cy = (vp.scrollTop + focus.vy - vpGap - offYold) / oldZoom;
    const baseLeft = cx * newZoom + vpGap + offXnew;
    const baseTop = cy * newZoom + vpGap + offYnew;
    const desiredScrollLeft = align === "center" ? baseLeft - vp.clientWidth / 2 : baseLeft - focus.vx;
    const desiredScrollTop = align === "center" ? baseTop - vp.clientHeight / 2 : baseTop - focus.vy;
    return {
      desiredScrollLeft: Math.max(0, desiredScrollLeft),
      desiredScrollTop: Math.max(0, desiredScrollTop)
    };
  }
  handleZoomToArea(documentId, pageIndex, rect) {
    const coreDoc = this.coreState.core.documents[documentId];
    if (!coreDoc) return;
    const rotation = coreDoc.rotation;
    const viewport = this.viewport.forDocument(documentId);
    const vp = viewport.getMetrics();
    const vpGap = this.viewport.getViewportGap();
    const docState = this.getDocumentStateOrThrow(documentId);
    const oldZ = docState.currentZoomLevel;
    const availableW = vp.clientWidth - 2 * vpGap;
    const availableH = vp.clientHeight - 2 * vpGap;
    const scrollScope = this.scroll.forDocument(documentId);
    const layout = scrollScope.getLayout();
    const vItem = layout.virtualItems.find(
      (it) => it.pageLayouts.some((p) => p.pageIndex === pageIndex)
    );
    if (!vItem) return;
    const pageRel = vItem.pageLayouts.find((p) => p.pageIndex === pageIndex);
    const rotatedRect = rotateRect(
      { width: pageRel.width, height: pageRel.height },
      rect,
      rotation
    );
    const targetZoom = this.toZoom(
      Math.min(availableW / rotatedRect.size.width, availableH / rotatedRect.size.height)
    );
    const pageAbsX = vItem.x + pageRel.x;
    const pageAbsY = vItem.y + pageRel.y;
    const cxContent = pageAbsX + rotatedRect.origin.x + rotatedRect.size.width / 2;
    const cyContent = pageAbsY + rotatedRect.origin.y + rotatedRect.size.height / 2;
    const off = (avail, cw, z) => cw * z < avail ? (avail - cw * z) / 2 : 0;
    const offXold = off(availableW, layout.totalContentSize.width, oldZ);
    const offYold = off(availableH, layout.totalContentSize.height, oldZ);
    const centerVX = vpGap + offXold + cxContent * oldZ - vp.scrollLeft;
    const centerVY = vpGap + offYold + cyContent * oldZ - vp.scrollTop;
    this.handleRequest(
      {
        level: targetZoom,
        center: { vx: centerVX, vy: centerVY },
        align: "center"
      },
      documentId
    );
  }
  recalcAuto(documentId, focus) {
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    if (docState.zoomLevel === ZoomMode.Automatic || docState.zoomLevel === ZoomMode.FitPage || docState.zoomLevel === ZoomMode.FitWidth) {
      this.handleRequest({ level: docState.zoomLevel, focus }, documentId);
    }
  }
  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────
  normalizeRanges(ranges) {
    return [...ranges].filter((r) => r.step > 0 && r.max > r.min).sort((a, b) => a.min - b.min);
  }
  stepFor(zoom) {
    const r = this.zoomRanges.find((r2) => zoom >= r2.min && zoom < r2.max);
    return r ? r.step : this.zoomStep;
  }
  toZoom(v) {
    return parseFloat(clamp(v, this.minZoom, this.maxZoom).toFixed(2));
  }
  // ─────────────────────────────────────────────────────────
  // Marquee Zoom
  // ─────────────────────────────────────────────────────────
  registerMarqueeOnPage(opts) {
    if (!this.interactionManager) {
      this.logger.warn(
        "ZoomPlugin",
        "MissingDependency",
        "Interaction manager plugin not loaded, marquee zoom disabled"
      );
      return () => {
      };
    }
    const coreDoc = this.coreState.core.documents[opts.documentId];
    if (!coreDoc || !coreDoc.document) {
      this.logger.warn("ZoomPlugin", "DocumentNotFound", "Document not found");
      return () => {
      };
    }
    const page = coreDoc.document.pages[opts.pageIndex];
    if (!page) {
      this.logger.warn("ZoomPlugin", "PageNotFound", `Page ${opts.pageIndex} not found`);
      return () => {
      };
    }
    const handlers = createMarqueeHandler({
      pageSize: page.size,
      scale: opts.scale,
      onPreview: opts.callback.onPreview,
      onCommit: (rect) => {
        var _a, _b;
        this.zoomToArea(opts.pageIndex, rect, opts.documentId);
        (_b = (_a = opts.callback).onCommit) == null ? void 0 : _b.call(_a, rect);
      },
      onSmallDrag: () => {
        var _a, _b;
        this.zoomIn(opts.documentId);
        (_b = (_a = opts.callback).onSmallDrag) == null ? void 0 : _b.call(_a);
      }
    });
    const off = this.interactionManager.registerHandlers({
      documentId: opts.documentId,
      modeId: "marqueeZoom",
      handlers,
      pageIndex: opts.pageIndex
    });
    return off;
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if (prevDoc && newDoc && (prevDoc.currentZoomLevel !== newDoc.currentZoomLevel || prevDoc.zoomLevel !== newDoc.zoomLevel || prevDoc.isMarqueeZoomActive !== newDoc.isMarqueeZoomActive)) {
        this.state$.emit({
          documentId,
          state: newDoc
        });
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize() {
    this.logger.info("ZoomPlugin", "Initialize", "Zoom plugin initialized");
  }
  async destroy() {
    this.zoom$.clear();
    this.state$.clear();
    super.destroy();
  }
};
_ZoomPlugin.id = "zoom";
let ZoomPlugin = _ZoomPlugin;
const ZoomPluginPackage = {
  manifest,
  create: (registry, config) => new ZoomPlugin(ZOOM_PLUGIN_ID, registry, config),
  reducer: zoomReducer,
  initialState
};
export {
  VerticalZoomFocus,
  ZOOM_PLUGIN_ID,
  ZoomMode,
  ZoomPlugin,
  ZoomPluginPackage,
  initialDocumentState,
  initialState,
  manifest
};
//# sourceMappingURL=index.js.map
