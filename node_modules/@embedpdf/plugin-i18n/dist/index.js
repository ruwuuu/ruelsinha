import { BasePlugin, createEmitter, createScopedEmitter, arePropsEqual } from "@embedpdf/core";
const enUS = {
  code: "en",
  name: "English",
  translations: {
    commands: {
      zoom: {
        in: "Zoom In",
        out: "Zoom Out",
        fitWidth: "Fit to Width",
        fitPage: "Fit to Page",
        automatic: "Automatic",
        level: "Zoom Level ({level}%)",
        inArea: "Zoom In Area"
      },
      fullscreen: {
        enter: "Enter Full Screen",
        exit: "Exit Full Screen"
      },
      rotate: {
        clockwise: "Rotate Clockwise",
        counterclockwise: "Rotate Counter-Clockwise"
      },
      menu: "Menu",
      sidebar: "Sidebar",
      search: "Search",
      comment: "Comment",
      download: "Download",
      print: "Print",
      openFile: "Open PDF",
      save: "Save",
      settings: "Settings",
      view: "View",
      annotate: "Annotate",
      shapes: "Shapes",
      redact: "Redact",
      fillAndSign: "Fill and Sign",
      form: "Form",
      pan: "Pan",
      pointer: "Pointer",
      undo: "Undo",
      redo: "Redo",
      copy: "Copy",
      screenshot: "Screenshot",
      nextPage: "Next Page",
      previousPage: "Previous Page"
    }
  }
};
const esES = {
  code: "es",
  name: "Español",
  translations: {
    commands: {
      zoom: {
        in: "Acercar",
        out: "Alejar",
        fitWidth: "Ajustar al ancho",
        fitPage: "Ajustar a la página",
        automatic: "Automático",
        level: "Nivel de zoom ({level}%)",
        inArea: "Acercar área"
      },
      fullscreen: {
        enter: "Pantalla completa",
        exit: "Salir de pantalla completa"
      },
      rotate: {
        clockwise: "Girar a la derecha",
        counterclockwise: "Girar a la izquierda"
      },
      menu: "Menú",
      sidebar: "Barra lateral",
      search: "Buscar",
      comment: "Comentario",
      download: "Descargar",
      print: "Imprimir",
      openFile: "Abrir PDF",
      save: "Guardar",
      settings: "Configuración",
      view: "Ver",
      annotate: "Anotar",
      shapes: "Formas",
      redact: "Redactar",
      fillAndSign: "Rellenar y firmar",
      form: "Formulario",
      pan: "Desplazar",
      pointer: "Puntero",
      undo: "Deshacer",
      redo: "Rehacer",
      copy: "Copiar",
      screenshot: "Captura de pantalla",
      nextPage: "Página siguiente",
      previousPage: "Página anterior"
    }
  }
};
const I18N_PLUGIN_ID = "i18n";
const manifest = {
  id: I18N_PLUGIN_ID,
  name: "I18n Plugin",
  version: "1.0.0",
  provides: ["i18n"],
  requires: [],
  optional: [],
  defaultConfig: {
    defaultLocale: "en",
    locales: [enUS, esES]
  }
};
const SET_LOCALE = "I18N/SET_LOCALE";
const REGISTER_LOCALE = "I18N/REGISTER_LOCALE";
const setLocale = (locale) => ({
  type: SET_LOCALE,
  payload: locale
});
const registerLocale = (locale) => ({
  type: REGISTER_LOCALE,
  payload: locale
});
const _I18nPlugin = class _I18nPlugin extends BasePlugin {
  constructor(id, registry, config) {
    super(id, registry);
    this.locales = /* @__PURE__ */ new Map();
    this.paramResolvers = /* @__PURE__ */ new Map();
    this.paramsCache = /* @__PURE__ */ new Map();
    this.localeChange$ = createEmitter();
    this.paramsChanged$ = createScopedEmitter((documentId, data) => ({ documentId, ...data }), { cache: false });
    this.config = config;
    config.locales.forEach((locale) => {
      this.locales.set(locale.code, locale);
      this.dispatch(registerLocale(locale.code));
    });
    if (config.paramResolvers) {
      Object.entries(config.paramResolvers).forEach(([key, resolver]) => {
        this.paramResolvers.set(key, resolver);
      });
    }
    this.dispatch(setLocale(config.defaultLocale));
    this.registry.getStore().subscribe((_action, newState) => {
      this.detectParamChanges(newState);
    });
  }
  async initialize() {
    this.logger.info("I18nPlugin", "Initialize", "I18n plugin initialized");
  }
  async destroy() {
    this.localeChange$.clear();
    this.paramsChanged$.clear();
    this.paramResolvers.clear();
    this.paramsCache.clear();
    super.destroy();
  }
  onDocumentClosed(documentId) {
    this.paramsCache.delete(documentId);
    this.paramsChanged$.clearScope(documentId);
    this.logger.debug(
      "I18nPlugin",
      "DocumentClosed",
      `Cleaned up params cache for document: ${documentId}`
    );
  }
  buildCapability() {
    return {
      t: (key, options) => this.translate(key, options),
      forDocument: (documentId) => this.createI18nScope(documentId),
      registerParamResolver: (key, resolver) => this.registerParamResolver(key, resolver),
      unregisterParamResolver: (key) => this.unregisterParamResolver(key),
      setLocale: (locale) => this.setLocale(locale),
      getLocale: () => this.state.currentLocale,
      getAvailableLocales: () => [...this.state.availableLocales],
      getLocaleInfo: (code) => this.locales.get(code) ?? null,
      registerLocale: (locale) => this.registerLocale(locale),
      hasLocale: (code) => this.locales.has(code),
      onLocaleChange: this.localeChange$.on,
      onParamsChanged: this.paramsChanged$.onGlobal
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createI18nScope(documentId) {
    return {
      t: (key, options) => this.translate(key, { documentId, ...options }),
      onParamsChanged: this.paramsChanged$.forScope(documentId)
    };
  }
  // ─────────────────────────────────────────────────────────
  // Translation Logic
  // ─────────────────────────────────────────────────────────
  translate(key, options) {
    const locale = this.locales.get(this.state.currentLocale);
    const fallbackLocale = this.config.fallbackLocale ? this.locales.get(this.config.fallbackLocale) : null;
    let value = this.getNestedValue(locale == null ? void 0 : locale.translations, key);
    if (!value && fallbackLocale) {
      value = this.getNestedValue(fallbackLocale.translations, key);
    }
    if (!value) {
      if (options == null ? void 0 : options.fallback) {
        value = options.fallback;
      } else {
        this.logger.warn(
          "I18nPlugin",
          "MissingTranslation",
          `Translation not found for key: ${key}`
        );
        return key;
      }
    }
    let params = options == null ? void 0 : options.params;
    if (!params && this.paramResolvers.has(key)) {
      params = this.resolveParams(key, options == null ? void 0 : options.documentId);
    }
    return this.interpolate(value, params);
  }
  resolveParams(key, documentId) {
    const resolver = this.paramResolvers.get(key);
    if (!resolver) return void 0;
    const state = this.registry.getStore().getState();
    try {
      return resolver({ state, documentId });
    } catch (error) {
      this.logger.error(
        "I18nPlugin",
        "ParamResolverError",
        `Error resolving params for key "${key}":`,
        error
      );
      return void 0;
    }
  }
  getNestedValue(obj, path) {
    if (!obj) return void 0;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === void 0 || current === null) return void 0;
      current = current[part];
    }
    return typeof current === "string" ? current : void 0;
  }
  interpolate(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== void 0 ? String(value) : match;
    });
  }
  // ─────────────────────────────────────────────────────────
  // Smart Param Change Detection
  // ─────────────────────────────────────────────────────────
  detectParamChanges(newState) {
    const documentIds = Object.keys(newState.core.documents);
    documentIds.forEach((documentId) => {
      this.detectDocumentParamChanges(documentId, newState);
    });
  }
  detectDocumentParamChanges(documentId, newState) {
    const previousCache = this.paramsCache.get(documentId);
    const changedKeys = [];
    this.paramResolvers.forEach((resolver, key) => {
      try {
        const newParams = resolver({ state: newState, documentId });
        const prevParams = previousCache == null ? void 0 : previousCache.get(key);
        if (!arePropsEqual(prevParams, newParams)) {
          changedKeys.push(key);
          if (!this.paramsCache.has(documentId)) {
            this.paramsCache.set(documentId, /* @__PURE__ */ new Map());
          }
          this.paramsCache.get(documentId).set(key, newParams);
        }
      } catch (error) {
        this.logger.error(
          "I18nPlugin",
          "ParamDetectionError",
          `Error detecting param changes for key "${key}":`,
          error
        );
      }
    });
    if (changedKeys.length > 0) {
      this.paramsChanged$.emit(documentId, { changedKeys });
      this.logger.debug(
        "I18nPlugin",
        "ParamsChanged",
        `Translation params changed for document ${documentId}:`,
        changedKeys
      );
    }
  }
  // ─────────────────────────────────────────────────────────
  // Param Resolver Management
  // ─────────────────────────────────────────────────────────
  registerParamResolver(key, resolver) {
    if (this.paramResolvers.has(key)) {
      this.logger.warn(
        "I18nPlugin",
        "ResolverOverwrite",
        `Param resolver for "${key}" already exists and will be overwritten`
      );
    }
    this.paramResolvers.set(key, resolver);
    this.paramsCache.forEach((docCache) => {
      docCache.delete(key);
    });
    this.logger.debug("I18nPlugin", "ResolverRegistered", `Param resolver registered for: ${key}`);
  }
  unregisterParamResolver(key) {
    if (this.paramResolvers.delete(key)) {
      this.paramsCache.forEach((docCache) => {
        docCache.delete(key);
      });
      this.logger.debug(
        "I18nPlugin",
        "ResolverUnregistered",
        `Param resolver unregistered for: ${key}`
      );
    }
  }
  // ─────────────────────────────────────────────────────────
  // Locale Management
  // ─────────────────────────────────────────────────────────
  setLocale(locale) {
    if (!this.locales.has(locale)) {
      this.logger.warn("I18nPlugin", "LocaleNotFound", `Locale '${locale}' is not registered`);
      return;
    }
    const previousLocale = this.state.currentLocale;
    if (previousLocale === locale) return;
    this.dispatch(setLocale(locale));
    this.localeChange$.emit({
      previousLocale,
      currentLocale: locale
    });
    this.logger.info("I18nPlugin", "LocaleChanged", `Locale changed to: ${locale}`);
  }
  registerLocale(locale) {
    if (this.locales.has(locale.code)) {
      this.logger.warn(
        "I18nPlugin",
        "LocaleAlreadyRegistered",
        `Locale '${locale.code}' is already registered`
      );
      return;
    }
    this.locales.set(locale.code, locale);
    this.dispatch(registerLocale(locale.code));
    this.logger.info("I18nPlugin", "LocaleRegistered", `Locale registered: ${locale.code}`);
  }
};
_I18nPlugin.id = "i18n";
let I18nPlugin = _I18nPlugin;
const initialState = {
  currentLocale: "en",
  availableLocales: []
};
const i18nReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE: {
      const locale = action.payload;
      if (!state.availableLocales.includes(locale)) {
        console.warn(`I18nPlugin: Locale '${locale}' not available`);
        return state;
      }
      return {
        ...state,
        currentLocale: locale
      };
    }
    case REGISTER_LOCALE: {
      const locale = action.payload;
      if (state.availableLocales.includes(locale)) {
        return state;
      }
      return {
        ...state,
        availableLocales: [...state.availableLocales, locale]
      };
    }
    default:
      return state;
  }
};
const I18nPluginPackage = {
  manifest,
  create: (registry, config) => new I18nPlugin(I18N_PLUGIN_ID, registry, config),
  reducer: i18nReducer,
  initialState
};
export {
  I18N_PLUGIN_ID,
  I18nPlugin,
  I18nPluginPackage,
  enUS,
  esES,
  manifest
};
//# sourceMappingURL=index.js.map
