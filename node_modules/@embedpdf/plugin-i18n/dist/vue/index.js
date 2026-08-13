import { ref, watch, toValue, computed, readonly, defineComponent, openBlock, createElementBlock, toDisplayString, unref } from "vue";
import { useCapability, usePlugin } from "@embedpdf/core/vue";
import { I18nPlugin } from "@embedpdf/plugin-i18n";
export * from "@embedpdf/plugin-i18n";
const useI18nCapability = () => useCapability(I18nPlugin.id);
const useI18nPlugin = () => usePlugin(I18nPlugin.id);
const useTranslations = (documentId) => {
  const { provides } = useI18nCapability();
  const forceUpdateCounter = ref(0);
  watch(
    [provides, () => documentId ? toValue(documentId) : void 0],
    ([providesValue, docId], _, onCleanup) => {
      if (!providesValue) return;
      const unsubscribeLocale = providesValue.onLocaleChange(() => {
        forceUpdateCounter.value++;
      });
      const unsubscribeParams = docId ? providesValue.forDocument(docId).onParamsChanged(() => {
        forceUpdateCounter.value++;
      }) : providesValue.onParamsChanged(() => {
        forceUpdateCounter.value++;
      });
      onCleanup(() => {
        unsubscribeLocale();
        unsubscribeParams();
      });
    },
    { immediate: true }
  );
  const translate = (key, options) => {
    forceUpdateCounter.value;
    const providesValue = provides.value;
    if (!providesValue) return (options == null ? void 0 : options.fallback) ?? key;
    const docId = documentId ? toValue(documentId) : void 0;
    return providesValue.t(key, {
      documentId: docId,
      params: options == null ? void 0 : options.params,
      fallback: options == null ? void 0 : options.fallback
    });
  };
  const locale = computed(() => {
    var _a;
    forceUpdateCounter.value;
    return ((_a = provides.value) == null ? void 0 : _a.getLocale()) ?? "en";
  });
  return {
    translate,
    locale: readonly(locale)
  };
};
const useTranslation = (key, options, documentId) => {
  const { translate } = useTranslations(documentId);
  return computed(() => translate(key, options));
};
const useLocale = () => {
  const { provides } = useI18nCapability();
  const locale = ref("en");
  watch(
    provides,
    (providesValue, _, onCleanup) => {
      if (!providesValue) return;
      locale.value = providesValue.getLocale();
      const unsubscribe = providesValue.onLocaleChange(({ currentLocale }) => {
        locale.value = currentLocale;
      });
      onCleanup(unsubscribe);
    },
    { immediate: true }
  );
  return locale;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "translate",
  props: {
    k: {},
    params: {},
    fallback: {},
    documentId: {}
  },
  setup(__props) {
    const props = __props;
    const translation = useTranslation(
      props.k,
      { params: props.params, fallback: props.fallback },
      () => props.documentId
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", null, toDisplayString(unref(translation)), 1);
    };
  }
});
export {
  _sfc_main as Translate,
  useI18nCapability,
  useI18nPlugin,
  useLocale,
  useTranslation,
  useTranslations
};
//# sourceMappingURL=index.js.map
