import { useCapability, usePlugin } from "@embedpdf/core/preact";
import { I18nPlugin } from "@embedpdf/plugin-i18n";
export * from "@embedpdf/plugin-i18n";
import "preact";
import { useState, useEffect, useReducer, useCallback } from "preact/hooks";
const useI18nCapability = () => useCapability(I18nPlugin.id);
const useI18nPlugin = () => usePlugin(I18nPlugin.id);
const useTranslations = (documentId) => {
  const { provides } = useI18nCapability();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const translate = useCallback(
    (key, options) => {
      if (!provides) return (options == null ? void 0 : options.fallback) ?? key;
      return provides.t(key, { documentId, params: options == null ? void 0 : options.params, fallback: options == null ? void 0 : options.fallback });
    },
    [provides, documentId]
  );
  useEffect(() => {
    if (!provides) return;
    const unsubscribeLocale = provides.onLocaleChange(() => {
      forceUpdate();
    });
    const unsubscribeParams = documentId ? provides.forDocument(documentId).onParamsChanged(() => {
      forceUpdate();
    }) : provides.onParamsChanged(() => {
      forceUpdate();
    });
    return () => {
      unsubscribeLocale();
      unsubscribeParams();
    };
  }, [provides, documentId]);
  return {
    translate,
    locale: (provides == null ? void 0 : provides.getLocale()) ?? "en"
  };
};
const useTranslation = (key, options, documentId) => {
  const { translate } = useTranslations(documentId);
  return translate(key, options);
};
const useLocale = () => {
  const { provides } = useI18nCapability();
  const [locale, setLocale] = useState(() => (provides == null ? void 0 : provides.getLocale()) ?? "en");
  useEffect(() => {
    if (!provides) return;
    const unsubscribe = provides.onLocaleChange(({ currentLocale }) => {
      setLocale(currentLocale);
    });
    setLocale(provides.getLocale());
    return unsubscribe;
  }, [provides]);
  return locale;
};
function Translate({ k, params, fallback, documentId, children }) {
  const translation = useTranslation(k, { params, fallback }, documentId);
  if (children) {
    return children(translation);
  }
  return translation;
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
