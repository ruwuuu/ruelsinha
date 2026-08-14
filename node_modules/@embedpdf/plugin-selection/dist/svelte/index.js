import { createPluginPackage } from "@embedpdf/core";
import { SelectionPlugin, SelectionPluginPackage as SelectionPluginPackage$1 } from "@embedpdf/plugin-selection";
export * from "@embedpdf/plugin-selection";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import "@embedpdf/models";
import { useCapability, usePlugin, useDocumentState } from "@embedpdf/core/svelte";
import { CounterRotate } from "@embedpdf/utils/svelte";
const useSelectionCapability = () => useCapability(SelectionPlugin.id);
const useSelectionPlugin = () => usePlugin(SelectionPlugin.id);
var root_2 = $.from_html(`<div></div>`);
var root_1$1 = $.from_html(`<div></div> <!>`, 1);
function TextSelection($$anchor, $$props) {
  $.push($$props, true);
  let background = $.prop($$props, "background", 3, "rgba(33,150,243)");
  const selectionPlugin = useSelectionPlugin();
  const documentState = useDocumentState(() => $$props.documentId);
  const page = $.derived(() => {
    var _a, _b, _c;
    return (_c = (_b = (_a = documentState.current) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[$$props.pageIndex];
  });
  let rects = $.state($.proxy([]));
  let boundingRect = $.state(null);
  let placement = $.state(null);
  const actualScale = $.derived(() => {
    var _a;
    return $$props.scale !== void 0 ? $$props.scale : ((_a = documentState.current) == null ? void 0 : _a.scale) ?? 1;
  });
  const actualRotation = $.derived(() => {
    var _a, _b;
    if ($$props.rotation !== void 0) return $$props.rotation;
    const pageRotation = ((_a = $.get(page)) == null ? void 0 : _a.rotation) ?? 0;
    const docRotation = ((_b = documentState.current) == null ? void 0 : _b.rotation) ?? 0;
    return (pageRotation + docRotation) % 4;
  });
  const shouldRenderMenu = $.derived(() => Boolean($.get(placement) && $.get(placement).pageIndex === $$props.pageIndex && $.get(placement).isVisible && ($$props.selectionMenu || $$props.selectionMenuSnippet)));
  $.user_effect(() => {
    if (!selectionPlugin.plugin || !$$props.documentId) {
      $.set(rects, [], true);
      $.set(boundingRect, null);
      return;
    }
    return selectionPlugin.plugin.registerSelectionOnPage({
      documentId: $$props.documentId,
      pageIndex: $$props.pageIndex,
      onRectsChange: ({ rects: newRects, boundingRect: newBoundingRect }) => {
        $.set(rects, newRects, true);
        $.set(boundingRect, newBoundingRect, true);
      }
    });
  });
  $.user_effect(() => {
    if (!selectionPlugin.plugin || !$$props.documentId) {
      $.set(placement, null);
      return;
    }
    return selectionPlugin.plugin.onMenuPlacement($$props.documentId, (newPlacement) => {
      $.set(placement, newPlacement, true);
    });
  });
  function buildContext() {
    return { type: "selection", pageIndex: $$props.pageIndex };
  }
  function buildMenuPlacement() {
    var _a, _b, _c;
    return {
      suggestTop: ((_a = $.get(placement)) == null ? void 0 : _a.suggestTop) ?? false,
      spaceAbove: ((_b = $.get(placement)) == null ? void 0 : _b.spaceAbove) ?? 0,
      spaceBelow: ((_c = $.get(placement)) == null ? void 0 : _c.spaceBelow) ?? 0
    };
  }
  function buildMenuProps(rect, menuWrapperProps) {
    return {
      context: buildContext(),
      selected: true,
      // Selection is always "selected" when visible
      rect,
      placement: buildMenuPlacement(),
      menuWrapperProps
    };
  }
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_4 = ($$anchor2) => {
      var fragment_1 = root_1$1();
      var div = $.first_child(fragment_1);
      let styles;
      $.each(div, 21, () => $.get(rects), $.index, ($$anchor3, rect) => {
        var div_1 = root_2();
        let styles_1;
        $.template_effect(() => styles_1 = $.set_style(div_1, "", styles_1, {
          position: "absolute",
          left: `${($.get(rect).origin.x - $.get(boundingRect).origin.x) * $.get(actualScale)}px`,
          top: `${($.get(rect).origin.y - $.get(boundingRect).origin.y) * $.get(actualScale)}px`,
          width: `${$.get(rect).size.width * $.get(actualScale)}px`,
          height: `${$.get(rect).size.height * $.get(actualScale)}px`,
          background: background(),
          "pointer-events": "none"
        }));
        $.append($$anchor3, div_1);
      });
      $.reset(div);
      var node_1 = $.sibling(div, 2);
      {
        var consequent_3 = ($$anchor3) => {
          {
            const children = ($$anchor4, $$arg0) => {
              let rect = () => $$arg0 == null ? void 0 : $$arg0().rect;
              let menuWrapperProps = () => $$arg0 == null ? void 0 : $$arg0().menuWrapperProps;
              const menuProps = $.derived(() => buildMenuProps(rect(), menuWrapperProps()));
              var fragment_3 = $.comment();
              var node_2 = $.first_child(fragment_3);
              {
                var consequent_1 = ($$anchor5) => {
                  const result = $.derived(() => $$props.selectionMenu($.get(menuProps)));
                  var fragment_4 = $.comment();
                  var node_3 = $.first_child(fragment_4);
                  {
                    var consequent = ($$anchor6) => {
                      var fragment_5 = $.comment();
                      var node_4 = $.first_child(fragment_5);
                      $.component(node_4, () => $.get(result).component, ($$anchor7, result_component) => {
                        result_component($$anchor7, $.spread_props(() => $.get(result).props));
                      });
                      $.append($$anchor6, fragment_5);
                    };
                    $.if(node_3, ($$render) => {
                      if ($.get(result)) $$render(consequent);
                    });
                  }
                  $.append($$anchor5, fragment_4);
                };
                var alternate = ($$anchor5) => {
                  var fragment_6 = $.comment();
                  var node_5 = $.first_child(fragment_6);
                  {
                    var consequent_2 = ($$anchor6) => {
                      var fragment_7 = $.comment();
                      var node_6 = $.first_child(fragment_7);
                      $.snippet(node_6, () => $$props.selectionMenuSnippet, () => $.get(menuProps));
                      $.append($$anchor6, fragment_7);
                    };
                    $.if(
                      node_5,
                      ($$render) => {
                        if ($$props.selectionMenuSnippet) $$render(consequent_2);
                      },
                      true
                    );
                  }
                  $.append($$anchor5, fragment_6);
                };
                $.if(node_2, ($$render) => {
                  if ($$props.selectionMenu) $$render(consequent_1);
                  else $$render(alternate, false);
                });
              }
              $.append($$anchor4, fragment_3);
            };
            let $0 = $.derived(() => ({
              origin: {
                x: $.get(placement).rect.origin.x * $.get(actualScale),
                y: $.get(placement).rect.origin.y * $.get(actualScale)
              },
              size: {
                width: $.get(placement).rect.size.width * $.get(actualScale),
                height: $.get(placement).rect.size.height * $.get(actualScale)
              }
            }));
            CounterRotate($$anchor3, {
              get rect() {
                return $.get($0);
              },
              get rotation() {
                return $.get(actualRotation);
              },
              children,
              $$slots: { default: true }
            });
          }
        };
        $.if(node_1, ($$render) => {
          if ($.get(shouldRenderMenu) && $.get(placement)) $$render(consequent_3);
        });
      }
      $.template_effect(() => styles = $.set_style(div, "", styles, {
        position: "absolute",
        left: `${$.get(boundingRect).origin.x * $.get(actualScale)}px`,
        top: `${$.get(boundingRect).origin.y * $.get(actualScale)}px`,
        width: `${$.get(boundingRect).size.width * $.get(actualScale)}px`,
        height: `${$.get(boundingRect).size.height * $.get(actualScale)}px`,
        "mix-blend-mode": "multiply",
        isolation: "isolate",
        "pointer-events": "none"
      }));
      $.append($$anchor2, fragment_1);
    };
    $.if(node, ($$render) => {
      if ($.get(boundingRect)) $$render(consequent_4);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root_1 = $.from_html(`<div></div>`);
function MarqueeSelection($$anchor, $$props) {
  $.push($$props, true);
  let borderStyle = $.prop($$props, "borderStyle", 3, "dashed");
  const selectionPlugin = useSelectionPlugin();
  const documentState = useDocumentState(() => $$props.documentId);
  const resolvedBorderColor = $.derived(() => $$props.borderColor ?? $$props.stroke ?? "rgba(0,122,204,0.8)");
  const resolvedBackground = $.derived(() => $$props.background ?? $$props.fill ?? "rgba(0,122,204,0.15)");
  let rect = $.state(null);
  const actualScale = $.derived(() => {
    var _a;
    return $$props.scale !== void 0 ? $$props.scale : ((_a = documentState.current) == null ? void 0 : _a.scale) ?? 1;
  });
  $.user_effect(() => {
    $.set(rect, null);
    if (!selectionPlugin.plugin) {
      return;
    }
    return selectionPlugin.plugin.registerMarqueeOnPage({
      documentId: $$props.documentId,
      pageIndex: $$props.pageIndex,
      scale: $.get(actualScale),
      onRectChange: (newRect) => {
        $.set(rect, newRect, true);
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
          border: `1px ${borderStyle()} ${$.get(resolvedBorderColor)}`,
          background: $.get(resolvedBackground),
          "box-sizing": "border-box",
          "z-index": "1000"
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
var root = $.from_html(`<!> <!>`, 1);
function SelectionLayer($$anchor, $$props) {
  $.push($$props, true);
  const resolvedTextBackground = $.derived(() => {
    var _a;
    return ((_a = $$props.textStyle) == null ? void 0 : _a.background) ?? $$props.background;
  });
  var fragment = root();
  var node = $.first_child(fragment);
  TextSelection(node, {
    get documentId() {
      return $$props.documentId;
    },
    get pageIndex() {
      return $$props.pageIndex;
    },
    get scale() {
      return $$props.scale;
    },
    get rotation() {
      return $$props.rotation;
    },
    get background() {
      return $.get(resolvedTextBackground);
    },
    get selectionMenu() {
      return $$props.selectionMenu;
    },
    get selectionMenuSnippet() {
      return $$props.selectionMenuSnippet;
    }
  });
  var node_1 = $.sibling(node, 2);
  {
    let $0 = $.derived(() => {
      var _a;
      return (_a = $$props.marqueeStyle) == null ? void 0 : _a.background;
    });
    let $1 = $.derived(() => {
      var _a;
      return (_a = $$props.marqueeStyle) == null ? void 0 : _a.borderColor;
    });
    let $2 = $.derived(() => {
      var _a;
      return (_a = $$props.marqueeStyle) == null ? void 0 : _a.borderStyle;
    });
    MarqueeSelection(node_1, {
      get documentId() {
        return $$props.documentId;
      },
      get pageIndex() {
        return $$props.pageIndex;
      },
      get scale() {
        return $$props.scale;
      },
      get background() {
        return $.get($0);
      },
      get borderColor() {
        return $.get($1);
      },
      get borderStyle() {
        return $.get($2);
      },
      get class() {
        return $$props.marqueeClass;
      }
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function CopyToClipboard($$anchor, $$props) {
  $.push($$props, true);
  const selectionCapability = useSelectionCapability();
  $.user_effect(() => {
    if (!selectionCapability.provides) return;
    return selectionCapability.provides.onCopyToClipboard(({ text }) => {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Failed to copy text to clipboard:", err);
      });
    });
  });
  $.pop();
}
const SelectionPluginPackage = createPluginPackage(SelectionPluginPackage$1).addUtility(CopyToClipboard).build();
export {
  CopyToClipboard,
  MarqueeSelection,
  SelectionLayer,
  SelectionPluginPackage,
  TextSelection,
  useSelectionCapability,
  useSelectionPlugin
};
//# sourceMappingURL=index.js.map
