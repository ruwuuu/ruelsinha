import { ref, watch, toValue, computed, defineComponent, watchEffect, openBlock, createElementBlock, renderSlot, mergeProps, unref, createCommentVNode } from "vue";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/vue";
import { InteractionManagerPlugin, initialDocumentState } from "@embedpdf/plugin-interaction-manager";
export * from "@embedpdf/plugin-interaction-manager";
import { transformSize, restorePosition } from "@embedpdf/models";
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
const useInteractionManagerPlugin = () => usePlugin(InteractionManagerPlugin.id);
const useInteractionManagerCapability = () => useCapability(InteractionManagerPlugin.id);
function useInteractionManager(documentId) {
  const { provides } = useInteractionManagerCapability();
  const state = ref(initialDocumentState);
  watch(
    [provides, () => toValue(documentId)],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) {
        state.value = initialDocumentState;
        return;
      }
      const scope = providesValue.forDocument(docId);
      state.value = scope.getState();
      const unsubscribe = scope.onStateChange((newState) => {
        state.value = newState;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return {
    provides: computed(() => {
      var _a;
      const docId = toValue(documentId);
      return ((_a = provides.value) == null ? void 0 : _a.forDocument(docId)) ?? null;
    }),
    state
  };
}
function useCursor(documentId) {
  const { provides } = useInteractionManagerCapability();
  return {
    setCursor: (token, cursor, prio = 0) => {
      const providesValue = provides.value;
      if (!providesValue) return;
      const docId = toValue(documentId);
      const scope = providesValue.forDocument(docId);
      scope.setCursor(token, cursor, prio);
    },
    removeCursor: (token) => {
      const providesValue = provides.value;
      if (!providesValue) return;
      const docId = toValue(documentId);
      const scope = providesValue.forDocument(docId);
      scope.removeCursor(token);
    }
  };
}
function usePointerHandlers({ modeId, pageIndex, documentId }) {
  const { provides } = useInteractionManagerCapability();
  return {
    register: (handlers, options) => {
      const finalModeId = (options == null ? void 0 : options.modeId) ?? modeId;
      const finalPageIndex = toValue((options == null ? void 0 : options.pageIndex) ?? pageIndex);
      const finalDocumentId = toValue((options == null ? void 0 : options.documentId) ?? documentId);
      const providesValue = provides.value;
      return finalModeId ? providesValue == null ? void 0 : providesValue.registerHandlers({
        modeId: finalModeId,
        handlers,
        pageIndex: finalPageIndex,
        documentId: finalDocumentId
      }) : providesValue == null ? void 0 : providesValue.registerAlways({
        scope: finalPageIndex !== void 0 ? { type: "page", documentId: finalDocumentId, pageIndex: finalPageIndex } : { type: "global", documentId: finalDocumentId },
        handlers
      });
    }
  };
}
function useIsPageExclusive(documentId) {
  const { provides: cap } = useInteractionManagerCapability();
  const isPageExclusive = ref(false);
  watch(
    [cap, () => toValue(documentId)],
    ([capValue, docId], _, onCleanup) => {
      if (!capValue) {
        isPageExclusive.value = false;
        return;
      }
      const scope = capValue.forDocument(docId);
      const m = scope.getActiveInteractionMode();
      isPageExclusive.value = (m == null ? void 0 : m.scope) === "page" && !!m.exclusive;
      const unsubscribe = scope.onModeChange(() => {
        const mode = scope.getActiveInteractionMode();
        isPageExclusive.value = (mode == null ? void 0 : mode.scope) === "page" && !!(mode == null ? void 0 : mode.exclusive);
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return isPageExclusive;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "global-pointer-provider",
  props: {
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const divRef = ref(null);
    const { provides: cap } = useInteractionManagerCapability();
    watchEffect((onCleanup) => {
      if (cap.value && divRef.value) {
        const cleanup = createPointerProvider(
          cap.value,
          { type: "global", documentId: props.documentId },
          divRef.value
        );
        onCleanup(cleanup);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "divRef",
        ref: divRef,
        style: {
          width: "100%",
          height: "100%"
        }
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
const _hoisted_1 = {
  key: 0,
  style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "page-pointer-provider",
  props: {
    documentId: {},
    pageIndex: {},
    rotation: {},
    scale: {},
    convertEventToPoint: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const divRef = ref(null);
    const { provides: cap } = useInteractionManagerCapability();
    const isPageExclusive = useIsPageExclusive(() => props.documentId);
    const documentState = useDocumentState(() => props.documentId);
    const page = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = documentState.value) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[props.pageIndex];
    });
    const naturalPageSize = computed(() => {
      var _a;
      return ((_a = page.value) == null ? void 0 : _a.size) ?? { width: 0, height: 0 };
    });
    const pageRotation = computed(() => {
      var _a;
      return ((_a = page.value) == null ? void 0 : _a.rotation) ?? 0;
    });
    const rotation = computed(() => {
      var _a;
      if (props.rotation !== void 0) return props.rotation;
      const docRotation = ((_a = documentState.value) == null ? void 0 : _a.rotation) ?? 0;
      return (pageRotation.value + docRotation) % 4;
    });
    const scale = computed(() => {
      var _a;
      return props.scale ?? ((_a = documentState.value) == null ? void 0 : _a.scale) ?? 1;
    });
    const displaySize = computed(() => transformSize(naturalPageSize.value, 0, scale.value));
    const defaultConvertEventToPoint = computed(() => {
      return (event, element) => {
        const rect = element.getBoundingClientRect();
        const displayPoint = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        const rotatedNaturalSize = transformSize(
          {
            width: displaySize.value.width,
            height: displaySize.value.height
          },
          rotation.value,
          1
        );
        return restorePosition(rotatedNaturalSize, displayPoint, rotation.value, scale.value);
      };
    });
    watch(
      [
        cap,
        () => toValue(props.documentId),
        () => props.pageIndex,
        () => props.convertEventToPoint,
        defaultConvertEventToPoint
      ],
      ([capValue, docId, pageIdx, customConvert, defaultConvert], _, onCleanup) => {
        if (!capValue || !divRef.value) return;
        const cleanup = createPointerProvider(
          capValue,
          { type: "page", documentId: docId, pageIndex: pageIdx },
          divRef.value,
          customConvert || defaultConvert
        );
        onCleanup(cleanup);
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "divRef",
        ref: divRef,
        style: {
          position: "relative",
          width: displaySize.value.width + "px",
          height: displaySize.value.height + "px"
        }
      }, _ctx.$attrs), [
        renderSlot(_ctx.$slots, "default"),
        unref(isPageExclusive) ? (openBlock(), createElementBlock("div", _hoisted_1)) : createCommentVNode("", true)
      ], 16);
    };
  }
});
export {
  _sfc_main$1 as GlobalPointerProvider,
  _sfc_main as PagePointerProvider,
  useCursor,
  useInteractionManager,
  useInteractionManagerCapability,
  useInteractionManagerPlugin,
  useIsPageExclusive,
  usePointerHandlers
};
//# sourceMappingURL=index.js.map
