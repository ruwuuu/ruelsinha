import * as $ from "svelte/internal/client";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/svelte";
import { CapturePlugin, initialDocumentState } from "@embedpdf/plugin-capture";
export * from "@embedpdf/plugin-capture";
import "svelte/internal/disclose-version";
const useCaptureCapability = () => useCapability(CapturePlugin.id);
const useCapturePlugin = () => usePlugin(CapturePlugin.id);
const useCapture = (getDocumentId) => {
  const capability = useCaptureCapability();
  let state = $.state($.proxy(initialDocumentState));
  const documentId = $.derived(getDocumentId);
  const scopedProvides = $.derived(() => capability.provides && $.get(documentId) ? capability.provides.forDocument($.get(documentId)) : null);
  $.user_effect(() => {
    const provides = capability.provides;
    const docId = $.get(documentId);
    if (!provides || !docId) {
      $.set(state, initialDocumentState, true);
      return;
    }
    const scope = provides.forDocument(docId);
    $.set(state, scope.getState(), true);
    return scope.onStateChange((newState) => {
      $.set(state, newState, true);
    });
  });
  return {
    get provides() {
      return $.get(scopedProvides);
    },
    get state() {
      return $.get(state);
    }
  };
};
var root_1 = $.from_html(`<div></div>`);
function MarqueeCapture($$anchor, $$props) {
  $.push($$props, true);
  let stroke = $.prop($$props, "stroke", 3, "rgba(33,150,243,0.8)"), fill = $.prop($$props, "fill", 3, "rgba(33,150,243,0.15)");
  const captureCapability = useCaptureCapability();
  const documentState = useDocumentState(() => $$props.documentId);
  let rect = $.state(null);
  const actualScale = $.derived(() => {
    var _a;
    return $$props.scale !== void 0 ? $$props.scale : ((_a = documentState.current) == null ? void 0 : _a.scale) ?? 1;
  });
  $.user_effect(() => {
    $.set(rect, null);
    if (!captureCapability.provides) {
      return;
    }
    return captureCapability.provides.registerMarqueeOnPage({
      documentId: $$props.documentId,
      pageIndex: $$props.pageIndex,
      scale: $.get(actualScale),
      callback: {
        onPreview: (newRect) => {
          $.set(rect, newRect, true);
        }
      }
    });
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1();
      let styles;
      $.template_effect(() => {
        $.set_class(div, 1, $.clsx($$props.class));
        styles = $.set_style(div, "", styles, {
          position: "absolute",
          "pointer-events": "none",
          left: `${$.get(rect).origin.x * $.get(actualScale)}px`,
          top: `${$.get(rect).origin.y * $.get(actualScale)}px`,
          width: `${$.get(rect).size.width * $.get(actualScale)}px`,
          height: `${$.get(rect).size.height * $.get(actualScale)}px`,
          border: `1px solid ${stroke()}`,
          background: fill(),
          "box-sizing": "border-box"
        });
      });
      $.append($$anchor2, div);
    };
    $.if(node, ($$render) => {
      if ($.get(rect)) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
export {
  MarqueeCapture,
  useCapture,
  useCaptureCapability,
  useCapturePlugin
};
//# sourceMappingURL=index.js.map
