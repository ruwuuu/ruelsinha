import { createPluginPackage } from "@embedpdf/core";
import { PanPlugin, initialDocumentState, PanPluginPackage as PanPluginPackage$1 } from "@embedpdf/plugin-pan";
export * from "@embedpdf/plugin-pan";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { useCapability, usePlugin } from "@embedpdf/core/svelte";
const usePanPlugin = () => usePlugin(PanPlugin.id);
const usePanCapability = () => useCapability(PanPlugin.id);
const usePan = (getDocumentId) => {
  const capability = usePanCapability();
  let isPanning = $.state($.proxy(initialDocumentState.isPanMode));
  const documentId = $.derived(getDocumentId);
  const scopedProvides = $.derived(() => capability.provides && $.get(documentId) ? capability.provides.forDocument($.get(documentId)) : null);
  $.user_effect(() => {
    const provides = capability.provides;
    const docId = $.get(documentId);
    if (!provides || !docId) {
      $.set(isPanning, initialDocumentState.isPanMode, true);
      return;
    }
    const scope = provides.forDocument(docId);
    $.set(isPanning, scope.isPanMode(), true);
    return scope.onPanModeChange((isPan) => {
      $.set(isPanning, isPan, true);
    });
  });
  return {
    get provides() {
      return $.get(scopedProvides);
    },
    get isPanning() {
      return $.get(isPanning);
    }
  };
};
function PanMode($$anchor, $$props) {
  $.push($$props, true);
  const { provides: pan } = usePanCapability();
  const { plugin: panPlugin } = usePanPlugin();
  $.user_effect(() => {
    var _a;
    if (!pan || !panPlugin) return;
    const mode = ((_a = panPlugin.config) == null ? void 0 : _a.defaultMode) ?? "never";
    const SUPPORT_TOUCH = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (mode === "mobile" && SUPPORT_TOUCH) {
      pan.makePanDefault();
    }
  });
  $.pop();
}
const PanPluginPackage = createPluginPackage(PanPluginPackage$1).addUtility(PanMode).build();
export {
  PanMode,
  PanPluginPackage,
  usePan,
  usePanCapability,
  usePanPlugin
};
//# sourceMappingURL=index.js.map
