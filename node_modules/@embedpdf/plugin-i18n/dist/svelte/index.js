import * as $ from "svelte/internal/client";
import { useCapability, usePlugin } from "@embedpdf/core/svelte";
import { I18nPlugin } from "@embedpdf/plugin-i18n";
export * from "@embedpdf/plugin-i18n";
import "svelte/internal/disclose-version";
const useI18nCapability = () => useCapability(I18nPlugin.id);
const useI18nPlugin = () => usePlugin(I18nPlugin.id);
const useTranslations = (getDocumentId) => {
  const capability = useI18nCapability();
  let forceUpdateCounter = $.state(0);
  const documentId = $.derived(() => getDocumentId == null ? void 0 : getDocumentId());
  $.user_effect(() => {
    const provides = capability.provides;
    const docId = $.get(documentId);
    if (!provides) return;
    const unsubscribeLocale = provides.onLocaleChange(() => {
      $.update(forceUpdateCounter);
    });
    const unsubscribeParams = docId ? provides.forDocument(docId).onParamsChanged(() => {
      $.update(forceUpdateCounter);
    }) : provides.onParamsChanged(() => {
      $.update(forceUpdateCounter);
    });
    return () => {
      unsubscribeLocale();
      unsubscribeParams();
    };
  });
  const translate = (key, options) => {
    $.get(forceUpdateCounter);
    const provides = capability.provides;
    if (!provides) return (options == null ? void 0 : options.fallback) ?? key;
    const docId = getDocumentId == null ? void 0 : getDocumentId();
    return provides.t(key, {
      documentId: docId,
      params: options == null ? void 0 : options.params,
      fallback: options == null ? void 0 : options.fallback
    });
  };
  return {
    translate,
    get locale() {
      var _a;
      return ((_a = capability.provides) == null ? void 0 : _a.getLocale()) ?? "en";
    }
  };
};
const useTranslation = (getKey, getOptions, getDocumentId) => {
  const { translate } = useTranslations(getDocumentId);
  return {
    get current() {
      return translate(getKey(), getOptions == null ? void 0 : getOptions());
    }
  };
};
const useLocale = () => {
  const capability = useI18nCapability();
  let locale = $.state("en");
  $.user_effect(() => {
    const provides = capability.provides;
    if (!provides) return;
    $.set(locale, provides.getLocale(), true);
    return provides.onLocaleChange(({ currentLocale }) => {
      $.set(locale, currentLocale, true);
    });
  });
  return {
    get current() {
      return $.get(locale);
    }
  };
};
function Translate($$anchor, $$props) {
  $.push($$props, true);
  const translation = useTranslation(() => $$props.k, () => ({ params: $$props.params, fallback: $$props.fallback }), () => $$props.documentId);
  $.next();
  var text = $.text();
  $.template_effect(() => $.set_text(text, translation.current));
  $.append($$anchor, text);
  $.pop();
}
export {
  Translate,
  useI18nCapability,
  useI18nPlugin,
  useLocale,
  useTranslation,
  useTranslations
};
//# sourceMappingURL=index.js.map
