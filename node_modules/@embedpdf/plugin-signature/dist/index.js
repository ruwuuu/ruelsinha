import { BasePlugin, createEmitter, createScopedEmitter } from "@embedpdf/core";
import { PdfAnnotationSubtype, uuidV4, PdfAnnotationName, expandRect } from "@embedpdf/models";
import { applyInsertUpright, clampAnnotationToPage, defineAnnotationTool, patching } from "@embedpdf/plugin-annotation";
var SignatureMode = /* @__PURE__ */ ((SignatureMode2) => {
  SignatureMode2["SignatureOnly"] = "signature-only";
  SignatureMode2["SignatureAndInitials"] = "signature-and-initials";
  return SignatureMode2;
})(SignatureMode || {});
var SignatureCreationType = /* @__PURE__ */ ((SignatureCreationType2) => {
  SignatureCreationType2["Draw"] = "draw";
  SignatureCreationType2["Type"] = "type";
  SignatureCreationType2["Upload"] = "upload";
  return SignatureCreationType2;
})(SignatureCreationType || {});
var SignatureFieldKind = /* @__PURE__ */ ((SignatureFieldKind2) => {
  SignatureFieldKind2["Signature"] = "signature";
  SignatureFieldKind2["Initials"] = "initials";
  return SignatureFieldKind2;
})(SignatureFieldKind || {});
const SIGNATURE_PLUGIN_ID = "signature";
const manifest = {
  id: SIGNATURE_PLUGIN_ID,
  name: "Signature Plugin",
  version: "1.0.0",
  provides: ["signature"],
  requires: ["annotation"],
  optional: [],
  defaultConfig: {
    mode: SignatureMode.SignatureOnly
  }
};
const ADD_SIGNATURE_ENTRY = "SIGNATURE/ADD_ENTRY";
const REMOVE_SIGNATURE_ENTRY = "SIGNATURE/REMOVE_ENTRY";
function addSignatureEntry(id) {
  return { type: ADD_SIGNATURE_ENTRY, payload: id };
}
function removeSignatureEntry(id) {
  return { type: REMOVE_SIGNATURE_ENTRY, payload: id };
}
const signatureStampHandlerFactory = {
  annotationType: PdfAnnotationSubtype.STAMP,
  create(context) {
    const { onPreview, onCommit, getTool, pageSize, pageRotation, getToolContext } = context;
    return {
      onPointerMove: (pos) => {
        const ctx = getToolContext();
        if (!(ctx == null ? void 0 : ctx.targetSize)) return;
        const { width, height } = ctx.targetSize;
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
        if (!tool || !(ctx == null ? void 0 : ctx.targetSize)) return;
        const { width, height } = ctx.targetSize;
        const rect = {
          origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
          size: { width, height }
        };
        let anno = {
          ...tool.defaults,
          rect,
          type: PdfAnnotationSubtype.STAMP,
          name: PdfAnnotationName.Custom,
          subject: "Signature",
          flags: tool.defaults.flags ?? ["print"],
          pageIndex: context.pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date()
        };
        if ((_a = tool.behavior) == null ? void 0 : _a.insertUpright) {
          anno = applyInsertUpright(anno, pageRotation, false);
        }
        anno = clampAnnotationToPage(anno, pageSize);
        onCommit(anno, { data: ctx.imageData });
        onPreview(null);
      },
      onPointerLeave: () => {
        onPreview(null);
      }
    };
  }
};
function translateAndScaleInk(inkData, targetSize, centerPos) {
  const scaleX = targetSize.width / inkData.size.width;
  const scaleY = targetSize.height / inkData.size.height;
  const scale = Math.min(scaleX, scaleY);
  const scaledW = inkData.size.width * scale;
  const scaledH = inkData.size.height * scale;
  const offsetX = centerPos.x - scaledW / 2;
  const offsetY = centerPos.y - scaledH / 2;
  const inkList = inkData.inkList.map((stroke) => ({
    points: stroke.points.map((p) => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY
    }))
  }));
  return { inkList, strokeWidth: Math.round(inkData.strokeWidth * scale * 10) / 10 };
}
const signatureInkHandlerFactory = {
  annotationType: PdfAnnotationSubtype.INK,
  create(context) {
    const { onPreview, onCommit, getTool, pageSize, getToolContext } = context;
    return {
      onPointerMove: (pos) => {
        const ctx = getToolContext();
        if (!(ctx == null ? void 0 : ctx.inkData) || !(ctx == null ? void 0 : ctx.targetSize)) return;
        const { inkList, strokeWidth } = translateAndScaleInk(ctx.inkData, ctx.targetSize, pos);
        const allPoints = inkList.flatMap((s) => s.points);
        if (allPoints.length === 0) return;
        const rect = expandRect(
          {
            origin: {
              x: Math.min(...allPoints.map((p) => p.x)),
              y: Math.min(...allPoints.map((p) => p.y))
            },
            size: {
              width: Math.max(...allPoints.map((p) => p.x)) - Math.min(...allPoints.map((p) => p.x)),
              height: Math.max(...allPoints.map((p) => p.y)) - Math.min(...allPoints.map((p) => p.y))
            }
          },
          strokeWidth / 2
        );
        onPreview({
          type: PdfAnnotationSubtype.INK,
          bounds: rect,
          data: {
            rect,
            inkList,
            strokeWidth,
            strokeColor: ctx.inkData.strokeColor,
            opacity: 0.5
          }
        });
      },
      onPointerDown: (pos) => {
        const tool = getTool();
        const ctx = getToolContext();
        if (!tool || !(ctx == null ? void 0 : ctx.inkData) || !(ctx == null ? void 0 : ctx.targetSize)) return;
        const { inkList, strokeWidth } = translateAndScaleInk(ctx.inkData, ctx.targetSize, pos);
        const allPoints = inkList.flatMap((s) => s.points);
        if (allPoints.length === 0) return;
        const rect = expandRect(
          {
            origin: {
              x: Math.min(...allPoints.map((p) => p.x)),
              y: Math.min(...allPoints.map((p) => p.y))
            },
            size: {
              width: Math.max(...allPoints.map((p) => p.x)) - Math.min(...allPoints.map((p) => p.x)),
              height: Math.max(...allPoints.map((p) => p.y)) - Math.min(...allPoints.map((p) => p.y))
            }
          },
          strokeWidth / 2
        );
        let anno = {
          ...tool.defaults,
          inkList,
          rect,
          strokeWidth,
          strokeColor: ctx.inkData.strokeColor,
          opacity: 1,
          type: PdfAnnotationSubtype.INK,
          subject: "Signature",
          flags: tool.defaults.flags ?? ["print"],
          pageIndex: context.pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date()
        };
        const unclamped = anno.rect;
        anno = clampAnnotationToPage(anno, pageSize);
        const dx = anno.rect.origin.x - unclamped.origin.x;
        const dy = anno.rect.origin.y - unclamped.origin.y;
        if (dx !== 0 || dy !== 0) {
          anno = {
            ...anno,
            inkList: anno.inkList.map((s) => ({
              points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
            }))
          };
        }
        onCommit(anno);
        onPreview(null);
      },
      onPointerLeave: () => {
        onPreview(null);
      }
    };
  }
};
const SIGNATURE_STAMP_TOOL_ID = "signatureStamp";
const SIGNATURE_INK_TOOL_ID = "signatureInk";
const signatureStampTool = defineAnnotationTool({
  id: SIGNATURE_STAMP_TOOL_ID,
  name: "Signature Stamp",
  labelKey: "signature.stamp",
  categories: ["annotation", "signature", "insert"],
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
  pointerHandler: signatureStampHandlerFactory
});
const signatureInkTool = defineAnnotationTool({
  id: SIGNATURE_INK_TOOL_ID,
  name: "Signature Ink",
  labelKey: "signature.ink",
  categories: ["annotation", "signature", "insert"],
  matchScore: (a) => a.type === PdfAnnotationSubtype.INK && a.subject === "Signature" ? 20 : 0,
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
    type: PdfAnnotationSubtype.INK
  },
  behavior: {
    deactivateToolAfterCreate: true,
    selectAfterCreate: true
  },
  transform: patching.patchInk,
  pointerHandler: signatureInkHandlerFactory
});
const signatureTools = [signatureStampTool, signatureInkTool];
const _SignaturePlugin = class _SignaturePlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a;
    super(id, registry);
    this.config = config;
    this.entries = /* @__PURE__ */ new Map();
    this.entriesChange$ = createEmitter();
    this.activePlacement$ = createScopedEmitter((documentId, activePlacement) => ({ documentId, activePlacement }));
    this.annotation = null;
    this.toolChangeUnsubscribe = null;
    this.currentGhostUrl = null;
    this.annotation = ((_a = registry.getPlugin("annotation")) == null ? void 0 : _a.provides()) ?? null;
    if (this.annotation) {
      for (const tool of signatureTools) {
        this.annotation.addTool(tool);
      }
      this.toolChangeUnsubscribe = this.annotation.onActiveToolChange(({ documentId, tool }) => {
        if ((tool == null ? void 0 : tool.id) !== SIGNATURE_STAMP_TOOL_ID && (tool == null ? void 0 : tool.id) !== SIGNATURE_INK_TOOL_ID) {
          this.revokeGhostUrl();
          this.activePlacement$.emit(documentId, null);
        }
      });
    }
  }
  async initialize() {
  }
  buildCapability() {
    return {
      mode: this.config.mode,
      getEntries: () => this.getEntries(),
      addEntry: (entry) => this.addEntry(entry),
      removeEntry: (id) => this.removeEntry(id),
      loadEntries: (entries) => this.loadEntries(entries),
      exportEntries: () => this.exportEntries(),
      onEntriesChange: this.entriesChange$.on,
      forDocument: (documentId) => this.createSignatureScope(documentId),
      onActivePlacementChange: this.activePlacement$.onGlobal
    };
  }
  getEntries() {
    return Array.from(this.entries.values());
  }
  addEntry(entry) {
    const id = uuidV4();
    const fullEntry = {
      ...entry,
      id,
      createdAt: Date.now()
    };
    this.entries.set(id, fullEntry);
    this.dispatch(addSignatureEntry(id));
    this.emitEntriesChange();
    return id;
  }
  removeEntry(id) {
    if (!this.entries.has(id)) return;
    this.entries.delete(id);
    this.dispatch(removeSignatureEntry(id));
    this.emitEntriesChange();
  }
  loadEntries(entries) {
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
      this.dispatch(addSignatureEntry(entry.id));
    }
    this.emitEntriesChange();
  }
  exportEntries() {
    return this.getEntries();
  }
  createSignatureScope(documentId) {
    return {
      activateSignaturePlacement: (entryId) => this.activatePlacement(documentId, entryId, SignatureFieldKind.Signature),
      activateInitialsPlacement: (entryId) => this.activatePlacement(documentId, entryId, SignatureFieldKind.Initials),
      deactivatePlacement: () => this.deactivatePlacement(documentId),
      getActivePlacement: () => this.activePlacement$.getValue(documentId) ?? null,
      onActivePlacementChange: this.activePlacement$.forScope(documentId)
    };
  }
  activatePlacement(documentId, entryId, kind) {
    const entry = this.entries.get(entryId);
    if (!entry || !this.annotation) return;
    const field = kind === SignatureFieldKind.Initials ? entry.initials : entry.signature;
    if (!field) return;
    this.revokeGhostUrl();
    if (field.creationType === SignatureCreationType.Draw) {
      if (entry.signature.creationType !== SignatureCreationType.Draw) return;
      const defaultSize = this.config.defaultSize ?? { width: 150, height: 50 };
      const referenceSize = entry.signature.inkData.size;
      const scale = Math.min(
        defaultSize.width / referenceSize.width,
        defaultSize.height / referenceSize.height
      );
      const targetSize = {
        width: field.inkData.size.width * scale,
        height: field.inkData.size.height * scale
      };
      this.annotation.setActiveTool(SIGNATURE_INK_TOOL_ID, {
        inkData: field.inkData,
        targetSize,
        entryId,
        kind
      });
    } else {
      if (!field.imageData) return;
      const ghostUrl = URL.createObjectURL(
        new Blob([field.imageData], { type: field.imageMimeType ?? "image/png" })
      );
      this.currentGhostUrl = ghostUrl;
      const defaultSize = this.config.defaultSize ?? { width: 150, height: 50 };
      let targetSize = defaultSize;
      if (field.imageSize) {
        const referenceSize = entry.signature.creationType !== SignatureCreationType.Draw ? entry.signature.imageSize ?? field.imageSize : field.imageSize;
        const scale = Math.min(
          defaultSize.width / referenceSize.width,
          defaultSize.height / referenceSize.height
        );
        targetSize = {
          width: field.imageSize.width * scale,
          height: field.imageSize.height * scale
        };
      }
      this.annotation.setActiveTool(SIGNATURE_STAMP_TOOL_ID, {
        imageData: field.imageData,
        ghostUrl,
        targetSize,
        entryId,
        kind
      });
    }
    this.activePlacement$.emit(documentId, { entryId, kind });
  }
  deactivatePlacement(documentId) {
    if (!this.annotation) return;
    this.annotation.setActiveTool(null);
    this.revokeGhostUrl();
    this.activePlacement$.emit(documentId, null);
  }
  revokeGhostUrl() {
    if (this.currentGhostUrl) {
      URL.revokeObjectURL(this.currentGhostUrl);
      this.currentGhostUrl = null;
    }
  }
  emitEntriesChange() {
    this.entriesChange$.emit(this.getEntries());
  }
  async destroy() {
    var _a;
    this.revokeGhostUrl();
    (_a = this.toolChangeUnsubscribe) == null ? void 0 : _a.call(this);
    this.entries.clear();
  }
};
_SignaturePlugin.id = SIGNATURE_PLUGIN_ID;
let SignaturePlugin = _SignaturePlugin;
const initialState = {
  entryIds: []
};
const signatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SIGNATURE_ENTRY:
      return {
        ...state,
        entryIds: [...state.entryIds, action.payload]
      };
    case REMOVE_SIGNATURE_ENTRY:
      return {
        ...state,
        entryIds: state.entryIds.filter((id) => id !== action.payload)
      };
    default:
      return state;
  }
};
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
function serializeField(field) {
  if (field.creationType === SignatureCreationType.Draw) {
    return field;
  }
  const { imageData, ...rest } = field;
  return {
    ...rest,
    imageData: imageData ? arrayBufferToBase64(imageData) : void 0
  };
}
function deserializeField(field) {
  if (field.creationType === SignatureCreationType.Draw) {
    return field;
  }
  const { imageData, ...rest } = field;
  return {
    ...rest,
    imageData: imageData ? base64ToArrayBuffer(imageData) : void 0
  };
}
function serializeEntries(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    signature: serializeField(entry.signature),
    ...entry.initials && { initials: serializeField(entry.initials) }
  }));
}
function deserializeEntries(data) {
  return data.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    signature: deserializeField(entry.signature),
    ...entry.initials && { initials: deserializeField(entry.initials) }
  }));
}
const SignaturePluginPackage = {
  manifest,
  create: (registry, config) => new SignaturePlugin(SIGNATURE_PLUGIN_ID, registry, config),
  reducer: signatureReducer,
  initialState
};
export {
  ADD_SIGNATURE_ENTRY,
  REMOVE_SIGNATURE_ENTRY,
  SIGNATURE_INK_TOOL_ID,
  SIGNATURE_PLUGIN_ID,
  SIGNATURE_STAMP_TOOL_ID,
  SignatureCreationType,
  SignatureFieldKind,
  SignatureMode,
  SignaturePlugin,
  SignaturePluginPackage,
  addSignatureEntry,
  deserializeEntries,
  initialState,
  manifest,
  removeSignatureEntry,
  serializeEntries,
  signatureReducer
};
//# sourceMappingURL=index.js.map
