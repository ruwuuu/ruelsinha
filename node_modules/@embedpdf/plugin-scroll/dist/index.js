import { BasePlugin, createBehaviorEmitter } from "@embedpdf/core";
import { scalePosition, transformPosition, transformRect, transformSize } from "@embedpdf/models";
var ScrollStrategy = /* @__PURE__ */ ((ScrollStrategy2) => {
  ScrollStrategy2["Vertical"] = "vertical";
  ScrollStrategy2["Horizontal"] = "horizontal";
  return ScrollStrategy2;
})(ScrollStrategy || {});
class BaseScrollStrategy {
  constructor(config) {
    this.pageGap = config.pageGap ?? 20;
    this.viewportGap = config.viewportGap ?? 20;
    this.bufferSize = config.bufferSize ?? 2;
  }
  /**
   * Horizontal centering offset for items narrower than the content max width.
   * Vertical layout centers spreads within the row; horizontal layout overrides to 0
   * since items stay in a simple row without centering.
   */
  getCenteringOffsetX(_item, totalContentSize) {
    if (!totalContentSize || _item.width >= totalContentSize.width) return 0;
    return (totalContentSize.width - _item.width) / 2;
  }
  /**
   * Vertical centering offset for items shorter than the content max height.
   * Horizontal layout centers items within the row height; vertical layout keeps
   * items top-aligned and uses the default of 0.
   */
  getCenteringOffsetY(_item, _totalContentSize) {
    return 0;
  }
  getVisibleRange(viewport, virtualItems, scale) {
    const scrollOffset = this.getScrollOffset(viewport);
    const clientSize = this.getClientSize(viewport);
    const viewportStart = scrollOffset;
    const viewportEnd = scrollOffset + clientSize;
    let startIndex = 0;
    while (startIndex < virtualItems.length && (virtualItems[startIndex].offset + this.getItemSizeAlongScrollAxis(virtualItems[startIndex])) * scale <= viewportStart) {
      startIndex++;
    }
    let endIndex = startIndex;
    while (endIndex < virtualItems.length && virtualItems[endIndex].offset * scale <= viewportEnd) {
      endIndex++;
    }
    return {
      start: Math.max(0, startIndex - this.bufferSize),
      end: Math.min(virtualItems.length - 1, endIndex + this.bufferSize - 1)
    };
  }
  handleScroll(viewport, virtualItems, scale) {
    const range = this.getVisibleRange(viewport, virtualItems, scale);
    const visibleItems = virtualItems.slice(range.start, range.end + 1);
    const totalContentSize = this.getTotalContentSize(virtualItems);
    const pageVisibilityMetrics = this.calculatePageVisibility(
      visibleItems,
      viewport,
      scale,
      totalContentSize
    );
    const visiblePages = pageVisibilityMetrics.map((m) => m.pageNumber);
    const renderedPageIndexes = virtualItems.slice(range.start, range.end + 1).flatMap((item) => item.index);
    const currentPage = this.determineCurrentPage(pageVisibilityMetrics);
    const first = virtualItems[range.start];
    const last = virtualItems[range.end];
    const startSpacing = first ? first.offset * scale : 0;
    const lastItem = virtualItems[virtualItems.length - 1];
    const endSpacing = last ? (lastItem.offset + this.getItemSizeAlongScrollAxis(lastItem)) * scale - (last.offset + this.getItemSizeAlongScrollAxis(last)) * scale : 0;
    return {
      currentPage,
      visiblePages,
      pageVisibilityMetrics,
      renderedPageIndexes,
      scrollOffset: { x: viewport.scrollLeft, y: viewport.scrollTop },
      startSpacing,
      endSpacing
    };
  }
  calculatePageVisibility(virtualItems, viewport, scale, totalContentSize) {
    const visibilityMetrics = [];
    virtualItems.forEach((item) => {
      const centeringOffsetX = this.getCenteringOffsetX(item, totalContentSize);
      const centeringOffsetY = this.getCenteringOffsetY(item, totalContentSize);
      item.pageLayouts.forEach((page) => {
        const itemX = (item.x + centeringOffsetX) * scale;
        const itemY = (item.y + centeringOffsetY) * scale;
        const pageX = itemX + page.x * scale;
        const pageY = itemY + page.y * scale;
        const pageWidth = page.rotatedWidth * scale;
        const pageHeight = page.rotatedHeight * scale;
        const viewportLeft = viewport.scrollLeft;
        const viewportTop = viewport.scrollTop;
        const viewportRight = viewportLeft + viewport.clientWidth;
        const viewportBottom = viewportTop + viewport.clientHeight;
        const intersectionLeft = Math.max(pageX, viewportLeft);
        const intersectionTop = Math.max(pageY, viewportTop);
        const intersectionRight = Math.min(pageX + pageWidth, viewportRight);
        const intersectionBottom = Math.min(pageY + pageHeight, viewportBottom);
        if (intersectionLeft < intersectionRight && intersectionTop < intersectionBottom) {
          const visibleWidth = intersectionRight - intersectionLeft;
          const visibleHeight = intersectionBottom - intersectionTop;
          const totalArea = pageWidth * pageHeight;
          const visibleArea = visibleWidth * visibleHeight;
          visibilityMetrics.push({
            pageNumber: page.pageNumber,
            viewportX: intersectionLeft - viewportLeft,
            viewportY: intersectionTop - viewportTop,
            visiblePercentage: visibleArea / totalArea * 100,
            original: {
              pageX: (intersectionLeft - pageX) / scale,
              pageY: (intersectionTop - pageY) / scale,
              visibleWidth: visibleWidth / scale,
              visibleHeight: visibleHeight / scale,
              scale: 1
            },
            scaled: {
              pageX: intersectionLeft - pageX,
              pageY: intersectionTop - pageY,
              visibleWidth,
              visibleHeight,
              scale
            }
          });
        }
      });
    });
    return visibilityMetrics;
  }
  determineCurrentPage(visibilityMetrics) {
    if (visibilityMetrics.length === 0) return 1;
    const maxVisibility = Math.max(...visibilityMetrics.map((m) => m.visiblePercentage));
    const mostVisiblePages = visibilityMetrics.filter((m) => m.visiblePercentage === maxVisibility);
    return mostVisiblePages.length === 1 ? mostVisiblePages[0].pageNumber : mostVisiblePages.sort((a, b) => a.pageNumber - b.pageNumber)[0].pageNumber;
  }
  getRectLocationForPage(pageNumber, virtualItems, totalContentSize) {
    const item = virtualItems.find((item2) => item2.pageNumbers.includes(pageNumber));
    if (!item) return null;
    const pageLayout = item.pageLayouts.find((layout) => layout.pageNumber === pageNumber);
    if (!pageLayout) return null;
    const centeringOffsetX = this.getCenteringOffsetX(item, totalContentSize);
    const centeringOffsetY = this.getCenteringOffsetY(item, totalContentSize);
    return {
      origin: {
        x: item.x + pageLayout.x + centeringOffsetX,
        y: item.y + pageLayout.y + centeringOffsetY
      },
      size: {
        width: pageLayout.width,
        height: pageLayout.height
      }
    };
  }
  getScrollPositionForPage(pageNumber, virtualItems, scale, rotation, pageCoordinates) {
    const totalContentSize = this.getTotalContentSize(virtualItems);
    const pageRect = this.getRectLocationForPage(pageNumber, virtualItems, totalContentSize);
    if (!pageRect) return null;
    const scaledBasePosition = scalePosition(pageRect.origin, scale);
    if (pageCoordinates) {
      const rotatedSize = transformPosition(
        {
          width: pageRect.size.width,
          height: pageRect.size.height
        },
        {
          x: pageCoordinates.x,
          y: pageCoordinates.y
        },
        rotation,
        scale
      );
      return {
        x: scaledBasePosition.x + rotatedSize.x + this.viewportGap,
        y: scaledBasePosition.y + rotatedSize.y + this.viewportGap
      };
    }
    return {
      x: scaledBasePosition.x + this.viewportGap,
      y: scaledBasePosition.y + this.viewportGap
    };
  }
  getRectPositionForPage(pageNumber, virtualItems, scale, rotation, rect) {
    const totalContentSize = this.getTotalContentSize(virtualItems);
    const pageRect = this.getRectLocationForPage(pageNumber, virtualItems, totalContentSize);
    if (!pageRect) return null;
    const scaledBasePosition = scalePosition(pageRect.origin, scale);
    const rotatedSize = transformRect(
      {
        width: pageRect.size.width,
        height: pageRect.size.height
      },
      rect,
      rotation,
      scale
    );
    return {
      origin: {
        x: scaledBasePosition.x + rotatedSize.origin.x,
        y: scaledBasePosition.y + rotatedSize.origin.y
      },
      size: rotatedSize.size
    };
  }
}
class VerticalScrollStrategy extends BaseScrollStrategy {
  constructor(config) {
    super(config);
  }
  createVirtualItems(pdfPageObject) {
    let yOffset = 0;
    return pdfPageObject.map((pagesInSpread, index) => {
      let pageX = 0;
      const pageLayouts = pagesInSpread.map((page) => {
        const layout = {
          pageNumber: page.index + 1,
          pageIndex: page.index,
          x: pageX,
          y: 0,
          width: page.size.width,
          height: page.size.height,
          rotatedWidth: page.rotatedSize.width,
          rotatedHeight: page.rotatedSize.height,
          elevated: false
        };
        pageX += page.rotatedSize.width + this.pageGap;
        return layout;
      });
      const width = pagesInSpread.reduce(
        (sum, page, i) => sum + page.rotatedSize.width + (i < pagesInSpread.length - 1 ? this.pageGap : 0),
        0
      );
      const height = Math.max(...pagesInSpread.map((p) => p.rotatedSize.height));
      const item = {
        id: `item-${index}`,
        x: 0,
        y: yOffset,
        offset: yOffset,
        width,
        height,
        pageLayouts,
        pageNumbers: pagesInSpread.map((p) => p.index + 1),
        index
      };
      yOffset += height + this.pageGap;
      return item;
    });
  }
  getTotalContentSize(virtualItems) {
    if (virtualItems.length === 0) return { width: 0, height: 0 };
    const maxWidth = Math.max(...virtualItems.map((item) => item.width));
    const totalHeight = virtualItems[virtualItems.length - 1].y + virtualItems[virtualItems.length - 1].height;
    return {
      width: maxWidth,
      height: totalHeight
    };
  }
  getScrollOffset(viewport) {
    return viewport.scrollTop;
  }
  getClientSize(viewport) {
    return viewport.clientHeight;
  }
  /** Vertical scroll: extent along scroll axis is height. */
  getItemSizeAlongScrollAxis(item) {
    return item.height;
  }
}
class HorizontalScrollStrategy extends BaseScrollStrategy {
  constructor(config) {
    super(config);
  }
  createVirtualItems(pdfPageObject) {
    let xOffset = 0;
    return pdfPageObject.map((pagesInSpread, index) => {
      let pageX = 0;
      const pageLayouts = pagesInSpread.map((page) => {
        const layout = {
          pageNumber: page.index + 1,
          pageIndex: page.index,
          x: pageX,
          y: 0,
          width: page.size.width,
          height: page.size.height,
          rotatedWidth: page.rotatedSize.width,
          rotatedHeight: page.rotatedSize.height,
          elevated: false
        };
        pageX += page.rotatedSize.width + this.pageGap;
        return layout;
      });
      const width = pagesInSpread.reduce(
        (sum, page, i) => sum + page.rotatedSize.width + (i < pagesInSpread.length - 1 ? this.pageGap : 0),
        0
      );
      const height = Math.max(...pagesInSpread.map((p) => p.rotatedSize.height));
      const item = {
        id: `item-${index}`,
        x: xOffset,
        y: 0,
        offset: xOffset,
        width,
        height,
        pageLayouts,
        pageNumbers: pagesInSpread.map((p) => p.index + 1),
        index
      };
      xOffset += width + this.pageGap;
      return item;
    });
  }
  getTotalContentSize(virtualItems) {
    if (virtualItems.length === 0) return { width: 0, height: 0 };
    const totalWidth = virtualItems[virtualItems.length - 1].x + virtualItems[virtualItems.length - 1].width;
    const maxHeight = Math.max(...virtualItems.map((item) => item.height));
    return {
      width: totalWidth,
      height: maxHeight
    };
  }
  getScrollOffset(viewport) {
    return viewport.scrollLeft;
  }
  getClientSize(viewport) {
    return viewport.clientWidth;
  }
  /** Horizontal scroll: extent along scroll axis is width. */
  getItemSizeAlongScrollAxis(item) {
    return item.width;
  }
  /**
   * No centering for horizontal layout. Items are laid out in a simple row;
   * using total content width would produce incorrect offsets and shift pages.
   */
  /* eslint-disable no-unused-vars -- override intentionally ignores params */
  getCenteringOffsetX(_item, _totalContentSize) {
    return 0;
  }
  /**
   * Horizontal rows visually center shorter items within the tallest row height.
   * Match that DOM layout so page-coordinate targeting lands on the rendered page.
   */
  getCenteringOffsetY(item, totalContentSize) {
    if (!totalContentSize || item.height >= totalContentSize.height) return 0;
    return (totalContentSize.height - item.height) / 2;
  }
}
const INIT_SCROLL_STATE = "INIT_SCROLL_STATE";
const CLEANUP_SCROLL_STATE = "CLEANUP_SCROLL_STATE";
const UPDATE_DOCUMENT_SCROLL_STATE = "UPDATE_DOCUMENT_SCROLL_STATE";
const SET_SCROLL_STRATEGY = "SET_SCROLL_STRATEGY";
function initScrollState(documentId, state) {
  return { type: INIT_SCROLL_STATE, payload: { documentId, state } };
}
function cleanupScrollState(documentId) {
  return { type: CLEANUP_SCROLL_STATE, payload: documentId };
}
function updateDocumentScrollState(documentId, state) {
  return { type: UPDATE_DOCUMENT_SCROLL_STATE, payload: { documentId, state } };
}
function setScrollStrategy(documentId, strategy) {
  return { type: SET_SCROLL_STRATEGY, payload: { documentId, strategy } };
}
const defaultPageChangeState = {
  isChanging: false,
  targetPage: 1,
  fromPage: 1,
  startTime: 0
};
const initialState = (_coreState, config) => ({
  defaultStrategy: config.defaultStrategy ?? ScrollStrategy.Vertical,
  defaultPageGap: config.defaultPageGap ?? 10,
  defaultBufferSize: config.defaultBufferSize ?? 2,
  documents: {}
});
const scrollReducer = (state, action) => {
  switch (action.type) {
    case INIT_SCROLL_STATE: {
      const { documentId, state: docState } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        }
      };
    }
    case CLEANUP_SCROLL_STATE: {
      const { [action.payload]: removed, ...remaining } = state.documents;
      return {
        ...state,
        documents: remaining
      };
    }
    case UPDATE_DOCUMENT_SCROLL_STATE: {
      const { documentId, state: updates } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            ...updates
          }
        }
      };
    }
    case SET_SCROLL_STRATEGY: {
      const { documentId, strategy } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            strategy
          }
        }
      };
    }
    default:
      return state;
  }
};
const getScrollerLayout = (documentState, scale, elevatedPages) => {
  return {
    startSpacing: documentState.startSpacing,
    endSpacing: documentState.endSpacing,
    totalWidth: documentState.totalContentSize.width * scale,
    totalHeight: documentState.totalContentSize.height * scale,
    pageGap: documentState.pageGap * scale,
    strategy: documentState.strategy,
    items: documentState.renderedPageIndexes.map((idx) => {
      return {
        ...documentState.virtualItems[idx],
        pageLayouts: documentState.virtualItems[idx].pageLayouts.map((layout) => {
          return {
            ...layout,
            rotatedWidth: layout.rotatedWidth * scale,
            rotatedHeight: layout.rotatedHeight * scale,
            width: layout.width * scale,
            height: layout.height * scale,
            elevated: (elevatedPages == null ? void 0 : elevatedPages.has(layout.pageIndex)) ?? false
          };
        })
      };
    })
  };
};
const _ScrollPlugin = class _ScrollPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b, _c;
    super(id, registry);
    this.id = id;
    this.config = config;
    this.elevatedPages = /* @__PURE__ */ new Map();
    this.strategies = /* @__PURE__ */ new Map();
    this.layoutReady = /* @__PURE__ */ new Set();
    this.initialLayoutFired = /* @__PURE__ */ new Set();
    this.scrollerLayoutEmitters = /* @__PURE__ */ new Map();
    this.pageChange$ = createBehaviorEmitter();
    this.scroll$ = createBehaviorEmitter();
    this.layoutChange$ = createBehaviorEmitter();
    this.pageChangeState$ = createBehaviorEmitter();
    this.layoutReady$ = createBehaviorEmitter();
    this.state$ = createBehaviorEmitter();
    this.viewport = this.registry.getPlugin("viewport").provides();
    this.spread = ((_a = this.registry.getPlugin("spread")) == null ? void 0 : _a.provides()) ?? null;
    this.viewport.onScrollActivity((event) => {
      const docState = this.getDocumentState(event.documentId);
      if ((docState == null ? void 0 : docState.pageChangeState.isChanging) && !event.activity.isSmoothScrolling) {
        this.completePageChange(event.documentId);
      }
    });
    (_b = this.spread) == null ? void 0 : _b.onSpreadChange((event) => {
      this.refreshDocumentLayout(event.documentId);
    });
    const im = (_c = this.registry.getPlugin("interaction-manager")) == null ? void 0 : _c.provides();
    if (im) {
      im.onPageActivityChange((event) => {
        let pages = this.elevatedPages.get(event.documentId);
        if (event.hasActivity) {
          if (!pages) {
            pages = /* @__PURE__ */ new Set();
            this.elevatedPages.set(event.documentId, pages);
          }
          pages.add(event.pageIndex);
        } else {
          pages == null ? void 0 : pages.delete(event.pageIndex);
        }
        this.pushScrollerLayout(event.documentId);
      });
    }
    this.viewport.onViewportChange((event) => {
      const docState = this.getDocumentState(event.documentId);
      if (!docState) return;
      const computedMetrics = this.computeMetrics(event.documentId, event.metrics);
      if (this.layoutReady.has(event.documentId)) {
        this.commitMetrics(event.documentId, computedMetrics);
      } else {
        this.commitMetrics(event.documentId, {
          ...computedMetrics,
          scrollOffset: docState.scrollOffset
        });
      }
    });
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle Hooks (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    const coreDoc = this.getCoreDocument(documentId);
    if (!coreDoc) return;
    const docState = this.createDocumentState(coreDoc);
    this.dispatch(initScrollState(documentId, docState));
    const strategy = this.createStrategy(docState.strategy);
    this.strategies.set(documentId, strategy);
    this.scrollerLayoutEmitters.set(documentId, createBehaviorEmitter());
  }
  onDocumentLoaded(documentId) {
    var _a;
    const coreDoc = this.getCoreDocument(documentId);
    if (!coreDoc) return;
    this.dispatch(
      updateDocumentScrollState(documentId, { totalPages: ((_a = coreDoc.document) == null ? void 0 : _a.pageCount) ?? 0 })
    );
    this.refreshDocumentLayout(documentId);
    this.logger.debug(
      "ScrollPlugin",
      "DocumentOpened",
      `Initialized scroll state for document: ${documentId}`
    );
  }
  onDocumentClosed(documentId) {
    this.strategies.delete(documentId);
    this.layoutReady.delete(documentId);
    this.initialLayoutFired.delete(documentId);
    this.elevatedPages.delete(documentId);
    const emitter = this.scrollerLayoutEmitters.get(documentId);
    if (emitter) {
      emitter.clear();
      this.scrollerLayoutEmitters.delete(documentId);
    }
    this.dispatch(cleanupScrollState(documentId));
    this.logger.debug(
      "ScrollPlugin",
      "DocumentClosed",
      `Cleaned up scroll state for document: ${documentId}`
    );
  }
  onScaleChanged(documentId) {
    const coreDoc = this.coreState.core.documents[documentId];
    if (!coreDoc || coreDoc.status !== "loaded") return;
    const viewportScope = this.viewport.forDocument(documentId);
    const metrics = this.computeMetrics(documentId, viewportScope.getMetrics());
    this.commitMetrics(documentId, metrics);
  }
  onRotationChanged(documentId) {
    this.refreshDocumentLayout(documentId);
  }
  // ─────────────────────────────────────────────────────────
  // Public API for Components (Scroller Layout)
  // ─────────────────────────────────────────────────────────
  /**
   * Subscribe to scroller layout updates for a specific document
   * This is the key method for the Scroller component to stay reactive
   */
  onScrollerData(documentId, callback) {
    const emitter = this.scrollerLayoutEmitters.get(documentId);
    if (!emitter) {
      throw new Error(`No scroller layout emitter found for document: ${documentId}`);
    }
    return emitter.on(callback);
  }
  /**
   * Get current scroller layout for a document
   */
  getScrollerLayout(documentId) {
    const docState = this.getDocumentState(documentId);
    const coreDoc = this.getCoreDocumentOrThrow(documentId);
    if (!docState || !coreDoc) {
      throw new Error(`Cannot get scroller layout for document: ${documentId}`);
    }
    return getScrollerLayout(docState, coreDoc.scale, this.elevatedPages.get(documentId));
  }
  setLayoutReady(documentId) {
    if (this.layoutReady.has(documentId)) {
      return;
    }
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    this.layoutReady.add(documentId);
    const isInitial = !this.initialLayoutFired.has(documentId);
    if (isInitial) {
      this.initialLayoutFired.add(documentId);
    }
    const viewport = this.viewport.forDocument(documentId);
    viewport.scrollTo({ ...docState.scrollOffset, behavior: "instant" });
    this.layoutReady$.emit({
      documentId,
      isInitial,
      pageNumber: docState.currentPage,
      totalPages: docState.totalPages
    });
  }
  clearLayoutReady(documentId) {
    this.layoutReady.delete(documentId);
  }
  // ─────────────────────────────────────────────────────────
  // Capability
  // ─────────────────────────────────────────────────────────
  buildCapability() {
    return {
      // Active document operations
      getCurrentPage: () => this.getCurrentPage(),
      getTotalPages: () => this.getTotalPages(),
      getPageChangeState: () => this.getPageChangeState(),
      scrollToPage: (options) => this.scrollToPage(options),
      scrollToNextPage: (behavior) => this.scrollToNextPage(behavior),
      scrollToPreviousPage: (behavior) => this.scrollToPreviousPage(behavior),
      getMetrics: (viewport) => this.getMetrics(viewport),
      getLayout: () => this.getLayout(),
      getRectPositionForPage: (page, rect, scale, rotation) => this.getRectPositionForPage(page, rect, scale, rotation),
      // Document-scoped operations
      forDocument: (documentId) => this.createScrollScope(documentId),
      // Global settings
      setScrollStrategy: (strategy, documentId) => this.setScrollStrategyForDocument(strategy, documentId),
      getPageGap: () => this.state.defaultPageGap,
      // Events
      onPageChange: this.pageChange$.on,
      onScroll: this.scroll$.on,
      onLayoutChange: this.layoutChange$.on,
      onLayoutReady: this.layoutReady$.on,
      onPageChangeState: this.pageChangeState$.on,
      onStateChange: this.state$.on
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createScrollScope(documentId) {
    return {
      getCurrentPage: () => this.getCurrentPage(documentId),
      getTotalPages: () => this.getTotalPages(documentId),
      getPageChangeState: () => this.getPageChangeState(documentId),
      scrollToPage: (options) => this.scrollToPage(options, documentId),
      scrollToNextPage: (behavior) => this.scrollToNextPage(behavior, documentId),
      scrollToPreviousPage: (behavior) => this.scrollToPreviousPage(behavior, documentId),
      getSpreadPagesWithRotatedSize: () => this.getSpreadPagesWithRotatedSize(documentId),
      getMetrics: (viewport) => this.getMetrics(viewport, documentId),
      getLayout: () => this.getLayout(documentId),
      getRectPositionForPage: (page, rect, scale, rotation) => this.getRectPositionForPage(page, rect, scale, rotation, documentId),
      setScrollStrategy: (strategy) => this.setScrollStrategyForDocument(strategy, documentId),
      onPageChange: (listener) => this.pageChange$.on((event) => {
        if (event.documentId === documentId) listener(event);
      }),
      onScroll: (listener) => this.scroll$.on((event) => {
        if (event.documentId === documentId) listener(event.metrics);
      }),
      onLayoutChange: (listener) => this.layoutChange$.on((event) => {
        if (event.documentId === documentId) listener(event.layout);
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
      throw new Error(`Scroll state not found for document: ${documentId ?? "active"}`);
    }
    return state;
  }
  getStrategy(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error(`Strategy not found for document: ${id}`);
    }
    return strategy;
  }
  createStrategy(strategyType) {
    const config = {
      pageGap: this.state.defaultPageGap,
      viewportGap: this.viewport.getViewportGap(),
      bufferSize: this.state.defaultBufferSize
    };
    return strategyType === ScrollStrategy.Horizontal ? new HorizontalScrollStrategy(config) : new VerticalScrollStrategy(config);
  }
  createDocumentState(coreDoc) {
    var _a;
    return {
      virtualItems: [],
      totalPages: ((_a = coreDoc.document) == null ? void 0 : _a.pageCount) ?? 0,
      currentPage: 1,
      totalContentSize: { width: 0, height: 0 },
      strategy: this.state.defaultStrategy,
      pageGap: this.state.defaultPageGap,
      visiblePages: [],
      pageVisibilityMetrics: [],
      renderedPageIndexes: [],
      scrollOffset: { x: 0, y: 0 },
      startSpacing: 0,
      endSpacing: 0,
      pageChangeState: defaultPageChangeState
    };
  }
  // ─────────────────────────────────────────────────────────
  // Page Change Management
  // ─────────────────────────────────────────────────────────
  startPageChange(documentId, targetPage, behavior = "smooth") {
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    const pageChangeState = {
      isChanging: true,
      targetPage,
      fromPage: docState.currentPage,
      startTime: Date.now()
    };
    this.dispatch(
      updateDocumentScrollState(documentId, {
        pageChangeState,
        currentPage: targetPage
      })
    );
    this.pageChange$.emit({
      documentId,
      pageNumber: targetPage,
      totalPages: docState.totalPages
    });
    if (behavior === "instant") {
      this.completePageChange(documentId);
    }
  }
  completePageChange(documentId) {
    const docState = this.getDocumentState(documentId);
    if (!docState || !docState.pageChangeState.isChanging) return;
    const pageChangeState = {
      isChanging: false,
      targetPage: docState.pageChangeState.targetPage,
      fromPage: docState.pageChangeState.fromPage,
      startTime: docState.pageChangeState.startTime
    };
    this.dispatch(updateDocumentScrollState(documentId, { pageChangeState }));
  }
  // ─────────────────────────────────────────────────────────
  // Layout & Metrics Computation
  // ─────────────────────────────────────────────────────────
  computeLayout(documentId, pages) {
    const strategy = this.getStrategy(documentId);
    const virtualItems = strategy.createVirtualItems(pages);
    const totalContentSize = strategy.getTotalContentSize(virtualItems);
    return { virtualItems, totalContentSize };
  }
  computeMetrics(documentId, vp, items) {
    const coreDocState = this.getCoreDocumentOrThrow(documentId);
    const docState = this.getDocumentState(documentId);
    const strategy = this.getStrategy(documentId);
    if (!docState) throw new Error(`Document state not found: ${documentId}`);
    return strategy.handleScroll(vp, items ?? docState.virtualItems, coreDocState.scale);
  }
  // ─────────────────────────────────────────────────────────
  // Commit (Single Source of Truth)
  // ─────────────────────────────────────────────────────────
  commitMetrics(documentId, metrics) {
    const docState = this.getDocumentState(documentId);
    if (!docState) return;
    const isProgrammaticScroll = docState.pageChangeState.isChanging;
    const metricsToCommit = isProgrammaticScroll && metrics.currentPage !== docState.currentPage ? { ...metrics, currentPage: docState.currentPage } : metrics;
    this.dispatch(updateDocumentScrollState(documentId, metricsToCommit));
    this.scroll$.emit({ documentId, metrics: metricsToCommit });
    if (!isProgrammaticScroll && metrics.currentPage !== docState.currentPage) {
      this.pageChange$.emit({
        documentId,
        pageNumber: metrics.currentPage,
        totalPages: docState.totalPages
      });
    }
    this.pushScrollerLayout(documentId);
  }
  pushScrollerLayout(documentId) {
    const emitter = this.scrollerLayoutEmitters.get(documentId);
    if (!emitter) return;
    try {
      const layout = this.getScrollerLayout(documentId);
      emitter.emit(layout);
    } catch (error) {
    }
  }
  refreshDocumentLayout(documentId) {
    const coreDoc = this.coreState.core.documents[documentId];
    const docState = this.getDocumentState(documentId);
    if (!coreDoc || !docState || coreDoc.status !== "loaded") return;
    const pages = this.getSpreadPagesWithRotatedSize(documentId);
    const layout = this.computeLayout(documentId, pages);
    const viewport = this.viewport.forDocument(documentId);
    const metrics = this.computeMetrics(documentId, viewport.getMetrics(), layout.virtualItems);
    this.dispatch(
      updateDocumentScrollState(documentId, {
        ...layout,
        ...metrics
      })
    );
    this.layoutChange$.emit({ documentId, layout });
    this.pushScrollerLayout(documentId);
  }
  getSpreadPagesWithRotatedSize(documentId) {
    var _a, _b;
    const id = documentId ?? this.getActiveDocumentId();
    const coreDoc = this.coreState.core.documents[id];
    if (!coreDoc) throw new Error(`Document ${id} not loaded`);
    const spreadPages = ((_a = this.spread) == null ? void 0 : _a.forDocument(id).getSpreadPages()) || ((_b = coreDoc.document) == null ? void 0 : _b.pages.map((page) => [page])) || [];
    return spreadPages.map(
      (spread) => spread.map((page) => {
        const effectiveRotation = ((page.rotation ?? 0) + coreDoc.rotation) % 4;
        return {
          ...page,
          rotatedSize: transformSize(page.size, effectiveRotation, 1)
        };
      })
    );
  }
  // ─────────────────────────────────────────────────────────
  // Core Operations
  // ─────────────────────────────────────────────────────────
  getCurrentPage(documentId) {
    return this.getDocumentStateOrThrow(documentId).currentPage;
  }
  getTotalPages(documentId) {
    return this.getDocumentStateOrThrow(documentId).totalPages;
  }
  getPageChangeState(documentId) {
    return this.getDocumentStateOrThrow(documentId).pageChangeState;
  }
  scrollToPage(options, documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const strategy = this.getStrategy(id);
    const coreDoc = this.getCoreDocumentOrThrow(id);
    const { pageNumber, behavior = "smooth", pageCoordinates, alignX, alignY } = options;
    this.startPageChange(id, pageNumber, behavior);
    const pageObj = (_a = coreDoc.document) == null ? void 0 : _a.pages[pageNumber - 1];
    const effectiveRotation = (((pageObj == null ? void 0 : pageObj.rotation) ?? 0) + coreDoc.rotation) % 4;
    const position = strategy.getScrollPositionForPage(
      pageNumber,
      docState.virtualItems,
      coreDoc.scale,
      effectiveRotation,
      pageCoordinates
    );
    if (position) {
      const viewport = this.viewport.forDocument(id);
      viewport.scrollTo({ ...position, behavior, alignX, alignY });
    } else {
      this.completePageChange(id);
    }
  }
  scrollToNextPage(behavior = "smooth", documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const strategy = this.getStrategy(id);
    const coreDoc = this.getCoreDocumentOrThrow(id);
    const currentItemIndex = docState.virtualItems.findIndex(
      (item) => item.pageNumbers.includes(docState.currentPage)
    );
    if (currentItemIndex >= 0 && currentItemIndex < docState.virtualItems.length - 1) {
      const nextItem = docState.virtualItems[currentItemIndex + 1];
      const targetPage = nextItem.pageNumbers[0];
      this.startPageChange(id, targetPage, behavior);
      const position = strategy.getScrollPositionForPage(
        targetPage,
        docState.virtualItems,
        coreDoc.scale,
        coreDoc.rotation
      );
      if (position) {
        const viewport = this.viewport.forDocument(id);
        viewport.scrollTo({ ...position, behavior });
      } else {
        this.completePageChange(id);
      }
    }
  }
  scrollToPreviousPage(behavior = "smooth", documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const strategy = this.getStrategy(id);
    const coreDoc = this.coreState.core.documents[id];
    const currentItemIndex = docState.virtualItems.findIndex(
      (item) => item.pageNumbers.includes(docState.currentPage)
    );
    if (currentItemIndex > 0) {
      const prevItem = docState.virtualItems[currentItemIndex - 1];
      const targetPage = prevItem.pageNumbers[0];
      this.startPageChange(id, targetPage, behavior);
      const position = strategy.getScrollPositionForPage(
        targetPage,
        docState.virtualItems,
        coreDoc.scale,
        coreDoc.rotation
      );
      if (position) {
        const viewport = this.viewport.forDocument(id);
        viewport.scrollTo({ ...position, behavior });
      } else {
        this.completePageChange(id);
      }
    }
  }
  getMetrics(viewport, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (viewport) {
      return this.computeMetrics(id, viewport);
    }
    const viewportScope = this.viewport.forDocument(id);
    return this.computeMetrics(id, viewportScope.getMetrics());
  }
  getLayout(documentId) {
    const docState = this.getDocumentStateOrThrow(documentId);
    return {
      virtualItems: docState.virtualItems,
      totalContentSize: docState.totalContentSize
    };
  }
  getRectPositionForPage(pageIndex, rect, scale, rotation, documentId) {
    var _a;
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentStateOrThrow(id);
    const strategy = this.getStrategy(id);
    const coreDoc = this.getCoreDocumentOrThrow(id);
    let effectiveRotation = rotation;
    if (effectiveRotation === void 0) {
      const pageObj = (_a = coreDoc.document) == null ? void 0 : _a.pages[pageIndex];
      effectiveRotation = (((pageObj == null ? void 0 : pageObj.rotation) ?? 0) + coreDoc.rotation) % 4;
    }
    return strategy.getRectPositionForPage(
      pageIndex + 1,
      docState.virtualItems,
      scale ?? coreDoc.scale,
      effectiveRotation,
      rect
    );
  }
  setScrollStrategyForDocument(newStrategy, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(id);
    if (!docState || docState.strategy === newStrategy) return;
    const strategy = this.createStrategy(newStrategy);
    this.strategies.set(id, strategy);
    this.dispatch(setScrollStrategy(id, newStrategy));
    this.refreshDocumentLayout(id);
  }
  // ─────────────────────────────────────────────────────────
  // Store Update Handlers
  // ─────────────────────────────────────────────────────────
  onStoreUpdated(prevState, newState) {
    for (const documentId in newState.documents) {
      const prevDoc = prevState.documents[documentId];
      const newDoc = newState.documents[documentId];
      if (prevDoc !== newDoc) {
        this.state$.emit(newDoc);
        if ((prevDoc == null ? void 0 : prevDoc.pageChangeState) !== newDoc.pageChangeState) {
          this.pageChangeState$.emit({
            documentId,
            state: newDoc.pageChangeState
          });
        }
        this.pushScrollerLayout(documentId);
      }
    }
  }
  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────
  async initialize() {
    this.logger.info("ScrollPlugin", "Initialize", "Scroll plugin initialized");
  }
  async destroy() {
    this.strategies.clear();
    this.layoutReady.clear();
    this.initialLayoutFired.clear();
    this.elevatedPages.clear();
    for (const emitter of this.scrollerLayoutEmitters.values()) {
      emitter.clear();
    }
    this.scrollerLayoutEmitters.clear();
    this.pageChange$.clear();
    this.scroll$.clear();
    this.layoutChange$.clear();
    this.pageChangeState$.clear();
    this.layoutReady$.clear();
    this.state$.clear();
    super.destroy();
  }
};
_ScrollPlugin.id = "scroll";
let ScrollPlugin = _ScrollPlugin;
const SCROLL_PLUGIN_ID = "scroll";
const manifest = {
  id: SCROLL_PLUGIN_ID,
  name: "Scroll Plugin",
  version: "1.0.0",
  provides: ["scroll"],
  requires: ["viewport"],
  optional: ["spread", "interaction-manager"],
  defaultConfig: {
    defaultPageGap: 10,
    defaultBufferSize: 4,
    defaultStrategy: ScrollStrategy.Vertical
  }
};
const ScrollPluginPackage = {
  manifest,
  create: (registry, config) => new ScrollPlugin(SCROLL_PLUGIN_ID, registry, config),
  reducer: scrollReducer,
  initialState: (coreState, config) => initialState(coreState, config)
};
export {
  SCROLL_PLUGIN_ID,
  ScrollPlugin,
  ScrollPluginPackage,
  ScrollStrategy,
  getScrollerLayout,
  manifest
};
//# sourceMappingURL=index.js.map
