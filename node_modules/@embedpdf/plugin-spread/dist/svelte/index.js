import * as $ from "svelte/internal/client";
import { usePlugin, useCapability } from "@embedpdf/core/svelte";
import { SpreadPlugin, initialDocumentState } from "@embedpdf/plugin-spread";
export * from "@embedpdf/plugin-spread";
const useSpreadPlugin = () => usePlugin(SpreadPlugin.id);
const useSpreadCapability = () => useCapability(SpreadPlugin.id);
const useSpread = (getDocumentId) => {
  const capability = useSpreadCapability();
  let spreadMode = $.state($.proxy(initialDocumentState.spreadMode));
  const documentId = $.derived(getDocumentId);
  const scopedProvides = $.derived(() => capability.provides && $.get(documentId) ? capability.provides.forDocument($.get(documentId)) : null);
  $.user_effect(() => {
    const provides = capability.provides;
    const docId = $.get(documentId);
    if (!provides || !docId) {
      $.set(spreadMode, initialDocumentState.spreadMode, true);
      return;
    }
    const scope = provides.forDocument(docId);
    $.set(spreadMode, scope.getSpreadMode(), true);
    return scope.onSpreadChange((newSpreadMode) => {
      $.set(spreadMode, newSpreadMode, true);
    });
  });
  return {
    get provides() {
      return $.get(scopedProvides);
    },
    get spreadMode() {
      return $.get(spreadMode);
    }
  };
};
export {
  useSpread,
  useSpreadCapability,
  useSpreadPlugin
};
//# sourceMappingURL=index.js.map
