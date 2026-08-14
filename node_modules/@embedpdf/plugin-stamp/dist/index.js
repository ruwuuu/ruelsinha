import { BasePlugin, createEmitter, createScopedEmitter } from "@embedpdf/core";
import { PdfAnnotationSubtype, uuidV4, PdfAnnotationName, Task, PdfErrorCode } from "@embedpdf/models";
import { applyInsertUpright, clampAnnotationToPage, defineAnnotationTool } from "@embedpdf/plugin-annotation";
const STAMP_PLUGIN_ID = "stamp";
const manifest = {
  id: STAMP_PLUGIN_ID,
  name: "Stamp Plugin",
  version: "1.0.0",
  provides: ["stamp"],
  requires: ["annotation"],
  optional: ["i18n"],
  defaultConfig: {
    defaultLibrary: {
      id: "custom",
      name: "Custom Stamps",
      nameKey: "stamp.library.custom",
      categories: ["custom", "sidebar"]
    },
    manifests: [
      {
        url: "https://cdn.jsdelivr.net/npm/@embedpdf/default-stamps/{locale}/manifest.json",
        fallbackLocale: "en"
      }
    ]
  }
};
const ADD_STAMP_LIBRARY = "STAMP/ADD_LIBRARY";
const REMOVE_STAMP_LIBRARY = "STAMP/REMOVE_LIBRARY";
function addStampLibrary(id) {
  return { type: ADD_STAMP_LIBRARY, payload: id };
}
function removeStampLibrary(id) {
  return { type: REMOVE_STAMP_LIBRARY, payload: id };
}
const rubberStampHandlerFactory = {
  annotationType: PdfAnnotationSubtype.STAMP,
  create(context) {
    const { onPreview, onCommit, getTool, pageSize, pageRotation, getToolContext } = context;
    return {
      onPointerMove: (pos) => {
        const ctx = getToolContext();
        if (!(ctx == null ? void 0 : ctx.stampSize)) return;
        const { width, height } = ctx.stampSize;
        onPreview({
          type: PdfAnnotationSubtype.STAMP,
          bounds: {
            origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
            size: { width, height }
          },
          data: {
            rect: {
              origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
              size: { width, height }
            },
            ghostUrl: ctx.ghostUrl,
            pageRotation
          }
        });
      },
      onPointerDown: (pos) => {
        var _a;
        const tool = getTool();
        const ctx = getToolContext();
        if (!tool || !(ctx == null ? void 0 : ctx.stampSize)) return;
        const { width, height } = ctx.stampSize;
        const rect = {
          origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
          size: { width, height }
        };
        let anno = {
          ...tool.defaults,
          rect,
          type: PdfAnnotationSubtype.STAMP,
          name: ctx.stamp.name ?? tool.defaults.name ?? PdfAnnotationName.Custom,
          subject: ctx.stamp.subject ?? tool.defaults.subject ?? "Custom Stamp",
          flags: tool.defaults.flags ?? ["print"],
          pageIndex: context.pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date()
        };
        if ((_a = tool.behavior) == null ? void 0 : _a.insertUpright) {
          anno = applyInsertUpright(anno, pageRotation, false);
        }
        anno = clampAnnotationToPage(anno, pageSize);
        onCommit(anno, { appearance: ctx.appearance });
        onPreview(null);
      },
      onPointerLeave: () => {
        onPreview(null);
      }
    };
  }
};
const RUBBER_STAMP_TOOL_ID = "rubberStamp";
const rubberStampTool = defineAnnotationTool({
  id: RUBBER_STAMP_TOOL_ID,
  name: "Rubber Stamp",
  labelKey: "stamp.rubberStamp",
  categories: ["annotation", "stamp", "insert"],
  matchScore: () => 0,
  interaction: {
    exclusive: true,
    cursor: "copy",
    isDraggable: true,
    isResizable: true,
    isRotatable: false,
    lockAspectRatio: true,
    isGroupDraggable: true,
    isGroupResizable: false,
    isGroupRotatable: false
  },
  defaults: {
    type: PdfAnnotationSubtype.STAMP
  },
  behavior: {
    deactivateToolAfterCreate: true,
    selectAfterCreate: true,
    insertUpright: true,
    useAppearanceStream: true
  },
  pointerHandler: rubberStampHandlerFactory
});
const stampTools = [rubberStampTool];
const ANNOTATION_NAME_MAP = {
  Approved: PdfAnnotationName.Approved,
  Experimental: PdfAnnotationName.Experimental,
  NotApproved: PdfAnnotationName.NotApproved,
  AsIs: PdfAnnotationName.AsIs,
  Expired: PdfAnnotationName.Expired,
  NotForPublicRelease: PdfAnnotationName.NotForPublicRelease,
  Confidential: PdfAnnotationName.Confidential,
  Final: PdfAnnotationName.Final,
  Sold: PdfAnnotationName.Sold,
  Departmental: PdfAnnotationName.Departmental,
  ForComment: PdfAnnotationName.ForComment,
  TopSecret: PdfAnnotationName.TopSecret,
  Draft: PdfAnnotationName.Draft,
  ForPublicRelease: PdfAnnotationName.ForPublicRelease,
  Completed: PdfAnnotationName.Completed,
  Void: PdfAnnotationName.Void,
  PreliminaryResults: PdfAnnotationName.PreliminaryResults,
  InformationOnly: PdfAnnotationName.InformationOnly,
  Rejected: PdfAnnotationName.Rejected,
  Witness: PdfAnnotationName.Witness,
  InitialHere: PdfAnnotationName.InitialHere,
  SignHere: PdfAnnotationName.SignHere,
  Accepted: PdfAnnotationName.Accepted,
  Custom: PdfAnnotationName.Custom,
  Image: PdfAnnotationName.Image
};
function parseAnnotationName(name) {
  if (!name) return PdfAnnotationName.Custom;
  return ANNOTATION_NAME_MAP[name] ?? PdfAnnotationName.Custom;
}
const _StampPlugin = class _StampPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b;
    super(id, registry);
    this.config = config;
    this.instanceId = uuidV4();
    this.libraries = /* @__PURE__ */ new Map();
    this.libraryChange$ = createEmitter();
    this.activeStamp$ = createScopedEmitter((documentId, activeStamp) => ({ documentId, activeStamp }));
    this.managedManifests = [];
    this.annotation = null;
    this.i18n = null;
    this.localeUnsubscribe = null;
    this.toolChangeUnsubscribe = null;
    this.currentGhostUrl = null;
    this.annotation = ((_a = registry.getPlugin("annotation")) == null ? void 0 : _a.provides()) ?? null;
    if (this.annotation) {
      for (const tool of stampTools) {
        this.annotation.addTool(tool);
      }
      this.toolChangeUnsubscribe = this.annotation.onActiveToolChange(({ documentId, tool }) => {
        if ((tool == null ? void 0 : tool.id) !== RUBBER_STAMP_TOOL_ID) {
          if (this.currentGhostUrl) {
            URL.revokeObjectURL(this.currentGhostUrl);
            this.currentGhostUrl = null;
          }
          this.activeStamp$.emit(documentId, null);
        }
      });
    }
    this.i18n = ((_b = registry.getPlugin("i18n")) == null ? void 0 : _b.provides()) ?? null;
  }
  async initialize() {
    if (this.config.libraries) {
      for (const libConfig of this.config.libraries) {
        await this.loadLibraryInternal(libConfig).toPromise();
      }
    }
    if (this.config.manifests && this.config.manifests.length > 0) {
      await this.initializeManifests();
    }
  }
  buildCapability() {
    return {
      getLibraries: () => this.getLibraries(),
      getStampsByCategory: (category) => this.getStampsByCategory(category),
      renderStamp: (libraryId, pageIndex, width, dpr) => this.renderStamp(libraryId, pageIndex, width, dpr),
      loadLibrary: (config) => this.loadLibrary(config),
      loadLibraryFromManifest: (url) => this.loadLibraryFromManifest(url),
      createNewLibrary: (name, options) => this.createNewLibrary(name, options),
      addStampToLibrary: (libraryId, stamp, pdf) => this.addStampToLibrary(libraryId, stamp, pdf),
      removeStampFromLibrary: (libraryId, stampId) => this.removeStampFromLibrary(libraryId, stampId),
      updateStamp: (libraryId, stampId, updates) => this.updateStamp(libraryId, stampId, updates),
      updateLibrary: (libraryId, updates) => this.updateLibrary(libraryId, updates),
      removeLibrary: (id) => this.removeLibrary(id),
      exportLibrary: (id) => this.exportLibrary(id),
      forDocument: (documentId) => this.createStampScope(documentId),
      onActiveStampChange: this.activeStamp$.onGlobal,
      onLibraryChange: this.libraryChange$.on
    };
  }
  getLibraries() {
    return Array.from(this.libraries.values());
  }
  getStampsByCategory(category) {
    var _a, _b;
    const results = [];
    for (const library of this.libraries.values()) {
      const libraryMatches = ((_a = library.categories) == null ? void 0 : _a.includes(category)) ?? false;
      for (const stamp of library.stamps) {
        const stampMatches = ((_b = stamp.categories) == null ? void 0 : _b.includes(category)) ?? false;
        if (libraryMatches || stampMatches) {
          results.push({ library, stamp });
        }
      }
    }
    return results;
  }
  renderStamp(libraryId, pageIndex, width, dpr) {
    const library = this.libraries.get(libraryId);
    if (!library) {
      const task = new Task();
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    const page = library.document.pages[pageIndex];
    if (!page) {
      const task = new Task();
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Page ${pageIndex} not found in stamp library: ${libraryId}`
      });
      return task;
    }
    const scaleFactor = width / page.size.width;
    return this.engine.renderPageRect(
      library.document,
      page,
      { origin: { x: 0, y: 0 }, size: page.size },
      {
        scaleFactor,
        dpr: dpr ?? 1,
        withAnnotations: true,
        rotation: page.rotation,
        transparentBackground: true
      }
    );
  }
  loadLibrary(config) {
    return this.loadLibraryInternal(config);
  }
  createNewLibrary(name, options) {
    const task = new Task();
    const libraryId = (options == null ? void 0 : options.id) ?? this.generateLibraryId();
    const documentId = this.getLibraryDocumentId(libraryId);
    this.engine.createDocument(documentId).wait(
      (doc) => {
        const library = {
          id: libraryId,
          name,
          nameKey: options == null ? void 0 : options.nameKey,
          document: doc,
          stamps: [],
          categories: options == null ? void 0 : options.categories,
          readonly: (options == null ? void 0 : options.readonly) ?? false
        };
        this.libraries.set(libraryId, library);
        this.dispatch(addStampLibrary(libraryId));
        this.emitLibraryChange();
        task.resolve(libraryId);
      },
      (error) => {
        this.logger.error(
          "StampPlugin",
          "CreateNewLibrary",
          `Failed to create library: ${name}`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  addStampToLibrary(libraryId, stamp, pdf) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    if (library.readonly) {
      task.reject({
        code: PdfErrorCode.NotSupport,
        message: `Cannot add stamps to readonly library: ${libraryId}`
      });
      return task;
    }
    const tempDocId = `stamp-temp-${Date.now()}`;
    this.engine.openDocumentBuffer({ id: tempDocId, content: pdf }).wait(
      (tempDoc) => {
        this.engine.importPages(library.document, tempDoc, [0]).wait(
          (newPages) => {
            const newPage = newPages[0];
            library.document.pages.push(newPage);
            library.document.pageCount = library.document.pages.length;
            const stampDef = {
              ...stamp,
              id: uuidV4(),
              pageIndex: newPage.index
            };
            library.stamps.push(stampDef);
            this.engine.closeDocument(tempDoc).wait(
              () => {
                this.emitLibraryChange();
                task.resolve();
              },
              () => {
                this.emitLibraryChange();
                task.resolve();
              }
            );
          },
          (error) => {
            this.logger.error("StampPlugin", "AddStampToLibrary", "Failed to import page", error);
            this.engine.closeDocument(tempDoc).wait(
              () => task.fail(error),
              () => task.fail(error)
            );
          }
        );
      },
      (error) => {
        this.logger.error(
          "StampPlugin",
          "AddStampToLibrary",
          "Failed to open temp document",
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  createStampScope(documentId) {
    return {
      createStampFromAnnotation: (annotation, stamp, libraryId) => this.createStampFromAnnotation(documentId, annotation, stamp, libraryId),
      createStampFromAnnotations: (annotations, stamp, libraryId) => this.createStampFromAnnotations(documentId, annotations, stamp, libraryId),
      activateStampPlacement: (libraryId, stamp) => this.activateStampPlacement(documentId, libraryId, stamp),
      activateStampPlacementById: (libraryId, stampId) => this.activateStampPlacementById(documentId, libraryId, stampId),
      getActiveStamp: () => this.getActiveStamp(documentId),
      onActiveStampChange: this.activeStamp$.forScope(documentId)
    };
  }
  activateStampPlacementById(documentId, libraryId, stampId) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    const stamp = library.stamps.find((s) => s.id === stampId);
    if (!stamp) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp ${stampId} not found in library: ${libraryId}`
      });
      return task;
    }
    return this.activateStampPlacement(documentId, libraryId, stamp);
  }
  getActiveStamp(documentId) {
    return this.activeStamp$.getValue(documentId) ?? null;
  }
  activateStampPlacement(documentId, libraryId, stamp) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    const page = library.document.pages[stamp.pageIndex];
    if (!page) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Page ${stamp.pageIndex} not found in library`
      });
      return task;
    }
    const stampSize = page.size;
    this.engine.extractPages(library.document, [stamp.pageIndex]).wait(
      (appearance) => {
        this.renderStamp(libraryId, stamp.pageIndex, stampSize.width, 2).wait(
          (blob) => {
            var _a;
            if (this.currentGhostUrl) {
              URL.revokeObjectURL(this.currentGhostUrl);
            }
            const ghostUrl = URL.createObjectURL(blob);
            this.currentGhostUrl = ghostUrl;
            (_a = this.annotation) == null ? void 0 : _a.setActiveTool(RUBBER_STAMP_TOOL_ID, {
              appearance,
              ghostUrl,
              stampSize,
              libraryId,
              stamp
            });
            this.activeStamp$.emit(documentId, { libraryId, stamp });
            task.resolve();
          },
          (error) => {
            this.logger.error(
              "StampPlugin",
              "ActivateStampPlacement",
              "Failed to render stamp preview",
              error
            );
            task.fail(error);
          }
        );
      },
      (error) => {
        this.logger.error(
          "StampPlugin",
          "ActivateStampPlacement",
          "Failed to extract stamp page",
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  createStampFromAnnotation(documentId, annotation, stamp, libraryId) {
    const task = new Task();
    const docState = this.getCoreDocument(documentId);
    if (!(docState == null ? void 0 : docState.document)) {
      task.reject({ code: PdfErrorCode.DocNotOpen, message: "document is not open" });
      return task;
    }
    const doc = docState.document;
    const page = doc.pages[annotation.pageIndex];
    if (!page) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `page ${annotation.pageIndex} not found`
      });
      return task;
    }
    this.resolveTargetLibrary(libraryId).wait(
      (targetId) => {
        this.engine.exportAnnotationAppearanceAsPdf(doc, page, annotation).wait(
          (pdf) => {
            this.addStampToLibrary(targetId, stamp, pdf).wait(
              () => task.resolve(),
              (error) => task.fail(error)
            );
          },
          (error) => {
            this.logger.error(
              "StampPlugin",
              "CreateStampFromAnnotation",
              "Failed to export annotation",
              error
            );
            task.fail(error);
          }
        );
      },
      (error) => task.fail(error)
    );
    return task;
  }
  createStampFromAnnotations(documentId, annotations, stamp, libraryId) {
    const task = new Task();
    if (annotations.length === 0) {
      task.reject({ code: PdfErrorCode.NotFound, message: "no annotations provided" });
      return task;
    }
    const docState = this.getCoreDocument(documentId);
    if (!(docState == null ? void 0 : docState.document)) {
      task.reject({ code: PdfErrorCode.DocNotOpen, message: "document is not open" });
      return task;
    }
    const doc = docState.document;
    const page = doc.pages[annotations[0].pageIndex];
    if (!page) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `page ${annotations[0].pageIndex} not found`
      });
      return task;
    }
    this.resolveTargetLibrary(libraryId).wait(
      (targetId) => {
        this.engine.exportAnnotationsAppearanceAsPdf(doc, page, annotations).wait(
          (pdf) => {
            this.addStampToLibrary(targetId, stamp, pdf).wait(
              () => task.resolve(),
              (error) => task.fail(error)
            );
          },
          (error) => {
            this.logger.error(
              "StampPlugin",
              "CreateStampFromAnnotations",
              "Failed to export annotations",
              error
            );
            task.fail(error);
          }
        );
      },
      (error) => task.fail(error)
    );
    return task;
  }
  resolveTargetLibrary(libraryId) {
    if (libraryId && this.libraries.has(libraryId)) {
      const task = new Task();
      task.resolve(libraryId);
      return task;
    }
    const defaults = this.config.defaultLibrary;
    if (this.config.defaultLibrary === false || !defaults) {
      const task = new Task();
      task.reject({
        code: PdfErrorCode.NotSupport,
        message: "Default library creation is disabled"
      });
      return task;
    }
    const defaultId = defaults.id ?? "custom";
    if (this.libraries.has(defaultId)) {
      const task = new Task();
      task.resolve(defaultId);
      return task;
    }
    return this.createNewLibrary(defaults.name ?? "Custom Stamps", {
      id: defaultId,
      nameKey: defaults.nameKey,
      categories: defaults.categories
    });
  }
  removeLibrary(id) {
    const task = new Task();
    const library = this.libraries.get(id);
    if (!library) {
      task.resolve();
      return task;
    }
    this.engine.closeDocument(library.document).wait(
      () => {
        this.libraries.delete(id);
        this.dispatch(removeStampLibrary(id));
        this.emitLibraryChange();
        task.resolve();
      },
      () => {
        this.logger.warn(
          "StampPlugin",
          "RemoveLibrary",
          `Failed to close document for library: ${id}`
        );
        this.libraries.delete(id);
        this.dispatch(removeStampLibrary(id));
        this.emitLibraryChange();
        task.resolve();
      }
    );
    return task;
  }
  exportLibrary(id) {
    const task = new Task();
    const library = this.libraries.get(id);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${id}`
      });
      return task;
    }
    this.engine.saveAsCopy(library.document).wait(
      (pdf) => {
        task.resolve({
          name: library.name,
          pdf,
          stamps: library.stamps,
          categories: library.categories
        });
      },
      (error) => {
        this.logger.error("StampPlugin", "ExportLibrary", `Failed to export library: ${id}`, error);
        task.fail(error);
      }
    );
    return task;
  }
  loadLibraryInternal(config) {
    const task = new Task();
    const libraryId = config.id ?? this.generateLibraryId();
    const documentId = this.getLibraryDocumentId(libraryId);
    const engineTask = typeof config.pdf === "string" ? this.engine.openDocumentUrl({ id: documentId, url: config.pdf }) : this.engine.openDocumentBuffer({ id: documentId, content: config.pdf });
    engineTask.wait(
      (doc) => {
        const stamps = config.stamps.map((s) => s.id ? s : { ...s, id: uuidV4() });
        const library = {
          id: libraryId,
          name: config.name,
          nameKey: config.nameKey,
          document: doc,
          stamps,
          categories: config.categories,
          readonly: config.readonly ?? false
        };
        this.libraries.set(libraryId, library);
        this.dispatch(addStampLibrary(libraryId));
        this.emitLibraryChange();
        task.resolve(libraryId);
      },
      (error) => {
        this.logger.error(
          "StampPlugin",
          "LoadLibrary",
          `Failed to load stamp library: ${config.name}`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  removeStampFromLibrary(libraryId, stampId) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    if (library.readonly) {
      task.reject({
        code: PdfErrorCode.NotSupport,
        message: `Cannot remove stamps from readonly library: ${libraryId}`
      });
      return task;
    }
    const stampIdx = library.stamps.findIndex((s) => s.id === stampId);
    if (stampIdx === -1) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp ${stampId} not found in library: ${libraryId}`
      });
      return task;
    }
    const pageIndex = library.stamps[stampIdx].pageIndex;
    this.engine.deletePage(library.document, pageIndex).wait(
      () => {
        library.stamps.splice(stampIdx, 1);
        library.document.pages.splice(pageIndex, 1);
        library.document.pageCount = library.document.pages.length;
        for (const s of library.stamps) {
          if (s.pageIndex > pageIndex) {
            s.pageIndex--;
          }
        }
        for (let i = 0; i < library.document.pages.length; i++) {
          library.document.pages[i].index = i;
        }
        this.emitLibraryChange();
        task.resolve();
      },
      (error) => {
        this.logger.error(
          "StampPlugin",
          "RemoveStampFromLibrary",
          `Failed to delete page for stamp ${stampId}`,
          error
        );
        task.fail(error);
      }
    );
    return task;
  }
  updateStamp(libraryId, stampId, updates) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    if (library.readonly) {
      task.reject({
        code: PdfErrorCode.NotSupport,
        message: `Cannot update stamps in readonly library: ${libraryId}`
      });
      return task;
    }
    const stamp = library.stamps.find((s) => s.id === stampId);
    if (!stamp) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp ${stampId} not found in library: ${libraryId}`
      });
      return task;
    }
    Object.assign(stamp, updates);
    this.emitLibraryChange();
    task.resolve();
    return task;
  }
  updateLibrary(libraryId, updates) {
    const task = new Task();
    const library = this.libraries.get(libraryId);
    if (!library) {
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Stamp library not found: ${libraryId}`
      });
      return task;
    }
    if (library.readonly) {
      task.reject({
        code: PdfErrorCode.NotSupport,
        message: `Cannot update readonly library: ${libraryId}`
      });
      return task;
    }
    if (updates.name !== void 0) library.name = updates.name;
    if (updates.nameKey !== void 0) library.nameKey = updates.nameKey;
    if (updates.categories !== void 0) library.categories = updates.categories;
    if (updates.readonly !== void 0) library.readonly = updates.readonly;
    this.emitLibraryChange();
    task.resolve();
    return task;
  }
  loadLibraryFromManifest(url) {
    return this.loadManifestUrl(url, true);
  }
  async initializeManifests() {
    var _a;
    const currentLocale = ((_a = this.i18n) == null ? void 0 : _a.getLocale()) ?? "en";
    for (const source of this.config.manifests) {
      const localeAware = source.url.includes("{locale}");
      const locale = localeAware ? currentLocale : "";
      const resolvedUrl = source.url.replace("{locale}", locale || currentLocale);
      const managed = {
        source,
        localeAware,
        currentLocale: localeAware ? currentLocale : "",
        libraryId: null
      };
      this.managedManifests.push(managed);
      try {
        const libraryId = await this.loadManifestUrl(resolvedUrl, true).toPromise();
        managed.libraryId = libraryId;
      } catch {
        if (localeAware && source.fallbackLocale && source.fallbackLocale !== currentLocale) {
          const fallbackUrl = source.url.replace("{locale}", source.fallbackLocale);
          try {
            const libraryId = await this.loadManifestUrl(fallbackUrl, true).toPromise();
            managed.libraryId = libraryId;
            managed.currentLocale = source.fallbackLocale;
          } catch {
            this.logger.warn(
              "StampPlugin",
              "InitManifests",
              `Failed to load manifest (including fallback): ${source.url}`
            );
          }
        } else {
          this.logger.warn(
            "StampPlugin",
            "InitManifests",
            `Failed to load manifest: ${resolvedUrl}`
          );
        }
      }
    }
    if (this.i18n) {
      this.localeUnsubscribe = this.i18n.onLocaleChange((event) => {
        this.handleLocaleChange(event.currentLocale);
      });
    }
  }
  async handleLocaleChange(newLocale) {
    for (const managed of this.managedManifests) {
      if (!managed.localeAware || managed.currentLocale === newLocale) {
        continue;
      }
      if (managed.libraryId) {
        try {
          await this.removeLibrary(managed.libraryId).toPromise();
        } catch {
        }
        managed.libraryId = null;
      }
      const resolvedUrl = managed.source.url.replace("{locale}", newLocale);
      try {
        const libraryId = await this.loadManifestUrl(resolvedUrl, true).toPromise();
        managed.libraryId = libraryId;
        managed.currentLocale = newLocale;
      } catch {
        const fallback = managed.source.fallbackLocale ?? "en";
        if (fallback !== newLocale) {
          const fallbackUrl = managed.source.url.replace("{locale}", fallback);
          try {
            const libraryId = await this.loadManifestUrl(fallbackUrl, true).toPromise();
            managed.libraryId = libraryId;
            managed.currentLocale = fallback;
          } catch {
            this.logger.warn(
              "StampPlugin",
              "LocaleChange",
              `Failed to load manifest for locale ${newLocale} (including fallback): ${managed.source.url}`
            );
          }
        } else {
          this.logger.warn(
            "StampPlugin",
            "LocaleChange",
            `Failed to load manifest for locale ${newLocale}: ${managed.source.url}`
          );
        }
      }
    }
  }
  loadManifestUrl(url, readonly) {
    const task = new Task();
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }).then((manifest2) => {
      const pdfUrl = this.resolveManifestPdfUrl(url, manifest2.pdf);
      const stamps = manifest2.stamps.map((entry) => ({
        id: entry.id ?? uuidV4(),
        pageIndex: entry.pageIndex,
        name: parseAnnotationName(entry.name),
        subject: entry.subject,
        subjectKey: entry.subjectKey,
        label: entry.label,
        categories: entry.categories
      }));
      const config = {
        id: manifest2.id,
        name: manifest2.name,
        nameKey: manifest2.nameKey,
        pdf: pdfUrl,
        stamps,
        categories: manifest2.categories,
        readonly
      };
      this.loadLibraryInternal(config).wait(
        (libraryId) => task.resolve(libraryId),
        (error) => task.fail(error)
      );
    }).catch((error) => {
      this.logger.error("StampPlugin", "LoadManifest", `Failed to fetch manifest: ${url}`, error);
      task.reject({
        code: PdfErrorCode.NotFound,
        message: `Failed to load stamp manifest: ${url}`
      });
    });
    return task;
  }
  resolveManifestPdfUrl(manifestUrl, pdfPath) {
    if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://") || pdfPath.startsWith("/")) {
      return pdfPath;
    }
    const base = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1);
    return base + pdfPath;
  }
  generateLibraryId() {
    return uuidV4();
  }
  getLibraryDocumentId(libraryId) {
    return `stamp-doc-${this.instanceId}-${libraryId}`;
  }
  emitLibraryChange() {
    this.libraryChange$.emit(this.getLibraries());
  }
  async destroy() {
    if (this.currentGhostUrl) {
      URL.revokeObjectURL(this.currentGhostUrl);
      this.currentGhostUrl = null;
    }
    if (this.toolChangeUnsubscribe) {
      this.toolChangeUnsubscribe();
      this.toolChangeUnsubscribe = null;
    }
    if (this.localeUnsubscribe) {
      this.localeUnsubscribe();
      this.localeUnsubscribe = null;
    }
    this.activeStamp$.clear();
    const libs = Array.from(this.libraries.values());
    for (const library of libs) {
      try {
        await this.engine.closeDocument(library.document).toPromise();
      } catch {
      }
    }
    this.libraries.clear();
    this.managedManifests.length = 0;
    super.destroy();
  }
};
_StampPlugin.id = STAMP_PLUGIN_ID;
let StampPlugin = _StampPlugin;
const initialState = {
  libraryIds: []
};
const stampReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_STAMP_LIBRARY:
      return {
        ...state,
        libraryIds: [...state.libraryIds, action.payload]
      };
    case REMOVE_STAMP_LIBRARY:
      return {
        ...state,
        libraryIds: state.libraryIds.filter((id) => id !== action.payload)
      };
    default:
      return state;
  }
};
const StampPluginPackage = {
  manifest,
  create: (registry, config) => new StampPlugin(STAMP_PLUGIN_ID, registry, config),
  reducer: stampReducer,
  initialState
};
export {
  ADD_STAMP_LIBRARY,
  REMOVE_STAMP_LIBRARY,
  RUBBER_STAMP_TOOL_ID,
  STAMP_PLUGIN_ID,
  StampPlugin,
  StampPluginPackage,
  addStampLibrary,
  initialState,
  manifest,
  removeStampLibrary,
  stampReducer
};
//# sourceMappingURL=index.js.map
