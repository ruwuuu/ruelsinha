import { BasePlugin, createBehaviorEmitter, REFRESH_PAGES } from "@embedpdf/core";
import { transformSize, restoreRect, ignore } from "@embedpdf/models";
const TILING_PLUGIN_ID = "tiling";
const manifest = {
  id: TILING_PLUGIN_ID,
  name: "Tiling Plugin",
  version: "1.0.0",
  provides: ["tiling"],
  requires: ["render", "scroll", "viewport"],
  optional: [],
  defaultConfig: {
    tileSize: 768,
    overlapPx: 2.5,
    extraRings: 0
  }
};
const INIT_TILING_STATE = "TILING/INIT_STATE";
const CLEANUP_TILING_STATE = "TILING/CLEANUP_STATE";
const UPDATE_VISIBLE_TILES = "TILING/UPDATE_VISIBLE_TILES";
const MARK_TILE_STATUS = "TILING/MARK_TILE_STATUS";
const initTilingState = (documentId, state) => ({
  type: INIT_TILING_STATE,
  payload: { documentId, state }
});
const cleanupTilingState = (documentId) => ({
  type: CLEANUP_TILING_STATE,
  payload: documentId
});
const updateVisibleTiles = (documentId, tiles) => ({
  type: UPDATE_VISIBLE_TILES,
  payload: { documentId, tiles }
});
const markTileStatus = (documentId, pageIndex, tileId, status) => ({
  type: MARK_TILE_STATUS,
  payload: { documentId, pageIndex, tileId, status }
});
const initialTilingDocumentState = {
  visibleTiles: {}
};
const initialState = {
  documents: {}
};
const tilingReducer = (state, action) => {
  var _a, _b;
  switch (action.type) {
    case INIT_TILING_STATE: {
      const { documentId, state: docState } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        }
      };
    }
    case CLEANUP_TILING_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remaining } = state.documents;
      return {
        ...state,
        documents: remaining
      };
    }
    case UPDATE_VISIBLE_TILES: {
      const { documentId, tiles: incoming } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const nextPages = { ...docState.visibleTiles };
      for (const key in incoming) {
        const pageIndex = Number(key);
        const newTiles = incoming[pageIndex];
        const prevTiles = nextPages[pageIndex] ?? [];
        const prevScale = (_a = prevTiles.find((t) => !t.isFallback)) == null ? void 0 : _a.srcScale;
        const newScale = newTiles.length > 0 ? newTiles[0].srcScale : prevScale;
        const zoomChanged = prevScale !== void 0 && prevScale !== newScale;
        if (zoomChanged) {
          const promoted = prevTiles.filter((t) => !t.isFallback && t.status === "ready").map((t) => ({ ...t, isFallback: true }));
          const fallbackToCarry = promoted.length > 0 ? [] : prevTiles.filter((t) => t.isFallback);
          nextPages[pageIndex] = [...fallbackToCarry, ...promoted, ...newTiles];
        } else {
          const newIds = new Set(newTiles.map((t) => t.id));
          const keepers = [];
          const seenIds = /* @__PURE__ */ new Set();
          for (const t of prevTiles) {
            if (t.isFallback) {
              keepers.push(t);
              seenIds.add(t.id);
            } else if (newIds.has(t.id)) {
              keepers.push(t);
              seenIds.add(t.id);
            }
          }
          for (const t of newTiles) {
            if (!seenIds.has(t.id)) keepers.push(t);
          }
          nextPages[pageIndex] = keepers;
        }
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            visibleTiles: nextPages
          }
        }
      };
    }
    case MARK_TILE_STATUS: {
      const { documentId, pageIndex, tileId, status } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const tiles = ((_b = docState.visibleTiles[pageIndex]) == null ? void 0 : _b.map(
        (t) => t.id === tileId ? { ...t, status } : t
      )) ?? [];
      const newTiles = tiles.filter((t) => !t.isFallback);
      const allReady = newTiles.length > 0 && newTiles.every((t) => t.status === "ready");
      const finalTiles = allReady ? newTiles : tiles;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            visibleTiles: { ...docState.visibleTiles, [pageIndex]: finalTiles }
          }
        }
      };
    }
    default:
      return state;
  }
};
function calculateTilesForPage({
  tileSize = 768,
  overlapPx = 2.5,
  extraRings = 0,
  scale,
  rotation,
  page,
  metric
}) {
  const pageW = page.size.width * scale;
  const pageH = page.size.height * scale;
  const step = tileSize - overlapPx;
  const containerSize = transformSize(page.size, rotation, scale);
  const rotatedVisRect = {
    origin: { x: metric.scaled.pageX, y: metric.scaled.pageY },
    size: { width: metric.scaled.visibleWidth, height: metric.scaled.visibleHeight }
  };
  const unrotatedVisRect = restoreRect(containerSize, rotatedVisRect, rotation, 1);
  const visLeft = unrotatedVisRect.origin.x;
  const visTop = unrotatedVisRect.origin.y;
  const visRight = visLeft + unrotatedVisRect.size.width;
  const visBottom = visTop + unrotatedVisRect.size.height;
  const maxCol = Math.floor((pageW - 1) / step);
  const maxRow = Math.floor((pageH - 1) / step);
  const startCol = Math.max(0, Math.floor(visLeft / step) - extraRings);
  const endCol = Math.min(maxCol, Math.floor((visRight - 1) / step) + extraRings);
  const startRow = Math.max(0, Math.floor(visTop / step) - extraRings);
  const endRow = Math.min(maxRow, Math.floor((visBottom - 1) / step) + extraRings);
  const tiles = [];
  for (let col = startCol; col <= endCol; col++) {
    const xScreen = col * step;
    const wScreen = Math.min(tileSize, pageW - xScreen);
    const xPage = xScreen / scale;
    const wPage = wScreen / scale;
    for (let row = startRow; row <= endRow; row++) {
      const yScreen = row * step;
      const hScreen = Math.min(tileSize, pageH - yScreen);
      const yPage = yScreen / scale;
      const hPage = hScreen / scale;
      tiles.push({
        id: `p${page.index}-${scale}-x${xScreen}-y${yScreen}-w${wScreen}-h${hScreen}`,
        col,
        row,
        pageRect: { origin: { x: xPage, y: yPage }, size: { width: wPage, height: hPage } },
        screenRect: {
          origin: { x: xScreen, y: yScreen },
          size: { width: wScreen, height: hScreen }
        },
        status: "queued",
        srcScale: scale,
        isFallback: false
      });
    }
  }
  return tiles;
}
const _TilingPlugin = class _TilingPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.tileRendering$ = createBehaviorEmitter();
    this.config = config;
    this.renderCapability = this.registry.getPlugin("render").provides();
    this.scrollCapability = this.registry.getPlugin("scroll").provides();
    this.viewportCapability = this.registry.getPlugin("viewport").provides();
    this.scrollCapability.onScroll(
      (event) => this.calculateVisibleTiles(event.documentId, event.metrics),
      {
        mode: "throttle",
        wait: 50,
        throttleMode: "trailing"
      }
    );
    this.coreStore.onAction(REFRESH_PAGES, (action) => this.recalculateTiles(action.payload));
  }
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initTilingState(documentId, initialTilingDocumentState));
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupTilingState(documentId));
  }
  onScaleChanged(documentId) {
    this.recalculateTilesForDocument(documentId);
  }
  onRotationChanged(documentId) {
    this.recalculateTilesForDocument(documentId);
  }
  recalculateTilesForDocument(documentId) {
    const scrollScope = this.scrollCapability.forDocument(documentId);
    const viewportScope = this.viewportCapability.forDocument(documentId);
    const metrics = scrollScope.getMetrics(viewportScope.getMetrics());
    this.calculateVisibleTiles(documentId, metrics);
  }
  async recalculateTiles(payload) {
    const { documentId, pageIndexes } = payload;
    const coreDoc = this.getCoreDocument(documentId);
    if (!coreDoc || !coreDoc.document) return;
    const scrollScope = this.scrollCapability.forDocument(documentId);
    const viewportScope = this.viewportCapability.forDocument(documentId);
    const currentMetrics = scrollScope.getMetrics(viewportScope.getMetrics());
    const refreshedTiles = {};
    const refreshTimestamp = Date.now();
    const scale = coreDoc.scale;
    for (const pageIndex of pageIndexes) {
      const metric = currentMetrics.pageVisibilityMetrics.find(
        (m) => m.pageNumber === pageIndex + 1
      );
      if (!metric) continue;
      const page = coreDoc.document.pages[pageIndex];
      if (!page) continue;
      const effectiveRotation = ((page.rotation ?? 0) + coreDoc.rotation) % 4;
      refreshedTiles[pageIndex] = calculateTilesForPage({
        page,
        metric,
        scale,
        rotation: effectiveRotation,
        tileSize: this.config.tileSize,
        overlapPx: this.config.overlapPx,
        extraRings: this.config.extraRings
      }).map((tile) => ({
        ...tile,
        id: `${tile.id}-r${refreshTimestamp}`
        // Add refresh token to force new render
      }));
    }
    if (Object.keys(refreshedTiles).length > 0) {
      this.dispatch(updateVisibleTiles(documentId, refreshedTiles));
    }
  }
  async initialize() {
  }
  calculateVisibleTiles(documentId, scrollMetrics) {
    const coreDoc = this.getCoreDocument(documentId);
    if (!coreDoc || !coreDoc.document) return;
    const scale = coreDoc.scale;
    const visibleTiles = {};
    for (const scrollMetric of scrollMetrics.pageVisibilityMetrics) {
      const pageIndex = scrollMetric.pageNumber - 1;
      const page = coreDoc.document.pages[pageIndex];
      if (!page) continue;
      const effectiveRotation = ((page.rotation ?? 0) + coreDoc.rotation) % 4;
      const tiles = calculateTilesForPage({
        page,
        metric: scrollMetric,
        scale,
        rotation: effectiveRotation,
        tileSize: this.config.tileSize,
        overlapPx: this.config.overlapPx,
        extraRings: this.config.extraRings
      });
      visibleTiles[pageIndex] = tiles;
    }
    this.dispatch(updateVisibleTiles(documentId, visibleTiles));
  }
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if (prevDoc !== newDoc) {
        this.tileRendering$.emit({ documentId, tiles: newDoc.visibleTiles });
      }
    }
  }
  buildCapability() {
    return {
      renderTile: this.renderTile.bind(this),
      forDocument: this.createTilingScope.bind(this),
      onTileRendering: this.tileRendering$.on
    };
  }
  createTilingScope(documentId) {
    return {
      renderTile: (options) => this.renderTile(options, documentId),
      onTileRendering: (listener) => this.tileRendering$.on((event) => {
        if (event.documentId === documentId) listener(event.tiles);
      })
    };
  }
  renderTile(options, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.renderCapability) {
      throw new Error("Render capability not available.");
    }
    this.dispatch(markTileStatus(id, options.pageIndex, options.tile.id, "rendering"));
    const task = this.renderCapability.forDocument(id).renderPageRect({
      pageIndex: options.pageIndex,
      rect: options.tile.pageRect,
      options: {
        scaleFactor: options.tile.srcScale,
        dpr: options.dpr,
        ...options.imageType || this.config.defaultImageType ? { imageType: options.imageType ?? this.config.defaultImageType } : {}
      }
    });
    task.wait(() => {
      this.dispatch(markTileStatus(id, options.pageIndex, options.tile.id, "ready"));
    }, ignore);
    return task;
  }
};
_TilingPlugin.id = "tiling";
let TilingPlugin = _TilingPlugin;
const TilingPluginPackage = {
  manifest,
  create: (registry, config) => new TilingPlugin(TILING_PLUGIN_ID, registry, config),
  reducer: (state, action) => tilingReducer(state, action),
  initialState
};
export {
  TILING_PLUGIN_ID,
  TilingPlugin,
  TilingPluginPackage,
  manifest
};
//# sourceMappingURL=index.js.map
