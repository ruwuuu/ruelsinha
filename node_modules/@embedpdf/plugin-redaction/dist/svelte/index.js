import { createPluginPackage } from "@embedpdf/core";
import { RedactionPlugin, initialDocumentState, RedactionPluginPackage as RedactionPluginPackage$1 } from "@embedpdf/plugin-redaction";
export * from "@embedpdf/plugin-redaction";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { onMount } from "svelte";
import { createRenderer, getRendererRegistry } from "@embedpdf/plugin-annotation/svelte";
import { PdfStandardFont, standardFontCssProperties, PdfTextAlignment, textAlignmentToCss, PdfAnnotationSubtype, Rotation } from "@embedpdf/models";
import { usePlugin, useCapability, useDocumentState } from "@embedpdf/core/svelte";
import { CounterRotate } from "@embedpdf/utils/svelte";
var root_2 = $.from_html(`<span> </span>`);
var root_1$5 = $.from_html(`<div role="button" tabindex="0"><!></div>`);
var root$2 = $.from_html(`<div role="group"></div>`);
function RedactHighlight($$anchor, $$props) {
  $.push($$props, true);
  let isHovered = $.state(false);
  const object = $.derived(() => $$props.annotation.object);
  const segmentRects = $.derived(() => $.get(object).segmentRects ?? []);
  const rect = $.derived(() => $.get(object).rect);
  const strokeColor = $.derived(() => $.get(object).strokeColor ?? "#FF0000");
  const color = $.derived(() => $.get(object).color ?? "#000000");
  const opacity = $.derived(() => $.get(object).opacity ?? 1);
  const textColor = $.derived(() => $.get(object).fontColor ?? $.get(object).overlayColor ?? "#FFFFFF");
  const overlayText = $.derived(() => $.get(object).overlayText);
  const overlayTextRepeat = $.derived(() => $.get(object).overlayTextRepeat ?? false);
  const fontSize = $.derived(() => $.get(object).fontSize ?? 12);
  const fontFamily = $.derived(() => $.get(object).fontFamily ?? PdfStandardFont.Helvetica);
  const fontCss = $.derived(() => standardFontCssProperties($.get(fontFamily)));
  const textAlign = $.derived(() => $.get(object).textAlign ?? PdfTextAlignment.Center);
  function renderOverlayText() {
    if (!$.get(overlayText)) return null;
    if (!$.get(overlayTextRepeat)) return $.get(overlayText);
    const reps = 10;
    return Array(reps).fill($.get(overlayText)).join(" ");
  }
  const justifyContent = $.derived(() => $.get(textAlign) === PdfTextAlignment.Left ? "flex-start" : $.get(textAlign) === PdfTextAlignment.Right ? "flex-end" : "center");
  var div = root$2();
  $.set_style(div, "", {}, { position: "absolute", inset: "0" });
  $.each(div, 21, () => $.get(segmentRects), $.index, ($$anchor2, b) => {
    const left = $.derived(() => ($.get(rect) ? $.get(b).origin.x - $.get(rect).origin.x : $.get(b).origin.x) * $$props.scale);
    const top = $.derived(() => ($.get(rect) ? $.get(b).origin.y - $.get(rect).origin.y : $.get(b).origin.y) * $$props.scale);
    const width = $.derived(() => $.get(b).size.width * $$props.scale);
    const height = $.derived(() => $.get(b).size.height * $$props.scale);
    const scaledFontSize = $.derived(() => Math.min($.get(fontSize) * $$props.scale, $.get(height) * 0.8));
    var div_1 = root_1$5();
    div_1.__pointerdown = function(...$$args) {
      var _a;
      (_a = $$props.onClick) == null ? void 0 : _a.apply(this, $$args);
    };
    let styles;
    var node = $.child(div_1);
    {
      var consequent = ($$anchor3) => {
        var span = root_2();
        let styles_1;
        var text = $.child(span, true);
        $.reset(span);
        $.template_effect(
          ($0, $1) => {
            styles_1 = $.set_style(span, "", styles_1, $0);
            $.set_text(text, $1);
          },
          [
            () => ({
              color: $.get(textColor),
              "font-size": `${$.get(scaledFontSize) ?? ""}px`,
              "font-family": $.get(fontCss).fontFamily,
              "font-weight": $.get(fontCss).fontWeight,
              "font-style": $.get(fontCss).fontStyle,
              "text-align": textAlignmentToCss($.get(textAlign)),
              "white-space": $.get(overlayTextRepeat) ? "normal" : "nowrap",
              overflow: "hidden",
              "text-overflow": "ellipsis",
              "line-height": "1"
            }),
            renderOverlayText
          ]
        );
        $.append($$anchor3, span);
      };
      $.if(node, ($$render) => {
        if ($.get(isHovered) && $.get(overlayText)) $$render(consequent);
      });
    }
    $.reset(div_1);
    $.template_effect(() => styles = $.set_style(div_1, "", styles, {
      position: "absolute",
      left: `${$.get(left) ?? ""}px`,
      top: `${$.get(top) ?? ""}px`,
      width: `${$.get(width) ?? ""}px`,
      height: `${$.get(height) ?? ""}px`,
      background: $.get(isHovered) ? $.get(color) : "transparent",
      border: !$.get(isHovered) ? `2px solid ${$.get(strokeColor)}` : "none",
      opacity: $.get(isHovered) ? $.get(opacity) : 1,
      "box-sizing": "border-box",
      "pointer-events": "auto",
      cursor: "pointer",
      display: "flex",
      "align-items": "center",
      "justify-content": $.get(justifyContent),
      overflow: "hidden"
    }));
    $.append($$anchor2, div_1);
  });
  $.reset(div);
  $.event("mouseenter", div, () => $.set(isHovered, true));
  $.event("mouseleave", div, () => $.set(isHovered, false));
  $.append($$anchor, div);
  $.pop();
}
$.delegate(["pointerdown"]);
var root_1$4 = $.from_html(`<span> </span>`);
var root$1 = $.from_html(`<div role="button" tabindex="0"><!></div>`);
function RedactArea($$anchor, $$props) {
  $.push($$props, true);
  let isHovered = $.state(false);
  const object = $.derived(() => $$props.annotation.object);
  const strokeColor = $.derived(() => $.get(object).strokeColor ?? "#FF0000");
  const color = $.derived(() => $.get(object).color ?? "#000000");
  const opacity = $.derived(() => $.get(object).opacity ?? 1);
  const textColor = $.derived(() => $.get(object).fontColor ?? $.get(object).overlayColor ?? "#FFFFFF");
  const overlayText = $.derived(() => $.get(object).overlayText);
  const overlayTextRepeat = $.derived(() => $.get(object).overlayTextRepeat ?? false);
  const fontSize = $.derived(() => $.get(object).fontSize ?? 12);
  const fontFamily = $.derived(() => $.get(object).fontFamily ?? PdfStandardFont.Helvetica);
  const fontCss = $.derived(() => standardFontCssProperties($.get(fontFamily)));
  const textAlign = $.derived(() => $.get(object).textAlign ?? PdfTextAlignment.Center);
  function renderOverlayText() {
    if (!$.get(overlayText)) return null;
    if (!$.get(overlayTextRepeat)) return $.get(overlayText);
    const reps = 10;
    return Array(reps).fill($.get(overlayText)).join(" ");
  }
  const justifyContent = $.derived(() => $.get(textAlign) === PdfTextAlignment.Left ? "flex-start" : $.get(textAlign) === PdfTextAlignment.Right ? "flex-end" : "center");
  var div = root$1();
  div.__pointerdown = (e) => {
    var _a;
    if (!$$props.isSelected) (_a = $$props.onClick) == null ? void 0 : _a.call($$props, e);
  };
  let styles;
  var node = $.child(div);
  {
    var consequent = ($$anchor2) => {
      var span = root_1$4();
      let styles_1;
      var text = $.child(span, true);
      $.reset(span);
      $.template_effect(
        ($0, $1) => {
          styles_1 = $.set_style(span, "", styles_1, $0);
          $.set_text(text, $1);
        },
        [
          () => ({
            color: $.get(textColor),
            "font-size": `${$.get(fontSize) * $$props.scale}px`,
            "font-family": $.get(fontCss).fontFamily,
            "font-weight": $.get(fontCss).fontWeight,
            "font-style": $.get(fontCss).fontStyle,
            "text-align": textAlignmentToCss($.get(textAlign)),
            "white-space": $.get(overlayTextRepeat) ? "normal" : "nowrap",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            padding: "4px"
          }),
          renderOverlayText
        ]
      );
      $.append($$anchor2, span);
    };
    $.if(node, ($$render) => {
      if ($.get(isHovered) && $.get(overlayText)) $$render(consequent);
    });
  }
  $.reset(div);
  $.template_effect(() => styles = $.set_style(div, "", styles, {
    position: "absolute",
    inset: "0",
    background: $.get(isHovered) ? $.get(color) : "transparent",
    border: !$.get(isHovered) ? `2px solid ${$.get(strokeColor)}` : "none",
    opacity: $.get(isHovered) ? $.get(opacity) : 1,
    "box-sizing": "border-box",
    "pointer-events": "auto",
    cursor: $$props.isSelected ? "move" : "pointer",
    display: "flex",
    "align-items": "center",
    "justify-content": $.get(justifyContent),
    overflow: "hidden"
  }));
  $.event("mouseenter", div, () => $.set(isHovered, true));
  $.event("mouseleave", div, () => $.set(isHovered, false));
  $.append($$anchor, div);
  $.pop();
}
$.delegate(["pointerdown"]);
const redactRenderers = [
  createRenderer({
    id: "redactHighlight",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && "segmentRects" in a && (((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0) > 0;
    },
    component: RedactHighlight,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  }),
  createRenderer({
    id: "redactArea",
    matches: (a) => {
      var _a;
      return a.type === PdfAnnotationSubtype.REDACT && (!("segmentRects" in a) || !(((_a = a.segmentRects) == null ? void 0 : _a.length) ?? 0));
    },
    component: RedactArea,
    interactionDefaults: { isDraggable: false, isResizable: false, isRotatable: false },
    useAppearanceStream: false
  })
];
function RedactRendererRegistration($$anchor, $$props) {
  $.push($$props, true);
  const registry = getRendererRegistry();
  onMount(() => {
    if (!registry) return;
    return registry.register(redactRenderers);
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = $.comment();
      var node_1 = $.first_child(fragment_1);
      $.snippet(node_1, () => $$props.children);
      $.append($$anchor2, fragment_1);
    };
    $.if(node, ($$render) => {
      if ($$props.children) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
const useRedactionPlugin = () => usePlugin(RedactionPlugin.id);
const useRedactionCapability = () => useCapability(RedactionPlugin.id);
const useRedaction = (getDocumentId) => {
  const capability = useRedactionCapability();
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
    try {
      $.set(state, scope.getState(), true);
    } catch (e) {
      $.set(state, initialDocumentState, true);
    }
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
var root_1$3 = $.from_html(`<div></div>`);
function Highlight($$anchor, $$props) {
  let color = $.prop($$props, "color", 3, "#FFFF00"), opacity = $.prop($$props, "opacity", 3, 1), border = $.prop($$props, "border", 3, "1px solid red"), style = $.prop($$props, "style", 3, "");
  const boundingRect = $.derived(() => $$props.rect);
  var fragment = $.comment();
  var node = $.first_child(fragment);
  $.each(node, 17, () => $$props.rects, $.index, ($$anchor2, b) => {
    var div = root_1$3();
    div.__pointerdown = function(...$$args) {
      var _a;
      (_a = $$props.onClick) == null ? void 0 : _a.apply(this, $$args);
    };
    let styles;
    $.template_effect(() => styles = $.set_style(div, style(), styles, {
      position: "absolute",
      border: border(),
      left: `${($.get(boundingRect) ? $.get(b).origin.x - $.get(boundingRect).origin.x : $.get(b).origin.x) * $$props.scale}px`,
      top: `${($.get(boundingRect) ? $.get(b).origin.y - $.get(boundingRect).origin.y : $.get(b).origin.y) * $$props.scale}px`,
      width: `${$.get(b).size.width * $$props.scale}px`,
      height: `${$.get(b).size.height * $$props.scale}px`,
      background: color(),
      opacity: opacity(),
      "pointer-events": $$props.onClick ? "auto" : "none",
      cursor: $$props.onClick ? "pointer" : "default",
      "z-index": $$props.onClick ? "1" : void 0
    }));
    $.append($$anchor2, div);
  });
  $.append($$anchor, fragment);
}
$.delegate(["pointerdown"]);
var root_1$2 = $.from_html(`<div></div>`);
function Marquee_redact($$anchor, $$props) {
  $.push($$props, true);
  let className = $.prop($$props, "className", 3, ""), fill = $.prop($$props, "fill", 3, "transparent");
  const redactionPlugin = useRedactionPlugin();
  const documentState = useDocumentState(() => $$props.documentId);
  let rect = $.state(null);
  const actualScale = $.derived(() => {
    var _a;
    return $$props.scale !== void 0 ? $$props.scale : ((_a = documentState.current) == null ? void 0 : _a.scale) ?? 1;
  });
  const strokeColor = $.derived(() => {
    var _a;
    return $$props.stroke ?? ((_a = redactionPlugin.plugin) == null ? void 0 : _a.getPreviewStrokeColor()) ?? "red";
  });
  $.user_effect(() => {
    if (!redactionPlugin.plugin || !$$props.documentId) {
      $.set(rect, null);
      return;
    }
    return redactionPlugin.plugin.onRedactionMarqueeChange($$props.documentId, (data) => {
      $.set(rect, data.pageIndex === $$props.pageIndex ? data.rect : null, true);
    });
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$2();
      let styles;
      $.template_effect(() => {
        $.set_class(div, 1, $.clsx(className()));
        styles = $.set_style(div, "", styles, {
          position: "absolute",
          "pointer-events": "none",
          left: `${$.get(rect).origin.x * $.get(actualScale)}px`,
          top: `${$.get(rect).origin.y * $.get(actualScale)}px`,
          width: `${$.get(rect).size.width * $.get(actualScale)}px`,
          height: `${$.get(rect).size.height * $.get(actualScale)}px`,
          border: `1px solid ${$.get(strokeColor)}`,
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
var root_3 = $.from_html(`<div></div> <!>`, 1);
var root_10 = $.from_html(`<div><!></div> <!>`, 1);
var root_1$1 = $.from_html(`<div style="position: absolute; inset: 0; pointer-events: none;"></div>`);
function Pending_redactions($$anchor, $$props) {
  $.push($$props, true);
  let rotation = $.prop($$props, "rotation", 19, () => Rotation.Degree0), bboxStroke = $.prop($$props, "bboxStroke", 3, "rgba(0,0,0,0.8)");
  const redactionCapability = useRedactionCapability();
  let items = $.state($.proxy([]));
  let selectedId = $.state(null);
  $.user_effect(() => {
    var _a;
    const redactionValue = redactionCapability.provides;
    if (!redactionValue) {
      $.set(items, [], true);
      $.set(selectedId, null);
      return;
    }
    const scoped = redactionValue.forDocument($$props.documentId);
    const currentState = scoped.getState();
    $.set(items, (currentState.pending[$$props.pageIndex] ?? []).filter((it) => it.source === "legacy"), true);
    $.set(selectedId, ((_a = currentState.selected) == null ? void 0 : _a.page) === $$props.pageIndex ? currentState.selected.id : null, true);
    const off1 = scoped.onPendingChange((map) => {
      $.set(items, (map[$$props.pageIndex] ?? []).filter((it) => it.source === "legacy"), true);
    });
    const off2 = scoped.onSelectedChange((sel) => {
      $.set(selectedId, (sel == null ? void 0 : sel.page) === $$props.pageIndex ? sel.id : null, true);
    });
    return () => {
      off1 == null ? void 0 : off1();
      off2 == null ? void 0 : off2();
    };
  });
  function select(e, id) {
    e.stopPropagation();
    if (!redactionCapability.provides) return;
    redactionCapability.provides.forDocument($$props.documentId).selectPending($$props.pageIndex, id);
  }
  function shouldShowMenu(itemId) {
    const isSelected = $.get(selectedId) === itemId;
    return isSelected && (!!$$props.selectionMenu || !!$$props.selectionMenuSnippet);
  }
  function buildContext(item) {
    return { type: "redaction", item, pageIndex: $$props.pageIndex };
  }
  const menuPlacement = { suggestTop: false, spaceAbove: 0, spaceBelow: 0 };
  function buildMenuProps(item, rect, menuWrapperProps) {
    return {
      context: buildContext(item),
      selected: $.get(selectedId) === item.id,
      rect,
      placement: menuPlacement,
      menuWrapperProps
    };
  }
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_9 = ($$anchor2) => {
      var div = root_1$1();
      $.each(div, 21, () => $.get(items), (item) => item.id, ($$anchor3, item) => {
        var fragment_1 = $.comment();
        var node_1 = $.first_child(fragment_1);
        {
          var consequent_4 = ($$anchor4) => {
            var fragment_2 = root_3();
            var div_1 = $.first_child(fragment_2);
            div_1.__pointerdown = (e) => select(e, $.get(item).id);
            var node_2 = $.sibling(div_1, 2);
            {
              var consequent_3 = ($$anchor5) => {
                {
                  const children = ($$anchor6, $$arg0) => {
                    let rect = () => $$arg0 == null ? void 0 : $$arg0().rect;
                    let menuWrapperProps = () => $$arg0 == null ? void 0 : $$arg0().menuWrapperProps;
                    const menuProps = $.derived(() => buildMenuProps($.get(item), rect(), menuWrapperProps()));
                    var fragment_4 = $.comment();
                    var node_3 = $.first_child(fragment_4);
                    {
                      var consequent_1 = ($$anchor7) => {
                        const result = $.derived(() => $$props.selectionMenu($.get(menuProps)));
                        var fragment_5 = $.comment();
                        var node_4 = $.first_child(fragment_5);
                        {
                          var consequent = ($$anchor8) => {
                            var fragment_6 = $.comment();
                            var node_5 = $.first_child(fragment_6);
                            $.component(node_5, () => $.get(result).component, ($$anchor9, result_component) => {
                              result_component($$anchor9, $.spread_props(() => $.get(result).props));
                            });
                            $.append($$anchor8, fragment_6);
                          };
                          $.if(node_4, ($$render) => {
                            if ($.get(result)) $$render(consequent);
                          });
                        }
                        $.append($$anchor7, fragment_5);
                      };
                      var alternate = ($$anchor7) => {
                        var fragment_7 = $.comment();
                        var node_6 = $.first_child(fragment_7);
                        {
                          var consequent_2 = ($$anchor8) => {
                            var fragment_8 = $.comment();
                            var node_7 = $.first_child(fragment_8);
                            $.snippet(node_7, () => $$props.selectionMenuSnippet, () => $.get(menuProps));
                            $.append($$anchor8, fragment_8);
                          };
                          $.if(
                            node_6,
                            ($$render) => {
                              if ($$props.selectionMenuSnippet) $$render(consequent_2);
                            },
                            true
                          );
                        }
                        $.append($$anchor7, fragment_7);
                      };
                      $.if(node_3, ($$render) => {
                        if ($$props.selectionMenu) $$render(consequent_1);
                        else $$render(alternate, false);
                      });
                    }
                    $.append($$anchor6, fragment_4);
                  };
                  let $0 = $.derived(() => ({
                    origin: {
                      x: $.get(item).rect.origin.x * $$props.scale,
                      y: $.get(item).rect.origin.y * $$props.scale
                    },
                    size: {
                      width: $.get(item).rect.size.width * $$props.scale,
                      height: $.get(item).rect.size.height * $$props.scale
                    }
                  }));
                  CounterRotate($$anchor5, {
                    get rect() {
                      return $.get($0);
                    },
                    get rotation() {
                      return rotation();
                    },
                    children,
                    $$slots: { default: true }
                  });
                }
              };
              $.if(node_2, ($$render) => {
                if (shouldShowMenu($.get(item).id)) $$render(consequent_3);
              });
            }
            $.template_effect(() => $.set_style(div_1, `
            position: absolute;
            left: ${$.get(item).rect.origin.x * $$props.scale}px;
            top: ${$.get(item).rect.origin.y * $$props.scale}px;
            width: ${$.get(item).rect.size.width * $$props.scale}px;
            height: ${$.get(item).rect.size.height * $$props.scale}px;
            background: transparent;
            outline: ${$.get(selectedId) === $.get(item).id ? `1px solid ${bboxStroke()}` : "none"};
            outline-offset: 2px;
            border: 1px solid red;
            pointer-events: auto;
            cursor: pointer;
          `));
            $.append($$anchor4, fragment_2);
          };
          var alternate_2 = ($$anchor4) => {
            var fragment_9 = root_10();
            var div_2 = $.first_child(fragment_9);
            var node_8 = $.child(div_2);
            Highlight(node_8, {
              get rect() {
                return $.get(item).rect;
              },
              get rects() {
                return $.get(item).rects;
              },
              color: "transparent",
              border: "1px solid red",
              get scale() {
                return $$props.scale;
              },
              onClick: (e) => select(e, $.get(item).id)
            });
            $.reset(div_2);
            var node_9 = $.sibling(div_2, 2);
            {
              var consequent_8 = ($$anchor5) => {
                {
                  const children = ($$anchor6, $$arg0) => {
                    let rect = () => $$arg0 == null ? void 0 : $$arg0().rect;
                    let menuWrapperProps = () => $$arg0 == null ? void 0 : $$arg0().menuWrapperProps;
                    const menuProps = $.derived(() => buildMenuProps($.get(item), rect(), menuWrapperProps()));
                    var fragment_11 = $.comment();
                    var node_10 = $.first_child(fragment_11);
                    {
                      var consequent_6 = ($$anchor7) => {
                        const result = $.derived(() => $$props.selectionMenu($.get(menuProps)));
                        var fragment_12 = $.comment();
                        var node_11 = $.first_child(fragment_12);
                        {
                          var consequent_5 = ($$anchor8) => {
                            var fragment_13 = $.comment();
                            var node_12 = $.first_child(fragment_13);
                            $.component(node_12, () => $.get(result).component, ($$anchor9, result_component_1) => {
                              result_component_1($$anchor9, $.spread_props(() => $.get(result).props));
                            });
                            $.append($$anchor8, fragment_13);
                          };
                          $.if(node_11, ($$render) => {
                            if ($.get(result)) $$render(consequent_5);
                          });
                        }
                        $.append($$anchor7, fragment_12);
                      };
                      var alternate_1 = ($$anchor7) => {
                        var fragment_14 = $.comment();
                        var node_13 = $.first_child(fragment_14);
                        {
                          var consequent_7 = ($$anchor8) => {
                            var fragment_15 = $.comment();
                            var node_14 = $.first_child(fragment_15);
                            $.snippet(node_14, () => $$props.selectionMenuSnippet, () => $.get(menuProps));
                            $.append($$anchor8, fragment_15);
                          };
                          $.if(
                            node_13,
                            ($$render) => {
                              if ($$props.selectionMenuSnippet) $$render(consequent_7);
                            },
                            true
                          );
                        }
                        $.append($$anchor7, fragment_14);
                      };
                      $.if(node_10, ($$render) => {
                        if ($$props.selectionMenu) $$render(consequent_6);
                        else $$render(alternate_1, false);
                      });
                    }
                    $.append($$anchor6, fragment_11);
                  };
                  let $0 = $.derived(() => ({
                    origin: {
                      x: $.get(item).rect.origin.x * $$props.scale,
                      y: $.get(item).rect.origin.y * $$props.scale
                    },
                    size: {
                      width: $.get(item).rect.size.width * $$props.scale,
                      height: $.get(item).rect.size.height * $$props.scale
                    }
                  }));
                  CounterRotate($$anchor5, {
                    get rect() {
                      return $.get($0);
                    },
                    get rotation() {
                      return rotation();
                    },
                    children,
                    $$slots: { default: true }
                  });
                }
              };
              $.if(node_9, ($$render) => {
                if (shouldShowMenu($.get(item).id)) $$render(consequent_8);
              });
            }
            $.template_effect(() => $.set_style(div_2, `
            position: absolute;
            left: ${$.get(item).rect.origin.x * $$props.scale}px;
            top: ${$.get(item).rect.origin.y * $$props.scale}px;
            width: ${$.get(item).rect.size.width * $$props.scale}px;
            height: ${$.get(item).rect.size.height * $$props.scale}px;
            background: transparent;
            outline: ${$.get(selectedId) === $.get(item).id ? `1px solid ${bboxStroke()}` : "none"};
            outline-offset: 2px;
            pointer-events: auto;
            cursor: ${$.get(selectedId) === $.get(item).id ? "pointer" : "default"};
          `));
            $.append($$anchor4, fragment_9);
          };
          $.if(node_1, ($$render) => {
            if ($.get(item).kind === "area") $$render(consequent_4);
            else $$render(alternate_2, false);
          });
        }
        $.append($$anchor3, fragment_1);
      });
      $.reset(div);
      $.append($$anchor2, div);
    };
    $.if(node, ($$render) => {
      if ($.get(items).length) $$render(consequent_9);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["pointerdown"]);
var root_1 = $.from_html(`<div><!></div>`);
function Selection_redact($$anchor, $$props) {
  $.push($$props, true);
  const redactionPlugin = useRedactionPlugin();
  let rects = $.state($.proxy([]));
  let boundingRect = $.state(null);
  const strokeColor = $.derived(() => {
    var _a;
    return ((_a = redactionPlugin.plugin) == null ? void 0 : _a.getPreviewStrokeColor()) ?? "red";
  });
  $.user_effect(() => {
    if (!redactionPlugin.plugin) {
      $.set(rects, [], true);
      $.set(boundingRect, null);
      return;
    }
    return redactionPlugin.plugin.onRedactionSelectionChange($$props.documentId, (formattedSelection) => {
      const selection = formattedSelection.find((s) => s.pageIndex === $$props.pageIndex);
      $.set(rects, (selection == null ? void 0 : selection.segmentRects) ?? [], true);
      $.set(boundingRect, (selection == null ? void 0 : selection.rect) ?? null, true);
    });
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1();
      $.set_style(div, "", {}, {
        "mix-blend-mode": "normal",
        "pointer-events": "none",
        position: "absolute",
        inset: "0"
      });
      var node_1 = $.child(div);
      {
        let $0 = $.derived(() => `1px solid ${$.get(strokeColor)}`);
        Highlight(node_1, {
          color: "transparent",
          opacity: 1,
          get rects() {
            return $.get(rects);
          },
          get scale() {
            return $$props.scale;
          },
          get border() {
            return $.get($0);
          }
        });
      }
      $.reset(div);
      $.append($$anchor2, div);
    };
    $.if(node, ($$render) => {
      if ($.get(boundingRect)) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root = $.from_html(`<!> <!> <!>`, 1);
function Redaction_layer($$anchor, $$props) {
  $.push($$props, true);
  const documentState = useDocumentState(() => $$props.documentId);
  const page = $.derived(() => {
    var _a, _b, _c;
    return (_c = (_b = (_a = documentState.current) == null ? void 0 : _a.document) == null ? void 0 : _b.pages) == null ? void 0 : _c[$$props.pageIndex];
  });
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
  var fragment = root();
  var node = $.first_child(fragment);
  Pending_redactions(node, {
    get documentId() {
      return $$props.documentId;
    },
    get pageIndex() {
      return $$props.pageIndex;
    },
    get scale() {
      return $.get(actualScale);
    },
    get rotation() {
      return $.get(actualRotation);
    },
    get selectionMenu() {
      return $$props.selectionMenu;
    },
    get selectionMenuSnippet() {
      return $$props.selectionMenuSnippet;
    }
  });
  var node_1 = $.sibling(node, 2);
  Marquee_redact(node_1, {
    get documentId() {
      return $$props.documentId;
    },
    get pageIndex() {
      return $$props.pageIndex;
    },
    get scale() {
      return $.get(actualScale);
    }
  });
  var node_2 = $.sibling(node_1, 2);
  Selection_redact(node_2, {
    get documentId() {
      return $$props.documentId;
    },
    get pageIndex() {
      return $$props.pageIndex;
    },
    get scale() {
      return $.get(actualScale);
    }
  });
  $.append($$anchor, fragment);
  $.pop();
}
const RedactionPluginPackage = createPluginPackage(RedactionPluginPackage$1).addUtility(RedactRendererRegistration).build();
export {
  Highlight,
  Marquee_redact as MarqueeRedact,
  Pending_redactions as PendingRedactions,
  RedactArea,
  RedactHighlight,
  RedactRendererRegistration,
  Redaction_layer as RedactionLayer,
  RedactionPluginPackage,
  Selection_redact as SelectionRedact,
  redactRenderers,
  useRedaction,
  useRedactionCapability,
  useRedactionPlugin
};
//# sourceMappingURL=index.js.map
