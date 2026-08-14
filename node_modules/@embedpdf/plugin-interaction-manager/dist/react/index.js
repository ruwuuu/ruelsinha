import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/react";
import { initialDocumentState, InteractionManagerPlugin } from "@embedpdf/plugin-interaction-manager";
export * from "@embedpdf/plugin-interaction-manager";
import { useState, useEffect, useRef, useCallback } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { transformSize, restorePosition } from "@embedpdf/models";
const useInteractionManagerPlugin = () => usePlugin(InteractionManagerPlugin.id);
const useInteractionManagerCapability = () => useCapability(InteractionManagerPlugin.id);
function useInteractionManager(documentId) {
  const { provides } = useInteractionManagerCapability();
  const [state, setState] = useState(initialDocumentState);
  useEffect(() => {
    if (!provides) return;
    const scope = provides.forDocument(documentId);
    return scope.onStateChange((state2) => {
      setState(state2);
    });
  }, [provides]);
  return {
    provides: (provides == null ? void 0 : provides.forDocument(documentId)) ?? null,
    state
  };
}
function useCursor(documentId) {
  const { provides } = useInteractionManagerCapability();
  return {
    setCursor: (token, cursor, prio = 0) => {
      if (!provides) return;
      const scope = provides.forDocument(documentId);
      scope.setCursor(token, cursor, prio);
    },
    removeCursor: (token) => {
      if (!provides) return;
      const scope = provides.forDocument(documentId);
      scope.removeCursor(token);
    }
  };
}
function usePointerHandlers({ modeId, pageIndex, documentId }) {
  const { provides } = useInteractionManagerCapability();
  return {
    register: (handlers, options) => {
      const finalModeId = (options == null ? void 0 : options.modeId) ?? modeId;
      const finalPageIndex = (options == null ? void 0 : options.pageIndex) ?? pageIndex;
      const finalDocumentId = (options == null ? void 0 : options.documentId) ?? documentId;
      return finalModeId ? provides == null ? void 0 : provides.registerHandlers({
        modeId: finalModeId,
        handlers,
        pageIndex: finalPageIndex,
        documentId: finalDocumentId
      }) : provides == null ? void 0 : provides.registerAlways({
        scope: finalPageIndex !== void 0 ? { type: "page", documentId: finalDocumentId, pageIndex: finalPageIndex } : { type: "global", documentId: finalDocumentId },
        handlers
      });
    }
  };
}
function useIsPageExclusive(documentId) {
  const { provides: cap } = useInteractionManagerCapability();
  const [isPageExclusive, setIsPageExclusive] = useState(() => {
    if (!cap) return false;
    const scope = cap.forDocument(documentId);
    const m = scope.getActiveInteractionMode();
    return (m == null ? void 0 : m.scope) === "page" && !!m.exclusive;
  });
  useEffect(() => {
    if (!cap) return;
    const scope = cap.forDocument(documentId);
    return scope.onModeChange(() => {
      const mode = scope.getActiveInteractionMode();
      setIsPageExclusive((mode == null ? void 0 : mode.scope) === "page" && !!(mode == null ? void 0 : mode.exclusive));
    });
  }, [cap, documentId]);
  return isPageExclusive;
}
const domEventMap = {
  pointerdown: "onPointerDown",
  pointerup: "onPointerUp",
  pointermove: "onPointerMove",
  pointerenter: "onPointerEnter",
  pointerleave: "onPointerLeave",
  pointercancel: "onPointerCancel",
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  mousemove: "onMouseMove",
  mouseenter: "onMouseEnter",
  mouseleave: "onMouseLeave",
  mousecancel: "onMouseCancel",
  click: "onClick",
  dblclick: "onDoubleClick",
  /* touch → pointer fallback for very old browsers */
  touchstart: "onPointerDown",
  touchend: "onPointerUp",
  touchmove: "onPointerMove",
  touchcancel: "onPointerCancel"
};
const pointerEventTypes = [
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerenter",
  "pointerleave",
  "pointercancel",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mousecancel",
  "click",
  "dblclick"
];
const touchEventTypes = ["touchstart", "touchend", "touchmove", "touchcancel"];
const HAS_POINTER = typeof PointerEvent !== "undefined";
const allEventTypes = HAS_POINTER ? pointerEventTypes : [...pointerEventTypes, ...touchEventTypes];
function listenerOpts(eventType, wantsRawTouch) {
  return eventType.startsWith("touch") ? { passive: !wantsRawTouch } : { passive: false };
}
function isTouchEvent(evt) {
  return typeof TouchEvent !== "undefined" && evt instanceof TouchEvent;
}
function shouldExcludeElement(element, rules) {
  var _a, _b, _c;
  if (!element) return false;
  let current = element;
  while (current) {
    if ((_a = rules.classes) == null ? void 0 : _a.length) {
      for (const className of rules.classes) {
        if ((_b = current.classList) == null ? void 0 : _b.contains(className)) {
          return true;
        }
      }
    }
    if ((_c = rules.dataAttributes) == null ? void 0 : _c.length) {
      for (const attr of rules.dataAttributes) {
        if (current.hasAttribute(attr)) {
          return true;
        }
      }
    }
    current = current.parentElement;
  }
  return false;
}
function createPointerProvider(cap, scope, element, convertEventToPoint) {
  const capScope = cap.forDocument(scope.documentId);
  let active = cap.getHandlersForScope(scope);
  const wantsRawTouchNow = () => {
    var _a;
    return ((_a = capScope.getActiveInteractionMode()) == null ? void 0 : _a.wantsRawTouch) !== false;
  };
  const listeners = {};
  let attachedWithRawTouch = wantsRawTouchNow();
  const addListeners = (raw) => {
    allEventTypes.forEach((type) => {
      const fn = listeners[type] ?? (listeners[type] = handleEvent);
      element.addEventListener(type, fn, listenerOpts(type, raw));
    });
  };
  const removeListeners = () => {
    allEventTypes.forEach((type) => {
      const fn = listeners[type];
      if (fn) element.removeEventListener(type, fn);
    });
  };
  addListeners(attachedWithRawTouch);
  element.style.touchAction = attachedWithRawTouch ? "none" : "";
  const stopMode = capScope.onModeChange(() => {
    if (scope.type === "global") {
      const mode = capScope.getActiveInteractionMode();
      element.style.cursor = (mode == null ? void 0 : mode.scope) === "global" ? mode.cursor ?? "auto" : "auto";
    }
    active = cap.getHandlersForScope(scope);
    const raw = wantsRawTouchNow();
    if (raw !== attachedWithRawTouch) {
      removeListeners();
      addListeners(raw);
      attachedWithRawTouch = raw;
      element.style.touchAction = attachedWithRawTouch ? "none" : "";
    }
  });
  const stopHandler = cap.onHandlerChange(() => {
    active = cap.getHandlersForScope(scope);
  });
  const initialMode = capScope.getActiveInteractionMode();
  const initialCursor = capScope.getCurrentCursor();
  element.style.cursor = scope.type === "global" && (initialMode == null ? void 0 : initialMode.scope) !== "global" ? "auto" : initialCursor;
  const stopCursor = capScope.onCursorChange((c) => {
    var _a;
    if (scope.type === "global" && ((_a = capScope.getActiveInteractionMode()) == null ? void 0 : _a.scope) !== "global") return;
    element.style.cursor = c;
  });
  const toPos = (e, host) => {
    if (convertEventToPoint) return convertEventToPoint(e, host);
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  function handleEvent(evt) {
    var _a;
    if (cap.isPaused()) return;
    const exclusionRules = cap.getExclusionRules();
    if (evt.target && shouldExcludeElement(evt.target, exclusionRules)) {
      return;
    }
    const handlerKey = domEventMap[evt.type];
    if (!handlerKey || !(active == null ? void 0 : active[handlerKey])) return;
    if (isTouchEvent(evt) && attachedWithRawTouch && (evt.type === "touchmove" || evt.type === "touchcancel")) {
      evt.preventDefault();
    }
    let pos;
    let normEvt;
    let propagationStopped = false;
    if (isTouchEvent(evt)) {
      const tp = evt.type === "touchend" || evt.type === "touchcancel" ? evt.changedTouches[0] : evt.touches[0];
      if (!tp) return;
      pos = toPos(tp, element);
      normEvt = {
        clientX: tp.clientX,
        clientY: tp.clientY,
        ctrlKey: evt.ctrlKey,
        shiftKey: evt.shiftKey,
        altKey: evt.altKey,
        metaKey: evt.metaKey,
        target: evt.target,
        currentTarget: evt.currentTarget,
        setPointerCapture: () => {
        },
        releasePointerCapture: () => {
        },
        stopImmediatePropagation: () => {
          propagationStopped = true;
        },
        isImmediatePropagationStopped: () => propagationStopped
      };
    } else {
      const pe = evt;
      pos = toPos(pe, element);
      normEvt = {
        clientX: pe.clientX,
        clientY: pe.clientY,
        ctrlKey: pe.ctrlKey,
        shiftKey: pe.shiftKey,
        altKey: pe.altKey,
        metaKey: pe.metaKey,
        target: pe.target,
        currentTarget: pe.currentTarget,
        setPointerCapture: () => {
          var _a2, _b;
          (_b = (_a2 = pe.target) == null ? void 0 : _a2.setPointerCapture) == null ? void 0 : _b.call(_a2, pe.pointerId);
        },
        releasePointerCapture: () => {
          var _a2, _b;
          (_b = (_a2 = pe.target) == null ? void 0 : _a2.releasePointerCapture) == null ? void 0 : _b.call(_a2, pe.pointerId);
        },
        stopImmediatePropagation: () => {
          propagationStopped = true;
        },
        isImmediatePropagationStopped: () => propagationStopped
      };
    }
    (_a = active[handlerKey]) == null ? void 0 : _a.call(active, pos, normEvt, capScope.getActiveMode());
  }
  return () => {
    removeListeners();
    stopMode();
    stopCursor();
    stopHandler();
  };
}
const GlobalPointerProvider = ({
  children,
  documentId,
  style,
  ...props
}) => {
  const ref = useRef(null);
  const { provides: cap } = useInteractionManagerCapability();
  useEffect(() => {
    if (!cap || !ref.current) return;
    return createPointerProvider(cap, { type: "global", documentId }, ref.current);
  }, [cap, documentId]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      style: {
        width: "100%",
        height: "100%",
        ...style
      },
      ...props,
      children
    }
  );
};
const PagePointerProvider = ({
  documentId,
  pageIndex,
  children,
  rotation: rotationOverride,
  scale: scaleOverride,
  convertEventToPoint,
  style,
  ...props
}) => {
  var _a, _b;
  const ref = useRef(null);
  const { provides: cap } = useInteractionManagerCapability();
  const isPageExclusive = useIsPageExclusive(documentId);
  const documentState = useDocumentState(documentId);
  const page = (_b = (_a = documentState == null ? void 0 : documentState.document) == null ? void 0 : _a.pages) == null ? void 0 : _b[pageIndex];
  const naturalPageSize = (page == null ? void 0 : page.size) ?? { width: 0, height: 0 };
  const pageRotation = (page == null ? void 0 : page.rotation) ?? 0;
  const docRotation = (documentState == null ? void 0 : documentState.rotation) ?? 0;
  const rotation = rotationOverride !== void 0 ? rotationOverride : (pageRotation + docRotation) % 4;
  const scale = scaleOverride ?? (documentState == null ? void 0 : documentState.scale) ?? 1;
  const displaySize = transformSize(naturalPageSize, 0, scale);
  const defaultConvertEventToPoint = useCallback(
    (event, element) => {
      const rect = element.getBoundingClientRect();
      const displayPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      const rotatedNaturalSize = transformSize(
        {
          width: displaySize.width,
          height: displaySize.height
        },
        rotation,
        1
      );
      return restorePosition(rotatedNaturalSize, displayPoint, rotation, scale);
    },
    [naturalPageSize, rotation, scale]
  );
  useEffect(() => {
    if (!cap || !ref.current) return;
    return createPointerProvider(
      cap,
      { type: "page", documentId, pageIndex },
      ref.current,
      convertEventToPoint || defaultConvertEventToPoint
    );
  }, [cap, documentId, pageIndex, convertEventToPoint, defaultConvertEventToPoint]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      style: {
        position: "relative",
        width: displaySize.width,
        height: displaySize.height,
        ...style
      },
      ...props,
      children: [
        children,
        isPageExclusive && /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 } })
      ]
    }
  );
};
export {
  GlobalPointerProvider,
  PagePointerProvider,
  useCursor,
  useInteractionManager,
  useInteractionManagerCapability,
  useInteractionManagerPlugin,
  useIsPageExclusive,
  usePointerHandlers
};
//# sourceMappingURL=index.js.map
