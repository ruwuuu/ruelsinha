import { clamp, BasePlugin, createScopedEmitter, createBehaviorEmitter } from "@embedpdf/core";
import { PdfAnnotationSubtype, PdfAnnotationReplyType, expandRect, rectFromPoints, uuidV4, PdfAnnotationLineEnding, getRectCenter, inferRotationCenterFromRects, calculateRotatedRectAABBAroundPoint, rotateAndTranslatePoint, calculateRotatedRectAABB, rotatePointAround, rotateVertices, PdfAnnotationName, PdfVerticalAlignment, PdfTextAlignment, PdfStandardFont, PdfAnnotationBorderStyle, getImageMetadata, fitSizeWithin, PdfBlendMode, PdfPermissionFlag, ignore, PdfTaskHelper, PdfErrorCode, Task, PdfActionType, PdfZoomMode, TaskStage } from "@embedpdf/models";
import { calculateRotatedRectAABB as calculateRotatedRectAABB2, calculateRotatedRectAABBAroundPoint as calculateRotatedRectAABBAroundPoint2, getRectCenter as getRectCenter2, inferRotationCenterFromRects as inferRotationCenterFromRects2, rotatePointAround as rotatePointAround2, rotateVertices as rotateVertices2 } from "@embedpdf/models";
const ANNOTATION_PLUGIN_ID = "annotation";
const manifest = {
  id: ANNOTATION_PLUGIN_ID,
  name: "Annotation Plugin",
  version: "1.0.0",
  provides: ["annotation"],
  requires: ["interaction-manager", "selection"],
  optional: ["history", "scroll"],
  defaultConfig: {
    autoCommit: true,
    annotationAuthor: "Guest",
    deactivateToolAfterCreate: false,
    selectAfterCreate: true,
    autoOpenLinks: true
  }
};
const INIT_ANNOTATION_STATE = "ANNOTATION/INIT_STATE";
const CLEANUP_ANNOTATION_STATE = "ANNOTATION/CLEANUP_STATE";
const SET_ACTIVE_DOCUMENT = "ANNOTATION/SET_ACTIVE_DOCUMENT";
const SET_ANNOTATIONS = "ANNOTATION/SET_ANNOTATIONS";
const SELECT_ANNOTATION = "ANNOTATION/SELECT_ANNOTATION";
const DESELECT_ANNOTATION = "ANNOTATION/DESELECT_ANNOTATION";
const ADD_TO_SELECTION = "ANNOTATION/ADD_TO_SELECTION";
const REMOVE_FROM_SELECTION = "ANNOTATION/REMOVE_FROM_SELECTION";
const SET_SELECTION = "ANNOTATION/SET_SELECTION";
const SET_ACTIVE_TOOL_ID = "ANNOTATION/SET_ACTIVE_TOOL_ID";
const CREATE_ANNOTATION = "ANNOTATION/CREATE_ANNOTATION";
const PATCH_ANNOTATION = "ANNOTATION/PATCH_ANNOTATION";
const MOVE_ANNOTATION = "ANNOTATION/MOVE_ANNOTATION";
const DELETE_ANNOTATION = "ANNOTATION/DELETE_ANNOTATION";
const COMMIT_PENDING_CHANGES = "ANNOTATION/COMMIT";
const PURGE_ANNOTATION = "ANNOTATION/PURGE_ANNOTATION";
const SET_LOCKED = "ANNOTATION/SET_LOCKED";
const SYNC_ANNOTATION_OBJECT = "ANNOTATION/SYNC_OBJECT";
const ADD_COLOR_PRESET = "ANNOTATION/ADD_COLOR_PRESET";
const SET_TOOL_DEFAULTS = "ANNOTATION/SET_TOOL_DEFAULTS";
const ADD_TOOL = "ANNOTATION/ADD_TOOL";
function initAnnotationState(documentId, state) {
  return { type: INIT_ANNOTATION_STATE, payload: { documentId, state } };
}
function cleanupAnnotationState(documentId) {
  return { type: CLEANUP_ANNOTATION_STATE, payload: documentId };
}
const setAnnotations = (documentId, annotations) => ({
  type: SET_ANNOTATIONS,
  payload: { documentId, annotations }
});
const selectAnnotation = (documentId, pageIndex, id) => ({
  type: SELECT_ANNOTATION,
  payload: { documentId, pageIndex, id }
});
const deselectAnnotation = (documentId) => ({
  type: DESELECT_ANNOTATION,
  payload: { documentId }
});
const addToSelection = (documentId, pageIndex, id) => ({
  type: ADD_TO_SELECTION,
  payload: { documentId, pageIndex, id }
});
const removeFromSelection = (documentId, id) => ({
  type: REMOVE_FROM_SELECTION,
  payload: { documentId, id }
});
const setSelection = (documentId, ids) => ({
  type: SET_SELECTION,
  payload: { documentId, ids }
});
const setActiveToolId = (documentId, toolId, context) => ({
  type: SET_ACTIVE_TOOL_ID,
  payload: { documentId, toolId, context }
});
const createAnnotation = (documentId, pageIndex, annotation) => ({
  type: CREATE_ANNOTATION,
  payload: { documentId, pageIndex, annotation }
});
const patchAnnotation = (documentId, pageIndex, id, patch) => ({
  type: PATCH_ANNOTATION,
  payload: { documentId, pageIndex, id, patch }
});
const moveAnnotation = (documentId, pageIndex, id, patch) => ({
  type: MOVE_ANNOTATION,
  payload: { documentId, pageIndex, id, patch }
});
const deleteAnnotation = (documentId, pageIndex, id) => ({
  type: DELETE_ANNOTATION,
  payload: { documentId, pageIndex, id }
});
const commitPendingChanges = (documentId, committedUids) => ({
  type: COMMIT_PENDING_CHANGES,
  payload: { documentId, committedUids }
});
const purgeAnnotation = (documentId, pageIndex, uid) => ({
  type: PURGE_ANNOTATION,
  payload: { documentId, pageIndex, uid }
});
const setLockedAction = (documentId, mode) => ({
  type: SET_LOCKED,
  payload: { documentId, mode }
});
const syncAnnotationObject = (documentId, id, patch) => ({
  type: SYNC_ANNOTATION_OBJECT,
  payload: { documentId, id, patch }
});
const addColorPreset = (c) => ({
  type: ADD_COLOR_PRESET,
  payload: c
});
const setToolDefaults = (toolId, patch) => ({
  type: SET_TOOL_DEFAULTS,
  payload: { toolId, patch }
});
const addTool = (tool) => ({
  type: ADD_TOOL,
  payload: tool
});
var LockModeType = /* @__PURE__ */ ((LockModeType2) => {
  LockModeType2["None"] = "none";
  LockModeType2["All"] = "all";
  LockModeType2["Include"] = "include";
  LockModeType2["Exclude"] = "exclude";
  return LockModeType2;
})(LockModeType || {});
function rectsIntersect(a, b) {
  return !(a.origin.x + a.size.width < b.origin.x || b.origin.x + b.size.width < a.origin.x || a.origin.y + a.size.height < b.origin.y || b.origin.y + b.size.height < a.origin.y);
}
function isInk(a) {
  return a.object.type === PdfAnnotationSubtype.INK;
}
function isCircle(a) {
  return a.object.type === PdfAnnotationSubtype.CIRCLE;
}
function isPolygon(a) {
  return a.object.type === PdfAnnotationSubtype.POLYGON;
}
function isSquare(a) {
  return a.object.type === PdfAnnotationSubtype.SQUARE;
}
function isLine(a) {
  return a.object.type === PdfAnnotationSubtype.LINE;
}
function isPolyline(a) {
  return a.object.type === PdfAnnotationSubtype.POLYLINE;
}
function isHighlight(a) {
  return a.object.type === PdfAnnotationSubtype.HIGHLIGHT;
}
function isUnderline(a) {
  return a.object.type === PdfAnnotationSubtype.UNDERLINE;
}
function isStrikeout(a) {
  return a.object.type === PdfAnnotationSubtype.STRIKEOUT;
}
function isSquiggly(a) {
  return a.object.type === PdfAnnotationSubtype.SQUIGGLY;
}
function isTextMarkup(a) {
  return isHighlight(a) || isUnderline(a) || isStrikeout(a) || isSquiggly(a);
}
function isFreeText(a) {
  return a.object.type === PdfAnnotationSubtype.FREETEXT;
}
function isStamp(a) {
  return a.object.type === PdfAnnotationSubtype.STAMP;
}
function isText(a) {
  return a.object.type === PdfAnnotationSubtype.TEXT;
}
function isLink(a) {
  return a.object.type === PdfAnnotationSubtype.LINK;
}
function isRedact(a) {
  return a.object.type === PdfAnnotationSubtype.REDACT;
}
function isCaret(a) {
  return a.object.type === PdfAnnotationSubtype.CARET;
}
function isWidget(a) {
  return a.object.type === PdfAnnotationSubtype.WIDGET;
}
function isSidebarAnnotation(a) {
  return isText(a) && !a.object.inReplyToId || isTextMarkup(a) || isInk(a) || isSquare(a) || isCircle(a) || isPolygon(a) || isLine(a) || isPolyline(a) || isFreeText(a) || isStamp(a) || isRedact(a) || isCaret(a);
}
function isSelectableAnnotation(a) {
  return isSidebarAnnotation(a) || isWidget(a);
}
function getAnnotationCategories(tool) {
  return (tool == null ? void 0 : tool.categories) ?? [];
}
function isCategoryLocked(categories, mode) {
  switch (mode.type) {
    case LockModeType.None:
      return false;
    case LockModeType.All:
      return true;
    case LockModeType.Include:
      if (categories.length === 0) return false;
      return categories.some((cat) => mode.categories.includes(cat));
    case LockModeType.Exclude:
      if (categories.length === 0) return true;
      return !categories.some((cat) => mode.categories.includes(cat));
  }
}
function hasLockedFlag(annotation) {
  var _a;
  return ((_a = annotation.flags) == null ? void 0 : _a.includes("locked")) ?? false;
}
function hasNoViewFlag(annotation) {
  var _a;
  return ((_a = annotation.flags) == null ? void 0 : _a.includes("noView")) ?? false;
}
function hasHiddenFlag(annotation) {
  var _a;
  return ((_a = annotation.flags) == null ? void 0 : _a.includes("hidden")) ?? false;
}
function hasReadOnlyFlag(annotation) {
  var _a;
  return ((_a = annotation.flags) == null ? void 0 : _a.includes("readOnly")) ?? false;
}
function hasLockedContentsFlag(annotation) {
  var _a;
  return ((_a = annotation.flags) == null ? void 0 : _a.includes("lockedContents")) ?? false;
}
const getAnnotationsByPageIndex = (s, page) => (s.pages[page] ?? []).map((uid) => s.byUid[uid]);
const getAnnotations = (s) => {
  const out = {};
  for (const p of Object.keys(s.pages).map(Number)) out[p] = getAnnotationsByPageIndex(s, p);
  return out;
};
const getSelectedAnnotation = (s) => s.selectedUids.length > 0 ? s.byUid[s.selectedUids[0]] ?? null : null;
const getSelectedAnnotations = (s) => s.selectedUids.map((uid) => s.byUid[uid]).filter((ta) => ta !== void 0);
const getSelectedAnnotationIds = (s) => s.selectedUids;
const getAnnotationByUid = (s, uid) => s.byUid[uid] ?? null;
const getSelectedAnnotationByPageIndex = (s, pageIndex) => {
  const pageUids = s.pages[pageIndex] ?? [];
  for (const uid of s.selectedUids) {
    if (pageUids.includes(uid)) {
      return s.byUid[uid] ?? null;
    }
  }
  return null;
};
const getSelectedAnnotationsByPageIndex = (s, pageIndex) => {
  const pageUids = new Set(s.pages[pageIndex] ?? []);
  return s.selectedUids.filter((uid) => pageUids.has(uid)).map((uid) => s.byUid[uid]).filter((ta) => ta !== void 0);
};
const isAnnotationSelected = (s, id) => s.selectedUids.includes(id);
const hasMultipleSelected = (s) => s.selectedUids.length > 1;
function getToolDefaultsById(state, toolId) {
  const tool = state.tools.find((t) => t.id === toolId);
  return tool == null ? void 0 : tool.defaults;
}
const getSidebarAnnotationsWithRepliesGroupedByPage = (s) => {
  const repliesByParent = {};
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && isText(ta)) {
        const parentId = ta.object.inReplyToId;
        if (parentId) (repliesByParent[parentId] || (repliesByParent[parentId] = [])).push(ta);
      }
    }
  }
  const membersByLeader = {};
  const consumedAsGroupMember = /* @__PURE__ */ new Set();
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && ta.object.inReplyToId && ta.object.replyType === PdfAnnotationReplyType.Group && ta.object.type !== PdfAnnotationSubtype.LINK && isSidebarAnnotation(ta)) {
        const leaderId = ta.object.inReplyToId;
        (membersByLeader[leaderId] || (membersByLeader[leaderId] = [])).push(ta);
        consumedAsGroupMember.add(ta.object.id);
      }
    }
  }
  const out = {};
  for (const [pageStr, uidList] of Object.entries(s.pages)) {
    const page = Number(pageStr);
    const pageAnnotations = [];
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (!ta || !isSidebarAnnotation(ta)) continue;
      if (consumedAsGroupMember.has(ta.object.id)) continue;
      const members = membersByLeader[ta.object.id];
      pageAnnotations.push({
        page,
        annotation: ta,
        replies: repliesByParent[ta.object.id] ?? [],
        ...members && members.length > 0 ? { groupMembers: members } : {}
      });
    }
    if (pageAnnotations.length > 0) {
      out[page] = pageAnnotations;
    }
  }
  return out;
};
const getSidebarAnnotationsWithReplies = (s) => {
  const grouped = getSidebarAnnotationsWithRepliesGroupedByPage(s);
  const out = [];
  const sortedPages = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  for (const page of sortedPages) {
    out.push(...grouped[page]);
  }
  return out;
};
const getIRTChildIds = (s, parentId) => {
  const children = [];
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && "inReplyToId" in ta.object && ta.object.inReplyToId === parentId) {
        children.push({ id: ta.object.id, pageIndex: ta.object.pageIndex });
      }
    }
  }
  return children;
};
const hasIRTChildren = (s, parentId) => {
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && "inReplyToId" in ta.object && ta.object.inReplyToId === parentId) {
        return true;
      }
    }
  }
  return false;
};
const getIRTChildrenByType = (s, parentId, types) => {
  const children = [];
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && "inReplyToId" in ta.object && ta.object.inReplyToId === parentId && types.includes(ta.object.type)) {
        children.push(ta);
      }
    }
  }
  return children;
};
const getAttachedLinks = (s, parentId) => getIRTChildrenByType(s, parentId, [PdfAnnotationSubtype.LINK]);
const hasAttachedLinks = (s, parentId) => getAttachedLinks(s, parentId).length > 0;
const getGroupLeaderId = (s, annotationId) => {
  const ta = s.byUid[annotationId];
  if (!ta) return void 0;
  if (ta.object.inReplyToId && ta.object.replyType === PdfAnnotationReplyType.Group) {
    return ta.object.inReplyToId;
  }
  return annotationId;
};
const getGroupMembers = (s, annotationId) => {
  const leaderId = getGroupLeaderId(s, annotationId);
  if (!leaderId) return [];
  const members = [];
  const leader = s.byUid[leaderId];
  if (leader && leader.object.type !== PdfAnnotationSubtype.LINK) {
    members.push(leader);
  }
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const ta = s.byUid[uid];
      if (ta && ta.object.inReplyToId === leaderId && ta.object.replyType === PdfAnnotationReplyType.Group && ta.object.type !== PdfAnnotationSubtype.LINK) {
        members.push(ta);
      }
    }
  }
  return members;
};
const isInGroup = (s, annotationId) => {
  const ta = s.byUid[annotationId];
  if (!ta) return false;
  if (ta.object.type === PdfAnnotationSubtype.LINK) {
    return false;
  }
  if (ta.object.inReplyToId && ta.object.replyType === PdfAnnotationReplyType.Group) {
    return true;
  }
  for (const uidList of Object.values(s.pages)) {
    for (const uid of uidList) {
      const other = s.byUid[uid];
      if (other && other.object.inReplyToId === annotationId && other.object.replyType === PdfAnnotationReplyType.Group && other.object.type !== PdfAnnotationSubtype.LINK) {
        return true;
      }
    }
  }
  return false;
};
const getSelectionGroupingAction = (s) => {
  const selected = getSelectedAnnotations(s);
  if (selected.length === 0) return "disabled";
  const firstId = selected[0].object.id;
  if (isInGroup(s, firstId)) {
    const members = getGroupMembers(s, firstId);
    const memberIds = new Set(members.map((m) => m.object.id));
    if (selected.every((ta) => memberIds.has(ta.object.id))) {
      return "ungroup";
    }
  }
  return selected.length >= 2 ? "group" : "disabled";
};
function useState(initialValue) {
  let value = initialValue;
  const getValue = () => value;
  const setValue = (newValue) => {
    value = newValue;
  };
  return [getValue, setValue];
}
function isLineLike(points, threshold) {
  if (points.length < 3) return true;
  const A = points[0];
  const B = points[points.length - 1];
  const len = Math.hypot(B.x - A.x, B.y - A.y);
  if (len < 5) return false;
  const maxDev = points.reduce((max, P) => {
    const d = Math.abs((B.x - A.x) * (A.y - P.y) - (A.x - P.x) * (B.y - A.y)) / len;
    return Math.max(max, d);
  }, 0);
  return maxDev / len < threshold;
}
const inkHandlerFactory = {
  annotationType: PdfAnnotationSubtype.INK,
  create(context) {
    const { onCommit, onPreview, getTool, pageSize } = context;
    const [getStrokes, setStrokes] = useState([]);
    const [getIsDrawing, setIsDrawing] = useState(false);
    const timerRef = { current: null };
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        strokeColor: tool.defaults.strokeColor ?? tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const getPreview = () => {
      const strokes = getStrokes();
      if (strokes.length === 0 || strokes[0].points.length === 0) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const allPoints = strokes.flatMap((s) => s.points);
      const bounds = expandRect(rectFromPoints(allPoints), defaults.strokeWidth / 2);
      return {
        type: PdfAnnotationSubtype.INK,
        bounds,
        data: {
          ...defaults,
          rect: bounds,
          inkList: strokes,
          blendMode: defaults.blendMode
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setIsDrawing(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        const newStrokes = [...getStrokes(), { points: [clampedPos] }];
        setStrokes(newStrokes);
        onPreview(getPreview());
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        if (!getIsDrawing()) return;
        const strokes = getStrokes();
        if (strokes.length === 0) return;
        const clampedPos = clampToPage(pos);
        strokes[strokes.length - 1].points.push(clampedPos);
        setStrokes(strokes);
        onPreview(getPreview());
      },
      onPointerUp: (_, evt) => {
        var _a;
        setIsDrawing(false);
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
        const tool = getTool();
        const behavior = tool == null ? void 0 : tool.behavior;
        if (behavior == null ? void 0 : behavior.smartLineRecognition) {
          const threshold = behavior.smartLineThreshold ?? 0.15;
          const strokes = getStrokes();
          const last = strokes[strokes.length - 1];
          if (last && last.points.length > 1 && isLineLike(last.points, threshold)) {
            const first = last.points[0];
            const end = last.points[last.points.length - 1];
            const dx = end.x - first.x;
            const dy = end.y - first.y;
            const angleDeg = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI);
            const snapAngleDeg = behavior.snapAngleDeg ?? 15;
            if (angleDeg <= snapAngleDeg) {
              const avgY = last.points.reduce((sum, p) => sum + p.y, 0) / last.points.length;
              last.points = [
                { x: first.x, y: avgY },
                { x: end.x, y: avgY }
              ];
            } else if (angleDeg >= 90 - snapAngleDeg) {
              const avgX = last.points.reduce((sum, p) => sum + p.x, 0) / last.points.length;
              last.points = [
                { x: avgX, y: first.y },
                { x: avgX, y: end.y }
              ];
            }
            setStrokes([...strokes]);
            onPreview(getPreview());
          }
        }
        const commitDelay = (behavior == null ? void 0 : behavior.commitDelay) ?? 800;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          const strokes = getStrokes();
          if (strokes.length > 0 && strokes[0].points.length > 1) {
            const defaults = getDefaults();
            if (!defaults) return;
            const allPoints = strokes.flatMap((s) => s.points);
            const rect = expandRect(rectFromPoints(allPoints), defaults.strokeWidth / 2);
            onCommit({
              ...defaults,
              inkList: strokes,
              rect,
              type: PdfAnnotationSubtype.INK,
              pageIndex: context.pageIndex,
              id: uuidV4(),
              created: /* @__PURE__ */ new Date()
            });
          }
          setStrokes([]);
          onPreview(null);
        }, commitDelay);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStrokes([]);
        setIsDrawing(false);
        onPreview(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
function createArrowHandler(isClosed) {
  const calculateGeometry = (sw) => {
    const len = sw * 9;
    const a = Math.PI / 6;
    return {
      x: -len * Math.cos(a),
      y: len * Math.sin(a)
    };
  };
  return {
    getSvgPath: (sw) => {
      const { x, y } = calculateGeometry(sw);
      return isClosed ? `M 0 0 L ${x} ${y} L ${x} ${-y} Z` : `M ${x} ${y} L 0 0 L ${x} ${-y}`;
    },
    getLocalPoints: (sw) => {
      const { x, y } = calculateGeometry(sw);
      return [
        { x: 0, y: 0 },
        { x, y },
        { x, y: -y }
      ];
    },
    getRotation: (segmentAngle) => segmentAngle,
    filled: isClosed
  };
}
function createLineHandler(lengthFactor, rotationFn) {
  const getHalfLength = (sw) => sw * lengthFactor / 2;
  return {
    getSvgPath: (sw) => {
      const l = getHalfLength(sw);
      return `M ${-l} 0 L ${l} 0`;
    },
    getLocalPoints: (sw) => {
      const l = getHalfLength(sw);
      return [
        { x: -l, y: 0 },
        { x: l, y: 0 }
      ];
    },
    getRotation: rotationFn,
    filled: false
  };
}
const OpenArrowHandler = createArrowHandler(false);
const ClosedArrowHandler = createArrowHandler(true);
const LINE_ENDING_HANDLERS = {
  [PdfAnnotationLineEnding.OpenArrow]: OpenArrowHandler,
  [PdfAnnotationLineEnding.ClosedArrow]: ClosedArrowHandler,
  [PdfAnnotationLineEnding.ROpenArrow]: {
    ...OpenArrowHandler,
    getRotation: (segmentAngle) => segmentAngle + Math.PI
  },
  [PdfAnnotationLineEnding.RClosedArrow]: {
    ...ClosedArrowHandler,
    getRotation: (segmentAngle) => segmentAngle + Math.PI
  },
  [PdfAnnotationLineEnding.Circle]: {
    getSvgPath: (sw) => {
      const r2 = sw * 5 / 2;
      return `M ${r2} 0 A ${r2} ${r2} 0 1 1 ${-r2} 0 A ${r2} ${r2} 0 1 1 ${r2} 0`;
    },
    getLocalPoints: (sw) => {
      const r2 = sw * 5 / 2;
      return [
        { x: -r2, y: -r2 },
        { x: r2, y: r2 }
      ];
    },
    getRotation: () => 0,
    filled: true
  },
  [PdfAnnotationLineEnding.Square]: {
    getSvgPath: (sw) => {
      const h = sw * 6 / 2;
      return `M ${-h} ${-h} L ${h} ${-h} L ${h} ${h} L ${-h} ${h} Z`;
    },
    getLocalPoints: (sw) => {
      const h = sw * 6 / 2;
      return [
        { x: -h, y: -h },
        // TL
        { x: h, y: -h },
        // TR
        { x: h, y: h },
        // BR
        { x: -h, y: h }
        // BL
      ];
    },
    getRotation: (segmentAngle) => segmentAngle,
    // keep your new orientation
    filled: true
  },
  [PdfAnnotationLineEnding.Diamond]: {
    getSvgPath: (sw) => {
      const h = sw * 6 / 2;
      return `M 0 ${-h} L ${h} 0 L 0 ${h} L ${-h} 0 Z`;
    },
    getLocalPoints: (sw) => {
      const h = sw * 6 / 2;
      return [
        { x: 0, y: -h },
        { x: h, y: 0 },
        { x: 0, y: h },
        { x: -h, y: 0 }
      ];
    },
    getRotation: (segmentAngle) => segmentAngle,
    filled: true
  },
  [PdfAnnotationLineEnding.Butt]: createLineHandler(6, (angle) => angle + Math.PI / 2),
  [PdfAnnotationLineEnding.Slash]: createLineHandler(18, (angle) => angle + Math.PI / 1.5)
};
const EXTRA_PADDING = 1.2;
function calculateAABBFromVertices(vertices, padding = 0) {
  if (vertices.length === 0) {
    return { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
  }
  const baseRect = rectFromPoints(vertices);
  return padding > 0 ? expandRect(baseRect, padding) : baseRect;
}
function lineRectWithEndings(vertices, strokeWidth, endings) {
  if (!vertices || vertices.length === 0) {
    return { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
  }
  const allPoints = [...vertices];
  const toAngle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const processEnding = (endingType, tipPos, segmentAngle) => {
    if (!endingType) return;
    const handler = LINE_ENDING_HANDLERS[endingType];
    if (!handler) return;
    const localPts = handler.getLocalPoints(strokeWidth);
    const rotationAngle = handler.getRotation(segmentAngle);
    const transformedPts = localPts.map((p) => rotateAndTranslatePoint(p, rotationAngle, tipPos));
    allPoints.push(...transformedPts);
  };
  if (vertices.length >= 2) {
    const startAngle = toAngle(vertices[1], vertices[0]);
    processEnding(endings == null ? void 0 : endings.start, vertices[0], startAngle);
    const lastIdx = vertices.length - 1;
    const endAngle = toAngle(vertices[lastIdx - 1], vertices[lastIdx]);
    processEnding(endings == null ? void 0 : endings.end, vertices[lastIdx], endAngle);
  }
  if (allPoints.length <= 1) {
    const point = vertices[0] || { x: 0, y: 0 };
    const pad2 = strokeWidth;
    return {
      origin: { x: point.x - pad2, y: point.y - pad2 },
      size: { width: pad2 * 2, height: pad2 * 2 }
    };
  }
  const baseRect = rectFromPoints(allPoints);
  const pad = strokeWidth / 2 + EXTRA_PADDING * strokeWidth;
  return expandRect(baseRect, pad);
}
function resolveVertexEditRects(original, tightRect) {
  if (!original.unrotatedRect) return { rect: tightRect };
  const center = getRectCenter(tightRect);
  return {
    rect: calculateRotatedRectAABBAroundPoint(tightRect, original.rotation ?? 0, center),
    unrotatedRect: tightRect
  };
}
function resolveAnnotationRotationCenter(original) {
  if (!original.unrotatedRect) return getRectCenter(original.rect);
  return inferRotationCenterFromRects(
    original.unrotatedRect,
    original.rect,
    original.rotation ?? 0
  );
}
function resolveRotateRects(original, nextUnrotatedRect, angleDegrees) {
  const baseCenter = resolveAnnotationRotationCenter(original);
  const baseRect = original.unrotatedRect ?? original.rect;
  const translation = {
    x: nextUnrotatedRect.origin.x - baseRect.origin.x,
    y: nextUnrotatedRect.origin.y - baseRect.origin.y
  };
  const nextCenter = {
    x: baseCenter.x + translation.x,
    y: baseCenter.y + translation.y
  };
  return {
    rect: calculateRotatedRectAABBAroundPoint(nextUnrotatedRect, angleDegrees, nextCenter),
    unrotatedRect: nextUnrotatedRect
  };
}
function compensateRotatedVertexEdit(original, vertices, tightRect) {
  if (!original.unrotatedRect) return vertices;
  const angle = original.rotation ?? 0;
  if (Math.abs(angle % 360) < 1e-8) return vertices;
  const baseCenter = resolveAnnotationRotationCenter(original);
  const nextCenter = getRectCenter(tightRect);
  const rad = angle * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = baseCenter.x - nextCenter.x;
  const dy = baseCenter.y - nextCenter.y;
  const qx = (1 - cos) * dx + sin * dy;
  const qy = -sin * dx + (1 - cos) * dy;
  if (Math.abs(qx) < 1e-8 && Math.abs(qy) < 1e-8) return vertices;
  return vertices.map((v) => ({ x: v.x + qx, y: v.y + qy }));
}
function computeTextBoxFromRD(rect, rd) {
  if (!rd) return rect;
  return {
    origin: { x: rect.origin.x + rd.left, y: rect.origin.y + rd.top },
    size: {
      width: Math.max(0, rect.size.width - rd.left - rd.right),
      height: Math.max(0, rect.size.height - rd.top - rd.bottom)
    }
  };
}
function computeRDFromTextBox(overallRect, textBox) {
  return {
    left: textBox.origin.x - overallRect.origin.x,
    top: textBox.origin.y - overallRect.origin.y,
    right: overallRect.origin.x + overallRect.size.width - (textBox.origin.x + textBox.size.width),
    bottom: overallRect.origin.y + overallRect.size.height - (textBox.origin.y + textBox.size.height)
  };
}
function computeCalloutConnectionPoint(knee, textBox) {
  const cx = textBox.origin.x + textBox.size.width / 2;
  const cy = textBox.origin.y + textBox.size.height / 2;
  const dx = knee.x - cx;
  const dy = knee.y - cy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? { x: textBox.origin.x + textBox.size.width, y: cy } : { x: textBox.origin.x, y: cy };
  }
  return dy > 0 ? { x: cx, y: textBox.origin.y + textBox.size.height } : { x: cx, y: textBox.origin.y };
}
function computeCalloutOverallRect(textBox, calloutLine, lineEnding, strokeWidth) {
  const linePoints = [...calloutLine];
  if (lineEnding && calloutLine.length >= 2) {
    const handler = LINE_ENDING_HANDLERS[lineEnding];
    if (handler) {
      const angle = Math.atan2(
        calloutLine[1].y - calloutLine[0].y,
        calloutLine[1].x - calloutLine[0].x
      );
      const localPts = handler.getLocalPoints(strokeWidth);
      const rotationAngle = handler.getRotation(angle + Math.PI);
      const transformed = localPts.map(
        (p) => rotateAndTranslatePoint(p, rotationAngle, calloutLine[0])
      );
      linePoints.push(...transformed);
    }
  }
  const lineBbox = expandRect(rectFromPoints(linePoints), strokeWidth);
  const tbRight = textBox.origin.x + textBox.size.width;
  const tbBottom = textBox.origin.y + textBox.size.height;
  const lnRight = lineBbox.origin.x + lineBbox.size.width;
  const lnBottom = lineBbox.origin.y + lineBbox.size.height;
  const minX = Math.min(textBox.origin.x, lineBbox.origin.x);
  const minY = Math.min(textBox.origin.y, lineBbox.origin.y);
  const maxX = Math.max(tbRight, lnRight);
  const maxY = Math.max(tbBottom, lnBottom);
  return {
    origin: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY }
  };
}
const calloutVertexConfig = {
  extractVertices: (a) => {
    const textBox = computeTextBoxFromRD(a.rect, a.rectangleDifferences);
    const cl = a.calloutLine;
    if (!cl || cl.length < 3) {
      return [
        { x: a.rect.origin.x, y: a.rect.origin.y },
        { x: a.rect.origin.x, y: a.rect.origin.y },
        { x: textBox.origin.x, y: textBox.origin.y },
        { x: textBox.origin.x + textBox.size.width, y: textBox.origin.y + textBox.size.height }
      ];
    }
    return [
      cl[0],
      cl[1],
      { x: textBox.origin.x, y: textBox.origin.y },
      { x: textBox.origin.x + textBox.size.width, y: textBox.origin.y + textBox.size.height }
    ];
  },
  transformAnnotation: (a, vertices) => {
    if (vertices.length < 4) return {};
    const [arrowTip, knee, tbTL, tbBR] = vertices;
    const textBox = {
      origin: { x: Math.min(tbTL.x, tbBR.x), y: Math.min(tbTL.y, tbBR.y) },
      size: {
        width: Math.abs(tbBR.x - tbTL.x),
        height: Math.abs(tbBR.y - tbTL.y)
      }
    };
    const connectionPoint = computeCalloutConnectionPoint(knee, textBox);
    const calloutLine = [arrowTip, knee, connectionPoint];
    const overallRect = computeCalloutOverallRect(
      textBox,
      calloutLine,
      a.lineEnding,
      a.strokeWidth ?? 1
    );
    return {
      calloutLine,
      rect: overallRect,
      rectangleDifferences: computeRDFromTextBox(overallRect, textBox)
    };
  }
};
function createEnding(ending, strokeWidth, rad, px, py) {
  if (!ending) return null;
  const handler = LINE_ENDING_HANDLERS[ending];
  if (!handler) return null;
  const toDeg = (r2) => r2 * 180 / Math.PI;
  const rotationAngle = handler.getRotation(rad);
  return {
    d: handler.getSvgPath(strokeWidth),
    transform: `translate(${px} ${py}) rotate(${toDeg(rotationAngle)})`,
    filled: handler.filled
  };
}
class PatchRegistry {
  constructor() {
    this.patches = /* @__PURE__ */ new Map();
  }
  register(type, patchFn) {
    this.patches.set(type, patchFn);
  }
  /**
   * Transform an annotation based on the context.
   * Returns the transformed properties or just the changes if no patch function exists.
   */
  transform(annotation, context) {
    const patchFn = this.patches.get(annotation.type);
    if (patchFn) {
      return patchFn(annotation, context);
    }
    return context.changes;
  }
}
const patchRegistry = new PatchRegistry();
function baseRotateChanges(orig, ctx) {
  var _a;
  if (((_a = ctx.metadata) == null ? void 0 : _a.rotationAngle) === void 0) return null;
  const angleDegrees = ctx.metadata.rotationAngle;
  const baseUnrotatedRect = ctx.changes.unrotatedRect ?? orig.unrotatedRect ?? orig.rect;
  const normalizedUnrotatedRect = {
    origin: { ...baseUnrotatedRect.origin },
    size: { ...baseUnrotatedRect.size }
  };
  return {
    ...resolveRotateRects(orig, normalizedUnrotatedRect, angleDegrees),
    rotation: angleDegrees
  };
}
function basePropertyRotationChanges(orig, newRotation) {
  const unrotatedRect = orig.unrotatedRect ?? orig.rect;
  return {
    rotation: newRotation,
    ...resolveRotateRects(orig, unrotatedRect, newRotation)
  };
}
function baseMoveChanges(orig, newRect) {
  const dx = newRect.origin.x - orig.rect.origin.x;
  const dy = newRect.origin.y - orig.rect.origin.y;
  const rects = { rect: newRect };
  if (orig.unrotatedRect) {
    rects.unrotatedRect = {
      origin: { x: orig.unrotatedRect.origin.x + dx, y: orig.unrotatedRect.origin.y + dy },
      size: { ...orig.unrotatedRect.size }
    };
  }
  return { dx, dy, rects };
}
function baseResizeScaling(orig, newRect, metadata) {
  const oldRect = orig.unrotatedRect ?? orig.rect;
  let scaleX = newRect.size.width / oldRect.size.width;
  let scaleY = newRect.size.height / oldRect.size.height;
  const minSize = 10;
  if (newRect.size.width < minSize || newRect.size.height < minSize) {
    scaleX = Math.max(scaleX, minSize / oldRect.size.width);
    scaleY = Math.max(scaleY, minSize / oldRect.size.height);
    newRect = {
      origin: newRect.origin,
      size: {
        width: oldRect.size.width * scaleX,
        height: oldRect.size.height * scaleY
      }
    };
  }
  if (metadata == null ? void 0 : metadata.maintainAspectRatio) {
    const minScale = Math.min(scaleX, scaleY);
    scaleX = minScale;
    scaleY = minScale;
    newRect = {
      origin: newRect.origin,
      size: {
        width: oldRect.size.width * minScale,
        height: oldRect.size.height * minScale
      }
    };
  }
  const rects = orig.unrotatedRect ? {
    unrotatedRect: newRect,
    rect: calculateRotatedRectAABB(newRect, orig.rotation ?? 0)
  } : { rect: newRect };
  return { scaleX, scaleY, oldRect, resolvedRect: newRect, rects };
}
function rotateOrbitDelta(orig, rotateResult) {
  const baseRect = orig.unrotatedRect ?? orig.rect;
  const newRect = rotateResult.unrotatedRect ?? baseRect;
  return {
    dx: newRect.origin.x - baseRect.origin.x,
    dy: newRect.origin.y - baseRect.origin.y
  };
}
function applyInsertUpright(annotation, pageRotation, rectWasDrawn) {
  if (pageRotation === 0 || annotation.rotation !== void 0) return annotation;
  const counterDeg = (4 - pageRotation) % 4 * 90;
  let baseAnnotation = annotation;
  if (rectWasDrawn && (pageRotation === 1 || pageRotation === 3)) {
    const originalRect = annotation.rect;
    const centerX = originalRect.origin.x + originalRect.size.width / 2;
    const centerY = originalRect.origin.y + originalRect.size.height / 2;
    baseAnnotation = {
      ...annotation,
      rect: {
        origin: {
          x: centerX - originalRect.size.height / 2,
          y: centerY - originalRect.size.width / 2
        },
        size: {
          width: originalRect.size.height,
          height: originalRect.size.width
        }
      }
    };
  }
  const { rotation, rect, unrotatedRect } = basePropertyRotationChanges(baseAnnotation, counterDeg);
  return { ...baseAnnotation, rotation, rect, unrotatedRect };
}
function clampAnnotationToPage(annotation, pageSize) {
  const clampedX = clamp(annotation.rect.origin.x, 0, pageSize.width - annotation.rect.size.width);
  const clampedY = clamp(
    annotation.rect.origin.y,
    0,
    pageSize.height - annotation.rect.size.height
  );
  const shiftX = clampedX - annotation.rect.origin.x;
  const shiftY = clampedY - annotation.rect.origin.y;
  if (shiftX === 0 && shiftY === 0) return annotation;
  return {
    ...annotation,
    rect: { origin: { x: clampedX, y: clampedY }, size: annotation.rect.size },
    ...annotation.unrotatedRect ? {
      unrotatedRect: {
        origin: {
          x: annotation.unrotatedRect.origin.x + shiftX,
          y: annotation.unrotatedRect.origin.y + shiftY
        },
        size: annotation.unrotatedRect.size
      }
    } : {}
  };
}
const patchInk = (original, ctx) => {
  switch (ctx.type) {
    case "vertex-edit":
      return ctx.changes;
    case "move": {
      if (!ctx.changes.rect) return ctx.changes;
      const { dx, dy, rects } = baseMoveChanges(original, ctx.changes.rect);
      return {
        ...rects,
        inkList: original.inkList.map((stroke) => ({
          points: stroke.points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
        }))
      };
    }
    case "resize": {
      if (!ctx.changes.rect) return ctx.changes;
      const { scaleX, scaleY, oldRect, resolvedRect, rects } = baseResizeScaling(
        original,
        ctx.changes.rect,
        ctx.metadata
      );
      const inset = (r2, pad) => ({
        origin: { x: r2.origin.x + pad, y: r2.origin.y + pad },
        size: {
          width: Math.max(1, r2.size.width - pad * 2),
          height: Math.max(1, r2.size.height - pad * 2)
        }
      });
      const resizeEpsilon = 1e-3;
      const widthChanged = Math.abs(scaleX - 1) > resizeEpsilon;
      const heightChanged = Math.abs(scaleY - 1) > resizeEpsilon;
      const strokeScale = widthChanged && !heightChanged ? scaleX : !widthChanged && heightChanged ? scaleY : Math.min(scaleX, scaleY);
      const rawStrokeWidth = Math.max(1, original.strokeWidth * strokeScale);
      const maxStrokeWidth = Math.max(
        1,
        Math.min(resolvedRect.size.width, resolvedRect.size.height)
      );
      const clampedStrokeWidth = Math.min(rawStrokeWidth, maxStrokeWidth);
      const newStrokeWidth = Number(clampedStrokeWidth.toFixed(1));
      const innerOld = inset(oldRect, original.strokeWidth / 2);
      const innerNew = inset(resolvedRect, newStrokeWidth / 2);
      const sx = innerNew.size.width / Math.max(innerOld.size.width, 1e-6);
      const sy = innerNew.size.height / Math.max(innerOld.size.height, 1e-6);
      return {
        ...rects,
        inkList: original.inkList.map((stroke) => ({
          points: stroke.points.map((p) => ({
            x: innerNew.origin.x + (p.x - innerOld.origin.x) * sx,
            y: innerNew.origin.y + (p.y - innerOld.origin.y) * sy
          }))
        })),
        strokeWidth: newStrokeWidth
      };
    }
    case "rotate": {
      const result = baseRotateChanges(original, ctx);
      if (!result) return ctx.changes;
      const { dx, dy } = rotateOrbitDelta(original, result);
      return {
        ...result,
        inkList: original.inkList.map((stroke) => ({
          points: stroke.points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
        }))
      };
    }
    case "property-update": {
      const needsRectUpdate = ctx.changes.strokeWidth !== void 0 || ctx.changes.rotation !== void 0;
      if (!needsRectUpdate) return ctx.changes;
      const merged = { ...original, ...ctx.changes };
      const pts = merged.inkList.flatMap((s) => s.points);
      const tightRect = expandRect(rectFromPoints(pts), merged.strokeWidth / 2);
      const effectiveRotation = ctx.changes.rotation ?? original.rotation ?? 0;
      if (original.unrotatedRect || ctx.changes.rotation !== void 0) {
        return {
          ...ctx.changes,
          unrotatedRect: tightRect,
          rect: calculateRotatedRectAABBAroundPoint(
            tightRect,
            effectiveRotation,
            resolveAnnotationRotationCenter(original)
          )
        };
      }
      return { ...ctx.changes, rect: tightRect };
    }
    default:
      return ctx.changes;
  }
};
const patchLine = (orig, ctx) => {
  switch (ctx.type) {
    case "vertex-edit":
      if (ctx.changes.linePoints) {
        const { start, end } = ctx.changes.linePoints;
        const rawPoints = [start, end];
        const rawRect = lineRectWithEndings(rawPoints, orig.strokeWidth, orig.lineEndings);
        const compensated = compensateRotatedVertexEdit(orig, rawPoints, rawRect);
        const rect = lineRectWithEndings(compensated, orig.strokeWidth, orig.lineEndings);
        return {
          ...resolveVertexEditRects(orig, rect),
          linePoints: { start: compensated[0], end: compensated[1] }
        };
      }
      return ctx.changes;
    case "move": {
      if (!ctx.changes.rect) return ctx.changes;
      const { dx, dy, rects } = baseMoveChanges(orig, ctx.changes.rect);
      return {
        ...rects,
        linePoints: {
          start: { x: orig.linePoints.start.x + dx, y: orig.linePoints.start.y + dy },
          end: { x: orig.linePoints.end.x + dx, y: orig.linePoints.end.y + dy }
        }
      };
    }
    case "resize": {
      if (!ctx.changes.rect) return ctx.changes;
      const { scaleX, scaleY, oldRect, resolvedRect, rects } = baseResizeScaling(
        orig,
        ctx.changes.rect,
        ctx.metadata
      );
      return {
        ...rects,
        linePoints: {
          start: {
            x: resolvedRect.origin.x + (orig.linePoints.start.x - oldRect.origin.x) * scaleX,
            y: resolvedRect.origin.y + (orig.linePoints.start.y - oldRect.origin.y) * scaleY
          },
          end: {
            x: resolvedRect.origin.x + (orig.linePoints.end.x - oldRect.origin.x) * scaleX,
            y: resolvedRect.origin.y + (orig.linePoints.end.y - oldRect.origin.y) * scaleY
          }
        }
      };
    }
    case "rotate": {
      const result = baseRotateChanges(orig, ctx);
      if (!result) return ctx.changes;
      const { dx, dy } = rotateOrbitDelta(orig, result);
      return {
        ...result,
        linePoints: {
          start: { x: orig.linePoints.start.x + dx, y: orig.linePoints.start.y + dy },
          end: { x: orig.linePoints.end.x + dx, y: orig.linePoints.end.y + dy }
        }
      };
    }
    case "property-update": {
      const needsRectUpdate = ctx.changes.strokeWidth !== void 0 || ctx.changes.lineEndings !== void 0 || ctx.changes.rotation !== void 0;
      if (!needsRectUpdate) return ctx.changes;
      const merged = { ...orig, ...ctx.changes };
      const tightRect = lineRectWithEndings(
        [merged.linePoints.start, merged.linePoints.end],
        merged.strokeWidth,
        merged.lineEndings
      );
      const effectiveRotation = ctx.changes.rotation ?? orig.rotation ?? 0;
      if (orig.unrotatedRect || ctx.changes.rotation !== void 0) {
        return {
          ...ctx.changes,
          unrotatedRect: tightRect,
          rect: calculateRotatedRectAABBAroundPoint(
            tightRect,
            effectiveRotation,
            resolveAnnotationRotationCenter(orig)
          )
        };
      }
      return { ...ctx.changes, rect: tightRect };
    }
    default:
      return ctx.changes;
  }
};
const patchPolyline = (orig, ctx) => {
  switch (ctx.type) {
    case "vertex-edit":
      if (ctx.changes.vertices && ctx.changes.vertices.length) {
        const rawVertices = ctx.changes.vertices;
        const rawRect = lineRectWithEndings(rawVertices, orig.strokeWidth, orig.lineEndings);
        const compensated = compensateRotatedVertexEdit(orig, rawVertices, rawRect);
        const rect = lineRectWithEndings(compensated, orig.strokeWidth, orig.lineEndings);
        return {
          ...resolveVertexEditRects(orig, rect),
          vertices: compensated
        };
      }
      return ctx.changes;
    case "move": {
      if (!ctx.changes.rect) return ctx.changes;
      const { dx, dy, rects } = baseMoveChanges(orig, ctx.changes.rect);
      return {
        ...rects,
        vertices: orig.vertices.map((p) => ({ x: p.x + dx, y: p.y + dy }))
      };
    }
    case "resize": {
      if (!ctx.changes.rect) return ctx.changes;
      const { scaleX, scaleY, oldRect, resolvedRect, rects } = baseResizeScaling(
        orig,
        ctx.changes.rect,
        ctx.metadata
      );
      return {
        ...rects,
        vertices: orig.vertices.map((v) => ({
          x: resolvedRect.origin.x + (v.x - oldRect.origin.x) * scaleX,
          y: resolvedRect.origin.y + (v.y - oldRect.origin.y) * scaleY
        }))
      };
    }
    case "rotate": {
      const result = baseRotateChanges(orig, ctx);
      if (!result) return ctx.changes;
      const { dx, dy } = rotateOrbitDelta(orig, result);
      return {
        ...result,
        vertices: orig.vertices.map((v) => ({ x: v.x + dx, y: v.y + dy }))
      };
    }
    case "property-update": {
      const needsRectUpdate = ctx.changes.strokeWidth !== void 0 || ctx.changes.lineEndings !== void 0 || ctx.changes.rotation !== void 0;
      if (!needsRectUpdate) return ctx.changes;
      const merged = { ...orig, ...ctx.changes };
      const tightRect = lineRectWithEndings(
        merged.vertices,
        merged.strokeWidth,
        merged.lineEndings
      );
      const effectiveRotation = ctx.changes.rotation ?? orig.rotation ?? 0;
      if (orig.unrotatedRect || ctx.changes.rotation !== void 0) {
        return {
          ...ctx.changes,
          unrotatedRect: tightRect,
          rect: calculateRotatedRectAABBAroundPoint(
            tightRect,
            effectiveRotation,
            resolveAnnotationRotationCenter(orig)
          )
        };
      }
      return { ...ctx.changes, rect: tightRect };
    }
    default:
      return ctx.changes;
  }
};
function convertAABBRectToUnrotatedSpace(newAABBRect, originalAABBRect, originalUnrotatedRect, rotationDegrees) {
  const theta = rotationDegrees * Math.PI / 180;
  const A = Math.abs(Math.cos(theta));
  const B = Math.abs(Math.sin(theta));
  const det = A * A - B * B;
  const newAABBw = newAABBRect.size.width;
  const newAABBh = newAABBRect.size.height;
  let newWidth;
  let newHeight;
  if (Math.abs(det) > 1e-6) {
    newWidth = (A * newAABBw - B * newAABBh) / det;
    newHeight = (A * newAABBh - B * newAABBw) / det;
    newWidth = Math.max(newWidth, 1);
    newHeight = Math.max(newHeight, 1);
  } else {
    const origArea = originalAABBRect.size.width * originalAABBRect.size.height;
    const newArea = newAABBw * newAABBh;
    const uniformScale = origArea > 0 ? Math.sqrt(newArea / origArea) : 1;
    newWidth = originalUnrotatedRect.size.width * uniformScale;
    newHeight = originalUnrotatedRect.size.height * uniformScale;
  }
  const newCenterX = newAABBRect.origin.x + newAABBw / 2;
  const newCenterY = newAABBRect.origin.y + newAABBh / 2;
  return {
    origin: { x: newCenterX - newWidth / 2, y: newCenterY - newHeight / 2 },
    size: { width: newWidth, height: newHeight }
  };
}
const ANGLE_180 = Math.PI;
const ANGLE_90 = Math.PI / 2;
const ANGLE_34 = 34 * Math.PI / 180;
const ANGLE_30 = 30 * Math.PI / 180;
const ANGLE_12 = 12 * Math.PI / 180;
class PathBuilder {
  constructor() {
    this.parts = [];
    this.bbox = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };
    this.started = false;
  }
  moveTo(x, y) {
    const sy = -y;
    this.updateBBox(x, sy);
    this.parts.push(`M ${r(x)} ${r(sy)}`);
    this.started = true;
  }
  curveTo(x1, y1, x2, y2, x3, y3) {
    const sy1 = -y1;
    const sy2 = -y2;
    const sy3 = -y3;
    this.updateBBox(x1, sy1);
    this.updateBBox(x2, sy2);
    this.updateBBox(x3, sy3);
    this.parts.push(`C ${r(x1)} ${r(sy1)}, ${r(x2)} ${r(sy2)}, ${r(x3)} ${r(sy3)}`);
  }
  close() {
    if (this.started) {
      this.parts.push("Z");
    }
  }
  build(lineWidth) {
    const d = lineWidth > 0 ? lineWidth / 2 : 0;
    return {
      path: this.parts.join(" "),
      bbox: {
        minX: this.bbox.minX - d,
        minY: this.bbox.minY - d,
        maxX: this.bbox.maxX + d,
        maxY: this.bbox.maxY + d
      }
    };
  }
  updateBBox(x, y) {
    if (x < this.bbox.minX) this.bbox.minX = x;
    if (y < this.bbox.minY) this.bbox.minY = y;
    if (x > this.bbox.maxX) this.bbox.maxX = x;
    if (y > this.bbox.maxY) this.bbox.maxY = y;
  }
}
function r(n) {
  return Number(n.toFixed(4)).toString();
}
function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function cosine(dx, hypot) {
  return hypot === 0 ? 0 : dx / hypot;
}
function sine(dy, hypot) {
  return hypot === 0 ? 0 : dy / hypot;
}
function polygonDirection(pts) {
  let a = 0;
  const len = pts.length;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    a += pts[i].x * pts[j].y - pts[i].y * pts[j].x;
  }
  return a;
}
function ensurePositiveWinding(pts) {
  if (polygonDirection(pts) < 0) {
    pts.reverse();
  }
}
function removeZeroLengthSegments(polygon) {
  if (polygon.length <= 2) return polygon;
  const tolerance = 0.5;
  const result = [polygon[0]];
  for (let i = 1; i < polygon.length; i++) {
    const prev = result[result.length - 1];
    const cur = polygon[i];
    if (Math.abs(cur.x - prev.x) >= tolerance || Math.abs(cur.y - prev.y) >= tolerance) {
      result.push(cur);
    }
  }
  return result;
}
function arcSegment(startAng, endAng, cx, cy, rx, ry, out, addMoveTo) {
  const cosA = Math.cos(startAng);
  const sinA = Math.sin(startAng);
  const cosB = Math.cos(endAng);
  const sinB = Math.sin(endAng);
  const denom = Math.sin((endAng - startAng) / 2);
  if (denom === 0) {
    if (addMoveTo) {
      out.moveTo(cx + rx * cosA, cy + ry * sinA);
    }
    return;
  }
  const bcp = 4 / 3 * (1 - Math.cos((endAng - startAng) / 2)) / denom;
  const p1x = cx + rx * (cosA - bcp * sinA);
  const p1y = cy + ry * (sinA + bcp * cosA);
  const p2x = cx + rx * (cosB + bcp * sinB);
  const p2y = cy + ry * (sinB - bcp * cosB);
  const p3x = cx + rx * cosB;
  const p3y = cy + ry * sinB;
  if (addMoveTo) {
    out.moveTo(cx + rx * cosA, cy + ry * sinA);
  }
  out.curveTo(p1x, p1y, p2x, p2y, p3x, p3y);
}
function arcSegmentToArray(startAng, endAng, cx, cy, rx, ry) {
  const cosA = Math.cos(startAng);
  const sinA = Math.sin(startAng);
  const cosB = Math.cos(endAng);
  const sinB = Math.sin(endAng);
  const denom = Math.sin((endAng - startAng) / 2);
  if (denom === 0) return [];
  const bcp = 4 / 3 * (1 - Math.cos((endAng - startAng) / 2)) / denom;
  return [
    { x: cx + rx * (cosA - bcp * sinA), y: cy + ry * (sinA + bcp * cosA) },
    { x: cx + rx * (cosB + bcp * sinB), y: cy + ry * (sinB - bcp * cosB) },
    { x: cx + rx * cosB, y: cy + ry * sinB }
  ];
}
function getArc(startAng, endAng, rx, ry, cx, cy, out, addMoveTo) {
  const angleIncr = ANGLE_90;
  let angleTodo = endAng - startAng;
  while (angleTodo < 0) angleTodo += 2 * Math.PI;
  const sweep = angleTodo;
  let angleDone = 0;
  if (addMoveTo) {
    out.moveTo(cx + rx * Math.cos(startAng), cy + ry * Math.sin(startAng));
  }
  while (angleTodo > angleIncr) {
    arcSegment(startAng + angleDone, startAng + angleDone + angleIncr, cx, cy, rx, ry, out, false);
    angleDone += angleIncr;
    angleTodo -= angleIncr;
  }
  if (angleTodo > 0) {
    arcSegment(startAng + angleDone, startAng + sweep, cx, cy, rx, ry, out, false);
  }
}
function addCornerCurl(anglePrev, angleCur, radius, cx, cy, alpha, alphaPrev, out, addMoveTo) {
  let a = anglePrev + ANGLE_180 + alphaPrev;
  const b = anglePrev + ANGLE_180 + alphaPrev - 22 * Math.PI / 180;
  arcSegment(a, b, cx, cy, radius, radius, out, addMoveTo);
  a = b;
  const bEnd = angleCur - alpha;
  getArc(a, bEnd, radius, radius, cx, cy, out, false);
}
function addFirstIntermediateCurl(angleCur, r2, alpha, cx, cy, out) {
  const a = angleCur + ANGLE_180;
  arcSegment(a + alpha, a + alpha - ANGLE_30, cx, cy, r2, r2, out, false);
  arcSegment(a + alpha - ANGLE_30, a + ANGLE_90, cx, cy, r2, r2, out, false);
  arcSegment(a + ANGLE_90, a + ANGLE_180 - ANGLE_34, cx, cy, r2, r2, out, false);
}
function getIntermediateCurlTemplate(angleCur, r2) {
  const pts = [];
  const a = angleCur + ANGLE_180;
  pts.push(...arcSegmentToArray(a + ANGLE_34, a + ANGLE_12, 0, 0, r2, r2));
  pts.push(...arcSegmentToArray(a + ANGLE_12, a + ANGLE_90, 0, 0, r2, r2));
  pts.push(...arcSegmentToArray(a + ANGLE_90, a + ANGLE_180 - ANGLE_34, 0, 0, r2, r2));
  return pts;
}
function outputCurlTemplate(template, x, y, out) {
  for (let i = 0; i + 2 < template.length; i += 3) {
    const a = template[i];
    const b = template[i + 1];
    const c = template[i + 2];
    out.curveTo(a.x + x, a.y + y, b.x + x, b.y + y, c.x + x, c.y + y);
  }
}
function computeParamsPolygon(idealRadius, k, length) {
  if (length === 0) return { n: -1, adjustedRadius: idealRadius };
  const cornerSpace = 2 * k * idealRadius;
  const remaining = length - cornerSpace;
  if (remaining <= 0) {
    return { n: 0, adjustedRadius: idealRadius };
  }
  const idealAdvance = 2 * k * idealRadius;
  const n = Math.max(1, Math.ceil(remaining / idealAdvance));
  const adjustedRadius = remaining / (n * 2 * k);
  return { n, adjustedRadius };
}
function cloudyPolygonImpl(vertices, isEllipse, intensity, lineWidth, out) {
  let polygon = removeZeroLengthSegments(vertices);
  ensurePositiveWinding(polygon);
  const numPoints = polygon.length;
  if (numPoints < 2) return;
  if (intensity <= 0) {
    out.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < numPoints; i++) {
      out.curveTo(
        polygon[i].x,
        polygon[i].y,
        polygon[i].x,
        polygon[i].y,
        polygon[i].x,
        polygon[i].y
      );
    }
    return;
  }
  let idealRadius = isEllipse ? getEllipseCloudRadius(intensity, lineWidth) : getPolygonCloudRadius(intensity, lineWidth);
  if (idealRadius < 0.5) idealRadius = 0.5;
  const k = Math.cos(ANGLE_34);
  const edgeAlphas = [];
  for (let j = 0; j + 1 < numPoints; j++) {
    const len = distance(polygon[j], polygon[j + 1]);
    if (len <= 0 || len >= 2 * k * idealRadius) {
      edgeAlphas.push(ANGLE_34);
    } else {
      edgeAlphas.push(Math.acos(Math.min(1, len / (2 * idealRadius))));
    }
  }
  let anglePrev = 0;
  let outputStarted = false;
  for (let j = 0; j + 1 < numPoints; j++) {
    const pt = polygon[j];
    const ptNext = polygon[j + 1];
    const len = distance(pt, ptNext);
    if (len === 0) continue;
    const params = computeParamsPolygon(idealRadius, k, len);
    if (params.n < 0) {
      if (!outputStarted) {
        out.moveTo(pt.x, pt.y);
        outputStarted = true;
      }
      continue;
    }
    const edgeRadius = Math.max(0.5, params.adjustedRadius);
    const intermAdvance = 2 * k * edgeRadius;
    const firstAdvance = k * idealRadius + k * edgeRadius;
    let angleCur = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
    if (j === 0) {
      const ptPrev = polygon[numPoints - 2];
      anglePrev = Math.atan2(pt.y - ptPrev.y, pt.x - ptPrev.x);
    }
    const cos = cosine(ptNext.x - pt.x, len);
    const sin = sine(ptNext.y - pt.y, len);
    let x = pt.x;
    let y = pt.y;
    const alpha = edgeAlphas[j];
    const prevEdgeIdx = j === 0 ? numPoints - 2 : j - 1;
    const alphaPrevEdge = edgeAlphas[prevEdgeIdx] ?? ANGLE_34;
    addCornerCurl(
      anglePrev,
      angleCur,
      idealRadius,
      pt.x,
      pt.y,
      alpha,
      alphaPrevEdge,
      out,
      !outputStarted
    );
    outputStarted = true;
    if (params.n === 0) {
      x += len * cos;
      y += len * sin;
    } else {
      x += firstAdvance * cos;
      y += firstAdvance * sin;
      let numInterm = params.n;
      if (params.n >= 1) {
        addFirstIntermediateCurl(angleCur, edgeRadius, ANGLE_34, x, y, out);
        x += intermAdvance * cos;
        y += intermAdvance * sin;
        numInterm = params.n - 1;
      }
      const template = getIntermediateCurlTemplate(angleCur, edgeRadius);
      for (let i = 0; i < numInterm; i++) {
        outputCurlTemplate(template, x, y, out);
        x += intermAdvance * cos;
        y += intermAdvance * sin;
      }
    }
    anglePrev = angleCur;
  }
}
function flattenEllipse(left, bottom, right, top) {
  const cx = (left + right) / 2;
  const cy = (bottom + top) / 2;
  const rx = (right - left) / 2;
  const ry = (top - bottom) / 2;
  if (rx <= 0 || ry <= 0) return [];
  const numSegments = Math.max(32, Math.ceil(Math.max(rx, ry) * 2));
  const points = [];
  for (let i = 0; i <= numSegments; i++) {
    const angle = 2 * Math.PI * i / numSegments;
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle)
    });
  }
  return points;
}
function getEllipseCloudRadius(intensity, lineWidth) {
  return 4.75 * intensity + 0.5 * lineWidth;
}
function getPolygonCloudRadius(intensity, lineWidth) {
  return 4 * intensity + 0.5 * lineWidth;
}
function cloudyEllipseImpl(left, bottom, right, top, intensity, lineWidth, out) {
  if (intensity <= 0) {
    const rx = Math.abs(right - left) / 2;
    const ry = Math.abs(top - bottom) / 2;
    const cx = (left + right) / 2;
    const cy = (bottom + top) / 2;
    getArc(0, 2 * Math.PI, rx, ry, cx, cy, out, true);
    return;
  }
  const width = right - left;
  const height = top - bottom;
  let cloudRadius = getEllipseCloudRadius(intensity, lineWidth);
  const threshold1 = 0.5 * cloudRadius;
  if (width < threshold1 && height < threshold1) {
    const rx = Math.abs(right - left) / 2;
    const ry = Math.abs(top - bottom) / 2;
    const cx = (left + right) / 2;
    const cy = (bottom + top) / 2;
    getArc(0, 2 * Math.PI, rx, ry, cx, cy, out, true);
    return;
  }
  const threshold2 = 5;
  if (width < threshold2 && height > 20 || width > 20 && height < threshold2) {
    cloudyPolygonImpl(
      [
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top },
        { x: left, y: top },
        { x: left, y: bottom }
      ],
      true,
      intensity,
      lineWidth,
      out
    );
    return;
  }
  const radiusAdj = Math.sin(ANGLE_12) * cloudRadius - 1.5;
  let adjLeft = left;
  let adjRight = right;
  let adjBottom = bottom;
  let adjTop = top;
  if (width > 2 * radiusAdj) {
    adjLeft += radiusAdj;
    adjRight -= radiusAdj;
  } else {
    const mid = (left + right) / 2;
    adjLeft = mid - 0.1;
    adjRight = mid + 0.1;
  }
  if (height > 2 * radiusAdj) {
    adjBottom += radiusAdj;
    adjTop -= radiusAdj;
  } else {
    const mid = (top + bottom) / 2;
    adjTop = mid + 0.1;
    adjBottom = mid - 0.1;
  }
  const flatPolygon = flattenEllipse(adjLeft, adjBottom, adjRight, adjTop);
  const numFlatPts = flatPolygon.length;
  if (numFlatPts < 2) return;
  let totLen = 0;
  for (let i = 1; i < numFlatPts; i++) {
    totLen += distance(flatPolygon[i - 1], flatPolygon[i]);
  }
  const k = Math.cos(ANGLE_34);
  let curlAdvance = 2 * k * cloudRadius;
  let n = Math.ceil(totLen / curlAdvance);
  if (n < 2) {
    const rx = Math.abs(right - left) / 2;
    const ry = Math.abs(top - bottom) / 2;
    const cx = (left + right) / 2;
    const cy = (bottom + top) / 2;
    getArc(0, 2 * Math.PI, rx, ry, cx, cy, out, true);
    return;
  }
  curlAdvance = totLen / n;
  cloudRadius = curlAdvance / (2 * k);
  if (cloudRadius < 0.5) {
    cloudRadius = 0.5;
    curlAdvance = 2 * k * cloudRadius;
  } else if (cloudRadius < 3) {
    const rx = Math.abs(right - left) / 2;
    const ry = Math.abs(top - bottom) / 2;
    const cx = (left + right) / 2;
    const cy = (bottom + top) / 2;
    getArc(0, 2 * Math.PI, rx, ry, cx, cy, out, true);
    return;
  }
  const centerPoints = [];
  let lengthRemain = 0;
  const comparisonToler = lineWidth * 0.1;
  for (let i = 0; i + 1 < numFlatPts; i++) {
    const p1 = flatPolygon[i];
    const p2 = flatPolygon[i + 1];
    const segDx = p2.x - p1.x;
    const segDy = p2.y - p1.y;
    const segLen = distance(p1, p2);
    if (segLen === 0) continue;
    let lengthTodo = segLen + lengthRemain;
    if (lengthTodo >= curlAdvance - comparisonToler || i === numFlatPts - 2) {
      const cos = cosine(segDx, segLen);
      const sin = sine(segDy, segLen);
      let d = curlAdvance - lengthRemain;
      while (lengthTodo >= curlAdvance - comparisonToler) {
        centerPoints.push({ x: p1.x + d * cos, y: p1.y + d * sin });
        lengthTodo -= curlAdvance;
        d += curlAdvance;
      }
      lengthRemain = Math.max(0, lengthTodo);
    } else {
      lengthRemain += segLen;
    }
  }
  const cpLen = centerPoints.length;
  let epAnglePrev = 0;
  let epAlphaPrev = 0;
  for (let i = 0; i < cpLen; i++) {
    const idxNext = (i + 1) % cpLen;
    const pt = centerPoints[i];
    const ptNext = centerPoints[idxNext];
    if (i === 0) {
      const ptPrev = centerPoints[cpLen - 1];
      epAnglePrev = Math.atan2(pt.y - ptPrev.y, pt.x - ptPrev.x);
      epAlphaPrev = computeParamsEllipse(ptPrev, pt, cloudRadius, curlAdvance);
    }
    const angleCur = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
    const alpha = computeParamsEllipse(pt, ptNext, cloudRadius, curlAdvance);
    addCornerCurl(epAnglePrev, angleCur, cloudRadius, pt.x, pt.y, alpha, epAlphaPrev, out, i === 0);
    epAnglePrev = angleCur;
    epAlphaPrev = alpha;
  }
}
function computeParamsEllipse(pt, ptNext, r2, curlAdv) {
  const len = distance(pt, ptNext);
  if (len === 0) return ANGLE_34;
  const e = len - curlAdv;
  const arg = (curlAdv / 2 + e / 2) / r2;
  return arg < -1 || arg > 1 ? 0 : Math.acos(arg);
}
function getCloudyBorderExtent(intensity, lineWidth, isEllipse) {
  const cloudRadius = isEllipse ? getEllipseCloudRadius(intensity, lineWidth) : getPolygonCloudRadius(intensity, lineWidth);
  return cloudRadius + lineWidth / 2;
}
function generateCloudyRectanglePath(rect, rd, intensity, lineWidth) {
  const out = new PathBuilder();
  let left = 0;
  let top = 0;
  let right = rect.width;
  let bottom = rect.height;
  if (rd) {
    left += rd.left;
    top += rd.top;
    right -= rd.right;
    bottom -= rd.bottom;
  } else {
    left += lineWidth / 2;
    top += lineWidth / 2;
    right -= lineWidth / 2;
    bottom -= lineWidth / 2;
  }
  const polygon = [
    { x: left, y: -top },
    { x: right, y: -top },
    { x: right, y: -bottom },
    { x: left, y: -bottom },
    { x: left, y: -top }
  ];
  cloudyPolygonImpl(polygon, false, intensity, lineWidth, out);
  out.close();
  return out.build(lineWidth);
}
function generateCloudyEllipsePath(rect, rd, intensity, lineWidth) {
  const out = new PathBuilder();
  let left = 0;
  let top = 0;
  let right = rect.width;
  let bottom = rect.height;
  if (rd) {
    left += rd.left;
    top += rd.top;
    right -= rd.right;
    bottom -= rd.bottom;
  }
  cloudyEllipseImpl(left, -bottom, right, -top, intensity, lineWidth, out);
  out.close();
  return out.build(lineWidth);
}
function generateCloudyPolygonPath(vertices, rectOrigin, intensity, lineWidth) {
  const out = new PathBuilder();
  if (vertices.length < 3) {
    return out.build(lineWidth);
  }
  const localPts = vertices.map((v) => ({
    x: v.x - rectOrigin.x,
    y: -(v.y - rectOrigin.y)
  }));
  const first = localPts[0];
  const last = localPts[localPts.length - 1];
  if (first.x !== last.x || first.y !== last.y) {
    localPts.push({ x: first.x, y: first.y });
  }
  cloudyPolygonImpl(localPts, false, intensity, lineWidth, out);
  out.close();
  return out.build(lineWidth);
}
function getPolygonPad(intensity, strokeWidth) {
  if ((intensity ?? 0) > 0) {
    return getCloudyBorderExtent(intensity, strokeWidth, false);
  }
  return strokeWidth / 2;
}
const patchPolygon = (orig, ctx) => {
  switch (ctx.type) {
    case "vertex-edit":
      if (ctx.changes.vertices && ctx.changes.vertices.length) {
        const pad = getPolygonPad(orig.cloudyBorderIntensity, orig.strokeWidth);
        const rawVertices = ctx.changes.vertices;
        const rawRect = expandRect(rectFromPoints(rawVertices), pad);
        const compensated = compensateRotatedVertexEdit(orig, rawVertices, rawRect);
        const rect = expandRect(rectFromPoints(compensated), pad);
        return {
          ...resolveVertexEditRects(orig, rect),
          vertices: compensated
        };
      }
      return ctx.changes;
    case "move": {
      if (!ctx.changes.rect) return ctx.changes;
      const { dx, dy, rects } = baseMoveChanges(orig, ctx.changes.rect);
      return {
        ...rects,
        vertices: orig.vertices.map((p) => ({ x: p.x + dx, y: p.y + dy }))
      };
    }
    case "resize": {
      if (!ctx.changes.rect) return ctx.changes;
      const { scaleX, scaleY, oldRect, resolvedRect, rects } = baseResizeScaling(
        orig,
        ctx.changes.rect,
        ctx.metadata
      );
      return {
        ...rects,
        vertices: orig.vertices.map((v) => ({
          x: resolvedRect.origin.x + (v.x - oldRect.origin.x) * scaleX,
          y: resolvedRect.origin.y + (v.y - oldRect.origin.y) * scaleY
        }))
      };
    }
    case "rotate": {
      const result = baseRotateChanges(orig, ctx);
      if (!result) return ctx.changes;
      const { dx, dy } = rotateOrbitDelta(orig, result);
      return {
        ...result,
        vertices: orig.vertices.map((v) => ({ x: v.x + dx, y: v.y + dy }))
      };
    }
    case "property-update": {
      const cloudyChanged = ctx.changes.cloudyBorderIntensity !== void 0;
      const needsRectUpdate = ctx.changes.strokeWidth !== void 0 || ctx.changes.rotation !== void 0 || cloudyChanged;
      if (!needsRectUpdate) return ctx.changes;
      const merged = { ...orig, ...ctx.changes };
      const pad = getPolygonPad(merged.cloudyBorderIntensity, merged.strokeWidth);
      const tightRect = expandRect(rectFromPoints(merged.vertices), pad);
      let patch = ctx.changes;
      const hasCloudy = (orig.cloudyBorderIntensity ?? 0) > 0;
      if (cloudyChanged || ctx.changes.strokeWidth !== void 0 && hasCloudy) {
        const intensity = merged.cloudyBorderIntensity ?? 0;
        if (intensity > 0) {
          const extent = getCloudyBorderExtent(intensity, merged.strokeWidth, false);
          patch = {
            ...patch,
            rectangleDifferences: { left: extent, top: extent, right: extent, bottom: extent }
          };
        } else {
          patch = { ...patch, rectangleDifferences: void 0 };
        }
      }
      const effectiveRotation = ctx.changes.rotation ?? orig.rotation ?? 0;
      if (orig.unrotatedRect || ctx.changes.rotation !== void 0) {
        return {
          ...patch,
          unrotatedRect: tightRect,
          rect: calculateRotatedRectAABBAroundPoint(
            tightRect,
            effectiveRotation,
            resolveAnnotationRotationCenter(orig)
          )
        };
      }
      return { ...patch, rect: tightRect };
    }
    default:
      return ctx.changes;
  }
};
const patchCircle = (orig, ctx) => {
  switch (ctx.type) {
    case "move":
      if (!ctx.changes.rect) return ctx.changes;
      return baseMoveChanges(orig, ctx.changes.rect).rects;
    case "resize":
      if (!ctx.changes.rect) return ctx.changes;
      return baseResizeScaling(orig, ctx.changes.rect, ctx.metadata).rects;
    case "rotate":
      return baseRotateChanges(orig, ctx) ?? ctx.changes;
    case "property-update": {
      let patch = ctx.changes;
      const cloudyChanged = ctx.changes.cloudyBorderIntensity !== void 0;
      const strokeChanged = ctx.changes.strokeWidth !== void 0;
      const hasCloudy = (orig.cloudyBorderIntensity ?? 0) > 0;
      if (cloudyChanged || strokeChanged && hasCloudy) {
        const merged = { ...orig, ...ctx.changes };
        const intensity = merged.cloudyBorderIntensity ?? 0;
        if (intensity > 0) {
          const extent = getCloudyBorderExtent(intensity, merged.strokeWidth, true);
          patch = {
            ...patch,
            rectangleDifferences: { left: extent, top: extent, right: extent, bottom: extent }
          };
        } else {
          patch = { ...patch, rectangleDifferences: void 0 };
        }
      }
      if (ctx.changes.rotation !== void 0) {
        patch = { ...patch, ...basePropertyRotationChanges(orig, ctx.changes.rotation) };
      }
      return patch;
    }
    default:
      return ctx.changes;
  }
};
const patchSquare = (orig, ctx) => {
  switch (ctx.type) {
    case "move":
      if (!ctx.changes.rect) return ctx.changes;
      return baseMoveChanges(orig, ctx.changes.rect).rects;
    case "resize":
      if (!ctx.changes.rect) return ctx.changes;
      return baseResizeScaling(orig, ctx.changes.rect, ctx.metadata).rects;
    case "rotate":
      return baseRotateChanges(orig, ctx) ?? ctx.changes;
    case "property-update": {
      let patch = ctx.changes;
      const cloudyChanged = ctx.changes.cloudyBorderIntensity !== void 0;
      const strokeChanged = ctx.changes.strokeWidth !== void 0;
      const hasCloudy = (orig.cloudyBorderIntensity ?? 0) > 0;
      if (cloudyChanged || strokeChanged && hasCloudy) {
        const merged = { ...orig, ...ctx.changes };
        const intensity = merged.cloudyBorderIntensity ?? 0;
        if (intensity > 0) {
          const extent = getCloudyBorderExtent(intensity, merged.strokeWidth, false);
          patch = {
            ...patch,
            rectangleDifferences: { left: extent, top: extent, right: extent, bottom: extent }
          };
        } else {
          patch = { ...patch, rectangleDifferences: void 0 };
        }
      }
      if (ctx.changes.rotation !== void 0) {
        patch = { ...patch, ...basePropertyRotationChanges(orig, ctx.changes.rotation) };
      }
      return patch;
    }
    default:
      return ctx.changes;
  }
};
const patchFreeText = (orig, ctx) => {
  switch (ctx.type) {
    case "move":
      if (!ctx.changes.rect) return ctx.changes;
      return baseMoveChanges(orig, ctx.changes.rect).rects;
    case "resize":
      if (!ctx.changes.rect) return ctx.changes;
      return baseResizeScaling(orig, ctx.changes.rect, ctx.metadata).rects;
    case "rotate":
      return baseRotateChanges(orig, ctx) ?? ctx.changes;
    case "property-update":
      if (ctx.changes.rotation !== void 0) {
        return { ...ctx.changes, ...basePropertyRotationChanges(orig, ctx.changes.rotation) };
      }
      return ctx.changes;
    default:
      return ctx.changes;
  }
};
function rebuildFromVertices(orig, arrowTip, knee, tbTL, tbBR) {
  const textBox = {
    origin: { x: Math.min(tbTL.x, tbBR.x), y: Math.min(tbTL.y, tbBR.y) },
    size: {
      width: Math.abs(tbBR.x - tbTL.x),
      height: Math.abs(tbBR.y - tbTL.y)
    }
  };
  const connectionPoint = computeCalloutConnectionPoint(knee, textBox);
  const calloutLine = [arrowTip, knee, connectionPoint];
  const overallRect = computeCalloutOverallRect(
    textBox,
    calloutLine,
    orig.lineEnding,
    orig.strokeWidth ?? 1
  );
  return {
    calloutLine,
    rect: overallRect,
    rectangleDifferences: computeRDFromTextBox(overallRect, textBox)
  };
}
const patchCalloutFreeText = (orig, ctx) => {
  var _a, _b;
  switch (ctx.type) {
    case "vertex-edit": {
      if (!ctx.changes.calloutLine) return ctx.changes;
      const verts = ctx.changes.calloutLine;
      if (verts.length < 4) return ctx.changes;
      return rebuildFromVertices(orig, verts[0], verts[1], verts[2], verts[3]);
    }
    case "move": {
      if (!ctx.changes.rect) return ctx.changes;
      const { dx, dy, rects } = baseMoveChanges(orig, ctx.changes.rect);
      const movedLine = (_a = orig.calloutLine) == null ? void 0 : _a.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      return {
        ...rects,
        ...movedLine && { calloutLine: movedLine }
      };
    }
    case "rotate": {
      const result = baseRotateChanges(orig, ctx);
      if (!result) return ctx.changes;
      const { dx, dy } = rotateOrbitDelta(orig, result);
      const movedLine = (_b = orig.calloutLine) == null ? void 0 : _b.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      return {
        ...result,
        ...movedLine && { calloutLine: movedLine }
      };
    }
    case "property-update": {
      if (ctx.changes.lineEnding !== void 0 || ctx.changes.strokeWidth !== void 0) {
        const merged = { ...orig, ...ctx.changes };
        if (merged.calloutLine && merged.calloutLine.length >= 3) {
          const textBox = computeTextBoxFromRD(orig.rect, orig.rectangleDifferences);
          const overallRect = computeCalloutOverallRect(
            textBox,
            merged.calloutLine,
            merged.lineEnding,
            merged.strokeWidth ?? 1
          );
          return {
            ...ctx.changes,
            rect: overallRect,
            rectangleDifferences: computeRDFromTextBox(overallRect, textBox)
          };
        }
      }
      return ctx.changes;
    }
    default:
      return ctx.changes;
  }
};
const patchStamp = (orig, ctx) => {
  switch (ctx.type) {
    case "move":
      if (!ctx.changes.rect) return ctx.changes;
      return baseMoveChanges(orig, ctx.changes.rect).rects;
    case "resize":
      if (!ctx.changes.rect) return ctx.changes;
      return baseResizeScaling(orig, ctx.changes.rect, ctx.metadata).rects;
    case "rotate":
      return baseRotateChanges(orig, ctx) ?? ctx.changes;
    case "property-update":
      if (ctx.changes.rotation !== void 0) {
        return { ...ctx.changes, ...basePropertyRotationChanges(orig, ctx.changes.rotation) };
      }
      return ctx.changes;
    default:
      return ctx.changes;
  }
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LINE_ENDING_HANDLERS,
  PatchRegistry,
  applyInsertUpright,
  calculateAABBFromVertices,
  calculateRotatedRectAABB,
  calculateRotatedRectAABBAroundPoint,
  calloutVertexConfig,
  clampAnnotationToPage,
  compensateRotatedVertexEdit,
  computeCalloutConnectionPoint,
  computeCalloutOverallRect,
  computeRDFromTextBox,
  computeTextBoxFromRD,
  createEnding,
  getRectCenter,
  lineRectWithEndings,
  patchCalloutFreeText,
  patchCircle,
  patchFreeText,
  patchInk,
  patchLine,
  patchPolygon,
  patchPolyline,
  patchRegistry,
  patchSquare,
  patchStamp,
  resolveAnnotationRotationCenter,
  resolveRotateRects,
  resolveVertexEditRects,
  rotatePointAroundCenter: rotatePointAround,
  rotateVertices
}, Symbol.toStringTag, { value: "Module" }));
const COMMENT_SIZE = 24;
const textHandlerFactory = {
  annotationType: PdfAnnotationSubtype.TEXT,
  create(context) {
    const { onCommit, getTool, pageSize } = context;
    return {
      onPointerDown: (pos) => {
        const tool = getTool();
        if (!tool) return;
        const rect = {
          origin: { x: pos.x - COMMENT_SIZE / 2, y: pos.y - COMMENT_SIZE / 2 },
          size: { width: COMMENT_SIZE, height: COMMENT_SIZE }
        };
        let anno = {
          ...tool.defaults,
          rect,
          type: PdfAnnotationSubtype.TEXT,
          name: tool.defaults.name ?? PdfAnnotationName.Comment,
          contents: tool.defaults.contents ?? "",
          flags: tool.defaults.flags ?? ["print", "noRotate", "noZoom"],
          pageIndex: context.pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date()
        };
        anno = clampAnnotationToPage(anno, pageSize);
        onCommit(anno);
      }
    };
  }
};
function useClickDetector({
  threshold = 5,
  getTool,
  onClickDetected
}) {
  const [getStartPos, setStartPos] = useState(null);
  const [getHasMoved, setHasMoved] = useState(false);
  return {
    onStart: (pos) => {
      setStartPos(pos);
      setHasMoved(false);
    },
    onMove: (pos) => {
      const start = getStartPos();
      if (!start || getHasMoved()) return;
      const distance2 = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      if (distance2 > threshold) {
        setHasMoved(true);
      }
    },
    onEnd: (pos) => {
      var _a;
      const start = getStartPos();
      if (start && !getHasMoved()) {
        const tool = getTool();
        if (tool && "clickBehavior" in tool && ((_a = tool.clickBehavior) == null ? void 0 : _a.enabled)) {
          onClickDetected(pos, tool);
        }
      }
      setStartPos(null);
      setHasMoved(false);
    },
    hasMoved: getHasMoved,
    reset: () => {
      setStartPos(null);
      setHasMoved(false);
    }
  };
}
const freeTextHandlerFactory = {
  annotationType: PdfAnnotationSubtype.FREETEXT,
  create(context) {
    const { onCommit, onPreview, getTool, pageSize, pageIndex, pageRotation } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        fontColor: tool.defaults.fontColor ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        fontSize: tool.defaults.fontSize ?? 12,
        fontFamily: tool.defaults.fontFamily ?? PdfStandardFont.Helvetica,
        color: tool.defaults.color ?? tool.defaults.backgroundColor ?? "transparent",
        textAlign: tool.defaults.textAlign ?? PdfTextAlignment.Left,
        verticalAlign: tool.defaults.verticalAlign ?? PdfVerticalAlignment.Top,
        contents: tool.defaults.contents ?? "Insert text here",
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const clickDetector = useClickDetector({
      threshold: 5,
      getTool,
      onClickDetected: (pos, tool) => {
        var _a;
        const defaults = getDefaults();
        if (!defaults) return;
        const clickConfig = tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const rect = {
          origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
          size: { width, height }
        };
        const contents = clickConfig.defaultContent ?? defaults.contents;
        let anno = {
          ...defaults,
          contents,
          type: PdfAnnotationSubtype.FREETEXT,
          rect,
          pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date()
        };
        if ((_a = tool.behavior) == null ? void 0 : _a.insertUpright) {
          anno = applyInsertUpright(anno, pageRotation, false);
        }
        anno = clampAnnotationToPage(anno, pageSize);
        onCommit(anno);
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const minX = Math.min(start.x, current.x);
      const minY = Math.min(start.y, current.y);
      const width = Math.abs(start.x - current.x);
      const height = Math.abs(start.y - current.y);
      const rect = {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
      return {
        type: PdfAnnotationSubtype.FREETEXT,
        bounds: rect,
        data: {
          ...defaults,
          rect
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a, _b;
        const start = getStart();
        if (!start) return;
        const defaults = getDefaults();
        if (!defaults) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const minX = Math.min(start.x, clampedPos.x);
          const minY = Math.min(start.y, clampedPos.y);
          const width = Math.abs(start.x - clampedPos.x);
          const height = Math.abs(start.y - clampedPos.y);
          const rect = {
            origin: { x: minX, y: minY },
            size: { width, height }
          };
          const tool = getTool();
          let anno = {
            ...defaults,
            type: PdfAnnotationSubtype.FREETEXT,
            rect,
            pageIndex: context.pageIndex,
            id: uuidV4(),
            created: /* @__PURE__ */ new Date()
          };
          if ((_a = tool == null ? void 0 : tool.behavior) == null ? void 0 : _a.insertUpright) {
            anno = applyInsertUpright(anno, pageRotation, true);
          }
          onCommit(anno);
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_b = evt.releasePointerCapture) == null ? void 0 : _b.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const CLICK_THRESHOLD = 5;
const DEFAULT_TB_WIDTH = 150;
const DEFAULT_TB_HEIGHT = 40;
const calloutFreeTextHandlerFactory = {
  annotationType: PdfAnnotationSubtype.FREETEXT,
  create(context) {
    const { onCommit, onPreview, getTool, pageSize, pageIndex } = context;
    const [getPhase, setPhase] = useState("arrow");
    const [getArrowTip, setArrowTip] = useState(null);
    const [getKnee, setKnee] = useState(null);
    const [getDownPos, setDownPos] = useState(null);
    const [getTextBoxStart, setTextBoxStart] = useState(null);
    const [getDragging, setDragging] = useState(false);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const clampTextBox = (tb) => ({
      origin: {
        x: clamp(tb.origin.x, 0, pageSize.width - tb.size.width),
        y: clamp(tb.origin.y, 0, pageSize.height - tb.size.height)
      },
      size: tb.size
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        fontColor: tool.defaults.fontColor ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        fontSize: tool.defaults.fontSize ?? 12,
        fontFamily: tool.defaults.fontFamily ?? PdfStandardFont.Helvetica,
        color: tool.defaults.color ?? tool.defaults.backgroundColor ?? "transparent",
        textAlign: tool.defaults.textAlign ?? PdfTextAlignment.Left,
        verticalAlign: tool.defaults.verticalAlign ?? PdfVerticalAlignment.Top,
        contents: tool.defaults.contents ?? "Insert text",
        flags: tool.defaults.flags ?? ["print"],
        lineEnding: tool.defaults.lineEnding ?? PdfAnnotationLineEnding.OpenArrow,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        strokeWidth: tool.defaults.strokeWidth ?? 1
      };
    };
    const isClick = (a, b) => Math.abs(a.x - b.x) < CLICK_THRESHOLD && Math.abs(a.y - b.y) < CLICK_THRESHOLD;
    const buildPreview = (cursor) => {
      const defaults = getDefaults();
      if (!defaults) return null;
      const arrowTip = getArrowTip();
      const knee = getKnee();
      const phase = getPhase();
      if (phase === "knee" && arrowTip) {
        const calloutLine = [arrowTip, cursor];
        const minX = Math.min(arrowTip.x, cursor.x);
        const minY = Math.min(arrowTip.y, cursor.y);
        const w = Math.abs(arrowTip.x - cursor.x);
        const h = Math.abs(arrowTip.y - cursor.y);
        const bounds = {
          origin: { x: minX, y: minY },
          size: { width: Math.max(w, 1), height: Math.max(h, 1) }
        };
        return {
          type: PdfAnnotationSubtype.FREETEXT,
          bounds,
          data: {
            ...defaults,
            rect: bounds,
            calloutLine
          }
        };
      }
      if (phase === "textbox" && arrowTip && knee) {
        const tbStart = getTextBoxStart();
        let textBox;
        if (getDragging() && tbStart) {
          textBox = {
            origin: { x: Math.min(tbStart.x, cursor.x), y: Math.min(tbStart.y, cursor.y) },
            size: {
              width: Math.max(Math.abs(cursor.x - tbStart.x), 20),
              height: Math.max(Math.abs(cursor.y - tbStart.y), 14)
            }
          };
        } else {
          textBox = {
            origin: { x: cursor.x - DEFAULT_TB_WIDTH / 2, y: cursor.y - DEFAULT_TB_HEIGHT / 2 },
            size: { width: DEFAULT_TB_WIDTH, height: DEFAULT_TB_HEIGHT }
          };
        }
        textBox = clampTextBox(textBox);
        const connectionPoint = computeCalloutConnectionPoint(knee, textBox);
        const calloutLine = [arrowTip, knee, connectionPoint];
        const overallRect = computeCalloutOverallRect(
          textBox,
          calloutLine,
          defaults.lineEnding,
          defaults.strokeWidth
        );
        return {
          type: PdfAnnotationSubtype.FREETEXT,
          bounds: overallRect,
          data: {
            ...defaults,
            rect: overallRect,
            calloutLine,
            textBox
          }
        };
      }
      return null;
    };
    const commitCallout = (tb) => {
      const defaults = getDefaults();
      const arrowTip = getArrowTip();
      const knee = getKnee();
      if (!defaults || !arrowTip || !knee) return;
      const textBox = clampTextBox(tb);
      const connectionPoint = computeCalloutConnectionPoint(knee, textBox);
      const calloutLine = [arrowTip, knee, connectionPoint];
      const overallRect = computeCalloutOverallRect(
        textBox,
        calloutLine,
        defaults.lineEnding,
        defaults.strokeWidth
      );
      const rd = computeRDFromTextBox(overallRect, textBox);
      const anno = {
        ...defaults,
        type: PdfAnnotationSubtype.FREETEXT,
        intent: "FreeTextCallout",
        rect: overallRect,
        rectangleDifferences: rd,
        calloutLine,
        pageIndex,
        id: uuidV4(),
        created: /* @__PURE__ */ new Date()
      };
      onCommit(anno);
      resetState();
    };
    const resetState = () => {
      setPhase("arrow");
      setArrowTip(null);
      setKnee(null);
      setDownPos(null);
      setTextBoxStart(null);
      setDragging(false);
      onPreview(null);
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a, _b;
        const clampedPos = clampToPage(pos);
        const phase = getPhase();
        if (phase === "arrow" || phase === "knee") {
          setDownPos(clampedPos);
          (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
        } else if (phase === "textbox") {
          setTextBoxStart(clampedPos);
          setDragging(true);
          (_b = evt.setPointerCapture) == null ? void 0 : _b.call(evt);
        }
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        const phase = getPhase();
        if (phase === "textbox" && getDragging()) {
          onPreview(buildPreview(clampedPos));
        } else if (phase === "knee" || phase === "textbox") {
          onPreview(buildPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a, _b, _c, _d;
        const clampedPos = clampToPage(pos);
        const phase = getPhase();
        const downPos = getDownPos();
        if (phase === "arrow" && downPos && isClick(downPos, clampedPos)) {
          setArrowTip(clampedPos);
          setPhase("knee");
          setDownPos(null);
          (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
          return;
        }
        if (phase === "knee" && downPos && isClick(downPos, clampedPos)) {
          setKnee(clampedPos);
          setPhase("textbox");
          setDownPos(null);
          (_b = evt.releasePointerCapture) == null ? void 0 : _b.call(evt);
          return;
        }
        if (phase === "textbox" && getDragging()) {
          const tbStart = getTextBoxStart();
          if (tbStart) {
            const minX = Math.min(tbStart.x, clampedPos.x);
            const minY = Math.min(tbStart.y, clampedPos.y);
            const w = Math.abs(clampedPos.x - tbStart.x);
            const h = Math.abs(clampedPos.y - tbStart.y);
            if (w > 5 || h > 5) {
              const textBox = {
                origin: { x: minX, y: minY },
                size: { width: Math.max(w, 20), height: Math.max(h, 14) }
              };
              commitCallout(textBox);
            } else {
              commitCallout({
                origin: {
                  x: tbStart.x - DEFAULT_TB_WIDTH / 2,
                  y: tbStart.y - DEFAULT_TB_HEIGHT / 2
                },
                size: { width: DEFAULT_TB_WIDTH, height: DEFAULT_TB_HEIGHT }
              });
            }
          }
          (_c = evt.releasePointerCapture) == null ? void 0 : _c.call(evt);
          return;
        }
        setDownPos(null);
        (_d = evt.releasePointerCapture) == null ? void 0 : _d.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        resetState();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const lineHandlerFactory = {
  annotationType: PdfAnnotationSubtype.LINE,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        lineEndings: tool.defaults.lineEndings ?? {
          start: PdfAnnotationLineEnding.None,
          end: PdfAnnotationLineEnding.None
        },
        color: tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
        strokeDashArray: tool.defaults.strokeDashArray ?? [],
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const clickDetector = useClickDetector({
      threshold: 5,
      getTool,
      onClickDetected: (pos, tool) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const clickConfig = tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const angle = clickConfig.defaultAngle ?? 0;
        const length = clickConfig.defaultLength;
        const halfLength = length / 2;
        const startX = pos.x - halfLength * Math.cos(angle);
        const startY = pos.y - halfLength * Math.sin(angle);
        const endX = pos.x + halfLength * Math.cos(angle);
        const endY = pos.y + halfLength * Math.sin(angle);
        const start = clampToPage({ x: startX, y: startY });
        const end = clampToPage({ x: endX, y: endY });
        const rect = lineRectWithEndings(
          [start, end],
          defaults.strokeWidth,
          defaults.lineEndings
        );
        onCommit({
          ...defaults,
          rect,
          linePoints: { start, end },
          pageIndex,
          id: uuidV4(),
          created: /* @__PURE__ */ new Date(),
          type: PdfAnnotationSubtype.LINE
        });
      }
    });
    const getPreview = (current) => {
      const start = getStart();
      if (!start) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const bounds = lineRectWithEndings(
        [start, current],
        defaults.strokeWidth,
        defaults.lineEndings
      );
      return {
        type: PdfAnnotationSubtype.LINE,
        bounds,
        data: {
          ...defaults,
          rect: bounds,
          linePoints: { start, end: current }
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const start = getStart();
        if (!start) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const defaults = getDefaults();
          if (!defaults) return;
          if (Math.abs(clampedPos.x - start.x) > 2 || Math.abs(clampedPos.y - start.y) > 2) {
            const rect = lineRectWithEndings(
              [start, clampedPos],
              defaults.strokeWidth,
              defaults.lineEndings
            );
            onCommit({
              ...defaults,
              rect,
              linePoints: { start, end: clampedPos },
              pageIndex,
              id: uuidV4(),
              flags: ["print"],
              created: /* @__PURE__ */ new Date(),
              type: PdfAnnotationSubtype.LINE
            });
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const polylineHandlerFactory = {
  annotationType: PdfAnnotationSubtype.POLYLINE,
  create(context) {
    const { onCommit, onPreview, getTool, pageSize } = context;
    const [getVertices, setVertices] = useState([]);
    const [getCurrent, setCurrent] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        lineEndings: tool.defaults.lineEndings ?? {
          start: PdfAnnotationLineEnding.None,
          end: PdfAnnotationLineEnding.None
        },
        color: tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
        strokeDashArray: tool.defaults.strokeDashArray ?? [],
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const commitPolyline = () => {
      const vertices = getVertices();
      if (vertices.length < 2) return;
      const defaults = getDefaults();
      if (!defaults) return;
      const rect = lineRectWithEndings(
        vertices,
        defaults.strokeWidth,
        defaults.lineEndings
      );
      const anno = {
        ...defaults,
        vertices,
        rect,
        type: PdfAnnotationSubtype.POLYLINE,
        pageIndex: context.pageIndex,
        id: uuidV4(),
        created: /* @__PURE__ */ new Date()
      };
      onCommit(anno);
      setVertices([]);
      setCurrent(null);
      onPreview(null);
    };
    const getPreview = () => {
      const vertices = getVertices();
      const currentPos = getCurrent();
      if (vertices.length === 0 || !currentPos) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const allPoints = [...vertices, currentPos];
      const bounds = lineRectWithEndings(
        allPoints,
        defaults.strokeWidth,
        defaults.lineEndings
      );
      return {
        type: PdfAnnotationSubtype.POLYLINE,
        bounds,
        data: {
          ...defaults,
          rect: bounds,
          vertices: allPoints,
          currentVertex: currentPos
        }
      };
    };
    return {
      onClick: (pos, evt) => {
        if (evt.metaKey || evt.ctrlKey) {
          return;
        }
        const clampedPos = clampToPage(pos);
        const vertices = getVertices();
        const lastVertex = vertices[vertices.length - 1];
        if (lastVertex && Math.abs(lastVertex.x - clampedPos.x) < 1 && Math.abs(lastVertex.y - clampedPos.y) < 1) {
          return;
        }
        setVertices([...vertices, clampedPos]);
        setCurrent(clampedPos);
        onPreview(getPreview());
      },
      onDoubleClick: () => {
        commitPolyline();
      },
      onPointerMove: (pos) => {
        if (getVertices().length > 0) {
          const clampedPos = clampToPage(pos);
          setCurrent(clampedPos);
          onPreview(getPreview());
        }
      },
      onPointerCancel: () => {
        setVertices([]);
        setCurrent(null);
        onPreview(null);
      }
    };
  }
};
const HANDLE_SIZE_PX = 14;
const polygonHandlerFactory = {
  annotationType: PdfAnnotationSubtype.POLYGON,
  create(context) {
    const { onCommit, onPreview, getTool, scale, pageSize } = context;
    const [getVertices, setVertices] = useState([]);
    const [getCurrent, setCurrent] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const isInsideStartHandle = (pos) => {
      const vertices = getVertices();
      if (vertices.length < 2) return false;
      const sizePDF = HANDLE_SIZE_PX / scale;
      const half = sizePDF / 2;
      const v0 = vertices[0];
      return pos.x >= v0.x - half && pos.x <= v0.x + half && pos.y >= v0.y - half && pos.y <= v0.y + half;
    };
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        color: tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        strokeWidth: tool.defaults.strokeWidth ?? 1,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
        strokeDashArray: tool.defaults.strokeDashArray ?? [],
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const commitPolygon = () => {
      const vertices = getVertices();
      if (vertices.length < 3) return;
      const defaults = getDefaults();
      if (!defaults) return;
      const intensity = defaults.cloudyBorderIntensity ?? 0;
      const pad = intensity > 0 ? getCloudyBorderExtent(intensity, defaults.strokeWidth, false) : defaults.strokeWidth / 2;
      const rect = expandRect(rectFromPoints(vertices), pad);
      const anno = {
        ...defaults,
        vertices,
        rect,
        type: PdfAnnotationSubtype.POLYGON,
        pageIndex: context.pageIndex,
        id: uuidV4(),
        created: /* @__PURE__ */ new Date(),
        ...intensity > 0 && {
          rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
        }
      };
      onCommit(anno);
      setVertices([]);
      setCurrent(null);
      onPreview(null);
    };
    const getPreview = () => {
      const vertices = getVertices();
      const currentPos = getCurrent();
      if (vertices.length === 0 || !currentPos) return null;
      const defaults = getDefaults();
      if (!defaults) return null;
      const intensity = defaults.cloudyBorderIntensity ?? 0;
      const pad = intensity > 0 ? getCloudyBorderExtent(intensity, defaults.strokeWidth, false) : defaults.strokeWidth / 2;
      const allPoints = [...vertices, currentPos];
      const bounds = expandRect(rectFromPoints(allPoints), pad);
      return {
        type: PdfAnnotationSubtype.POLYGON,
        bounds,
        data: {
          ...defaults,
          rect: bounds,
          vertices,
          currentVertex: currentPos
        }
      };
    };
    return {
      onClick: (pos, evt) => {
        if (evt.metaKey || evt.ctrlKey) {
          return;
        }
        const clampedPos = clampToPage(pos);
        if (isInsideStartHandle(clampedPos) && getVertices().length >= 3) {
          commitPolygon();
          return;
        }
        const vertices = getVertices();
        const lastVertex = vertices[vertices.length - 1];
        if (lastVertex && Math.abs(lastVertex.x - clampedPos.x) < 1 && Math.abs(lastVertex.y - clampedPos.y) < 1) {
          return;
        }
        setVertices([...vertices, clampedPos]);
        setCurrent(clampedPos);
        onPreview(getPreview());
      },
      onDoubleClick: (_) => {
        commitPolygon();
      },
      onPointerMove: (pos) => {
        if (getVertices().length > 0) {
          const clampedPos = clampToPage(pos);
          setCurrent(clampedPos);
          onPreview(getPreview());
        }
      },
      onPointerCancel: (_) => {
        setVertices([]);
        setCurrent(null);
        onPreview(null);
      }
    };
  }
};
const squareHandlerFactory = {
  annotationType: PdfAnnotationSubtype.SQUARE,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        flags: tool.defaults.flags ?? ["print"],
        strokeWidth: tool.defaults.strokeWidth ?? 2,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
        strokeDashArray: tool.defaults.strokeDashArray ?? [],
        color: tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1
      };
    };
    const clickDetector = useClickDetector({
      threshold: 5,
      getTool,
      onClickDetected: (pos, tool) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const clickConfig = tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const x = clamp(pos.x - halfWidth, 0, pageSize.width - width);
        const y = clamp(pos.y - halfHeight, 0, pageSize.height - height);
        const strokeWidth = defaults.strokeWidth;
        const intensity = defaults.cloudyBorderIntensity ?? 0;
        const pad = intensity > 0 ? getCloudyBorderExtent(intensity, strokeWidth, false) : strokeWidth / 2;
        const rect = {
          origin: { x: x - pad, y: y - pad },
          size: { width: width + 2 * pad, height: height + 2 * pad }
        };
        const anno = {
          ...defaults,
          type: PdfAnnotationSubtype.SQUARE,
          created: /* @__PURE__ */ new Date(),
          id: uuidV4(),
          pageIndex,
          rect,
          ...intensity > 0 && {
            rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
          }
        };
        onCommit(anno);
      }
    });
    const getPreview = (current) => {
      const p1 = getStart();
      if (!p1) return null;
      const minX = Math.min(p1.x, current.x);
      const minY = Math.min(p1.y, current.y);
      const width = Math.abs(p1.x - current.x);
      const height = Math.abs(p1.y - current.y);
      const defaults = getDefaults();
      if (!defaults) return null;
      const strokeWidth = defaults.strokeWidth;
      const intensity = defaults.cloudyBorderIntensity ?? 0;
      const pad = intensity > 0 ? getCloudyBorderExtent(intensity, strokeWidth, false) : strokeWidth / 2;
      const rect = {
        origin: { x: minX - pad, y: minY - pad },
        size: { width: width + 2 * pad, height: height + 2 * pad }
      };
      return {
        type: PdfAnnotationSubtype.SQUARE,
        bounds: rect,
        data: {
          rect,
          ...defaults,
          ...intensity > 0 && {
            rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
          }
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const p1 = getStart();
        if (!p1) return;
        const defaults = getDefaults();
        if (!defaults) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const defaults2 = getDefaults();
          if (!defaults2) return;
          const preview = getPreview(clampedPos);
          if (preview) {
            const intensity = defaults2.cloudyBorderIntensity ?? 0;
            const pad = intensity > 0 ? getCloudyBorderExtent(intensity, defaults2.strokeWidth, false) : void 0;
            const anno = {
              ...defaults2,
              type: PdfAnnotationSubtype.SQUARE,
              created: /* @__PURE__ */ new Date(),
              id: uuidV4(),
              pageIndex,
              rect: preview.data.rect,
              ...pad !== void 0 && {
                rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
              }
            };
            onCommit(anno);
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const imageFetchCache = /* @__PURE__ */ new Map();
const stampHandlerFactory = {
  annotationType: PdfAnnotationSubtype.STAMP,
  create(context) {
    const { services, onCommit, onPreview, getTool, pageSize, pageRotation } = context;
    let cachedBuffer = null;
    let cachedSize = null;
    const commitStamp = (pos, width, height, ctx) => {
      var _a;
      const tool = getTool();
      if (!tool) return;
      const rect = {
        origin: { x: pos.x - width / 2, y: pos.y - height / 2 },
        size: { width, height }
      };
      let anno = {
        ...tool.defaults,
        rect,
        type: PdfAnnotationSubtype.STAMP,
        name: tool.defaults.name ?? PdfAnnotationName.Image,
        subject: tool.defaults.subject ?? "Stamp",
        flags: tool.defaults.flags ?? ["print"],
        pageIndex: context.pageIndex,
        id: uuidV4(),
        created: /* @__PURE__ */ new Date()
      };
      if ((_a = tool.behavior) == null ? void 0 : _a.insertUpright) {
        anno = applyInsertUpright(anno, pageRotation, false);
      }
      anno = clampAnnotationToPage(anno, pageSize);
      onCommit(anno, ctx);
    };
    const commitFromBuffer = (pos, buffer, imageSize) => {
      const meta = getImageMetadata(buffer);
      if (!meta || meta.mimeType === "application/pdf") return false;
      const fitted = fitSizeWithin(meta, pageSize);
      const width = (imageSize == null ? void 0 : imageSize.width) ?? fitted.width;
      const height = (imageSize == null ? void 0 : imageSize.height) ?? fitted.height;
      commitStamp(pos, width, height, { data: buffer });
      return true;
    };
    return {
      onHandlerActiveStart: () => {
        const tool = getTool();
        const imageSrc = tool == null ? void 0 : tool.defaults.imageSrc;
        if (!imageSrc) return;
        let entry = imageFetchCache.get(imageSrc);
        if (!entry) {
          const promise = fetch(imageSrc).then((res) => res.arrayBuffer()).then((buffer) => {
            const meta = getImageMetadata(buffer);
            if (!meta || meta.mimeType === "application/pdf") return null;
            const fitted = fitSizeWithin(meta, pageSize);
            const imageSize = tool.defaults.imageSize;
            return {
              buffer,
              width: (imageSize == null ? void 0 : imageSize.width) ?? fitted.width,
              height: (imageSize == null ? void 0 : imageSize.height) ?? fitted.height
            };
          }).catch(() => null);
          entry = { promise, refs: 1 };
          imageFetchCache.set(imageSrc, entry);
        } else {
          entry.refs++;
        }
        entry.promise.then((result) => {
          if (!result) return;
          cachedBuffer = result.buffer;
          cachedSize = { width: result.width, height: result.height };
        });
      },
      onHandlerActiveEnd: () => {
        const tool = getTool();
        const imageSrc = tool == null ? void 0 : tool.defaults.imageSrc;
        if (imageSrc) {
          const entry = imageFetchCache.get(imageSrc);
          if (entry && --entry.refs <= 0) {
            imageFetchCache.delete(imageSrc);
          }
        }
        cachedBuffer = null;
        cachedSize = null;
        onPreview(null);
      },
      onPointerMove: (pos) => {
        var _a;
        const tool = getTool();
        if (!((_a = tool == null ? void 0 : tool.behavior) == null ? void 0 : _a.showGhost) || !cachedSize || !tool.defaults.imageSrc) return;
        const rect = {
          origin: { x: pos.x - cachedSize.width / 2, y: pos.y - cachedSize.height / 2 },
          size: cachedSize
        };
        onPreview({
          type: PdfAnnotationSubtype.STAMP,
          bounds: rect,
          data: { rect, ghostUrl: tool.defaults.imageSrc, pageRotation }
        });
      },
      onPointerDown: (pos) => {
        const tool = getTool();
        if (!tool) return;
        const { imageSrc, imageSize } = tool.defaults;
        if (imageSrc) {
          onPreview(null);
          if (cachedBuffer) {
            commitFromBuffer(pos, cachedBuffer, imageSize);
          } else {
            fetch(imageSrc).then((res) => res.arrayBuffer()).then((buffer) => commitFromBuffer(pos, buffer, imageSize));
          }
        } else {
          services.requestFile({
            accept: "image/png,image/jpeg",
            onFile: (file) => {
              file.arrayBuffer().then((buffer) => commitFromBuffer(pos, buffer));
            }
          });
        }
      },
      onPointerLeave: () => {
        onPreview(null);
      }
    };
  }
};
const circleHandlerFactory = {
  annotationType: PdfAnnotationSubtype.CIRCLE,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        strokeWidth: tool.defaults.strokeWidth ?? 2,
        strokeColor: tool.defaults.strokeColor ?? "#000000",
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
        strokeDashArray: tool.defaults.strokeDashArray ?? [],
        color: tool.defaults.color ?? "#000000",
        opacity: tool.defaults.opacity ?? 1,
        flags: tool.defaults.flags ?? ["print"]
      };
    };
    const clickDetector = useClickDetector({
      threshold: 5,
      getTool,
      onClickDetected: (pos, tool) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const clickConfig = tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const x = clamp(pos.x - halfWidth, 0, pageSize.width - width);
        const y = clamp(pos.y - halfHeight, 0, pageSize.height - height);
        const strokeWidth = defaults.strokeWidth;
        const intensity = defaults.cloudyBorderIntensity ?? 0;
        const pad = intensity > 0 ? getCloudyBorderExtent(intensity, strokeWidth, true) : strokeWidth / 2;
        const rect = {
          origin: { x: x - pad, y: y - pad },
          size: { width: width + 2 * pad, height: height + 2 * pad }
        };
        const anno = {
          ...defaults,
          type: PdfAnnotationSubtype.CIRCLE,
          created: /* @__PURE__ */ new Date(),
          id: uuidV4(),
          pageIndex,
          rect,
          ...intensity > 0 && {
            rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
          }
        };
        onCommit(anno);
      }
    });
    const getPreview = (current) => {
      const p1 = getStart();
      if (!p1) return null;
      const minX = Math.min(p1.x, current.x);
      const minY = Math.min(p1.y, current.y);
      const width = Math.abs(p1.x - current.x);
      const height = Math.abs(p1.y - current.y);
      const defaults = getDefaults();
      if (!defaults) return null;
      const strokeWidth = defaults.strokeWidth;
      const intensity = defaults.cloudyBorderIntensity ?? 0;
      const pad = intensity > 0 ? getCloudyBorderExtent(intensity, strokeWidth, true) : strokeWidth / 2;
      const rect = {
        origin: { x: minX - pad, y: minY - pad },
        size: { width: width + 2 * pad, height: height + 2 * pad }
      };
      return {
        type: PdfAnnotationSubtype.CIRCLE,
        bounds: rect,
        data: {
          rect,
          ...defaults,
          ...intensity > 0 && {
            rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
          }
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const p1 = getStart();
        if (!p1) return;
        const defaults = getDefaults();
        if (!defaults) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const defaults2 = getDefaults();
          if (!defaults2) return;
          const preview = getPreview(clampedPos);
          if (preview) {
            const intensity = defaults2.cloudyBorderIntensity ?? 0;
            const pad = intensity > 0 ? getCloudyBorderExtent(intensity, defaults2.strokeWidth, true) : void 0;
            const anno = {
              ...defaults2,
              type: PdfAnnotationSubtype.CIRCLE,
              flags: ["print"],
              created: /* @__PURE__ */ new Date(),
              id: uuidV4(),
              pageIndex,
              rect: preview.data.rect,
              ...pad !== void 0 && {
                rectangleDifferences: { left: pad, top: pad, right: pad, bottom: pad }
              }
            };
            onCommit(anno);
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const linkHandlerFactory = {
  annotationType: PdfAnnotationSubtype.LINK,
  create(context) {
    const { pageIndex, onCommit, onPreview, getTool, pageSize } = context;
    const [getStart, setStart] = useState(null);
    const clampToPage = (pos) => ({
      x: clamp(pos.x, 0, pageSize.width),
      y: clamp(pos.y, 0, pageSize.height)
    });
    const getDefaults = () => {
      const tool = getTool();
      if (!tool) return null;
      return {
        ...tool.defaults,
        flags: tool.defaults.flags ?? ["print"],
        strokeWidth: tool.defaults.strokeWidth ?? 2,
        strokeColor: tool.defaults.strokeColor ?? "#0000FF",
        strokeStyle: tool.defaults.strokeStyle ?? PdfAnnotationBorderStyle.UNDERLINE,
        strokeDashArray: tool.defaults.strokeDashArray ?? []
      };
    };
    const clickDetector = useClickDetector({
      threshold: 5,
      getTool,
      onClickDetected: (pos, tool) => {
        const defaults = getDefaults();
        if (!defaults) return;
        const clickConfig = tool.clickBehavior;
        if (!(clickConfig == null ? void 0 : clickConfig.enabled)) return;
        const { width, height } = clickConfig.defaultSize;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const x = clamp(pos.x - halfWidth, 0, pageSize.width - width);
        const y = clamp(pos.y - halfHeight, 0, pageSize.height - height);
        const rect = {
          origin: { x, y },
          size: { width, height }
        };
        const anno = {
          ...defaults,
          type: PdfAnnotationSubtype.LINK,
          target: void 0,
          created: /* @__PURE__ */ new Date(),
          id: uuidV4(),
          pageIndex,
          rect
        };
        onCommit(anno);
      }
    });
    const getPreview = (current) => {
      const p1 = getStart();
      if (!p1) return null;
      const minX = Math.min(p1.x, current.x);
      const minY = Math.min(p1.y, current.y);
      const width = Math.abs(p1.x - current.x);
      const height = Math.abs(p1.y - current.y);
      const defaults = getDefaults();
      if (!defaults) return null;
      const rect = {
        origin: { x: minX, y: minY },
        size: { width, height }
      };
      return {
        type: PdfAnnotationSubtype.LINK,
        bounds: rect,
        data: {
          rect,
          strokeColor: defaults.strokeColor,
          strokeWidth: defaults.strokeWidth,
          strokeStyle: defaults.strokeStyle,
          strokeDashArray: defaults.strokeDashArray
        }
      };
    };
    return {
      onPointerDown: (pos, evt) => {
        var _a;
        const clampedPos = clampToPage(pos);
        setStart(clampedPos);
        clickDetector.onStart(clampedPos);
        onPreview(getPreview(clampedPos));
        (_a = evt.setPointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerMove: (pos) => {
        const clampedPos = clampToPage(pos);
        clickDetector.onMove(clampedPos);
        if (getStart() && clickDetector.hasMoved()) {
          onPreview(getPreview(clampedPos));
        }
      },
      onPointerUp: (pos, evt) => {
        var _a;
        const p1 = getStart();
        if (!p1) return;
        const defaults = getDefaults();
        if (!defaults) return;
        const clampedPos = clampToPage(pos);
        if (!clickDetector.hasMoved()) {
          clickDetector.onEnd(clampedPos);
        } else {
          const preview = getPreview(clampedPos);
          if (preview) {
            const anno = {
              ...defaults,
              type: PdfAnnotationSubtype.LINK,
              target: void 0,
              created: /* @__PURE__ */ new Date(),
              id: uuidV4(),
              pageIndex,
              rect: preview.data.rect
            };
            onCommit(anno);
          }
        }
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerLeave: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      },
      onPointerCancel: (_, evt) => {
        var _a;
        setStart(null);
        onPreview(null);
        clickDetector.reset();
        (_a = evt.releasePointerCapture) == null ? void 0 : _a.call(evt);
      }
    };
  }
};
const textMarkupSelectionHandler = {
  toolId: "__textMarkup__",
  handle(context, selections, getText) {
    const tool = context.getTool();
    if (!tool) return;
    for (const selection of selections) {
      const id = uuidV4();
      getText().then((text) => {
        var _a;
        context.createAnnotation(selection.pageIndex, {
          ...tool.defaults,
          rect: selection.rect,
          segmentRects: selection.segmentRects,
          pageIndex: selection.pageIndex,
          created: /* @__PURE__ */ new Date(),
          id,
          ...text != null && { custom: { text } }
        });
        if ((_a = tool.behavior) == null ? void 0 : _a.selectAfterCreate) {
          context.selectAnnotation(selection.pageIndex, id);
        }
      });
    }
  }
};
function computeCaretRect(lastSegRect) {
  const lineHeight = lastSegRect.size.height;
  const height = lineHeight / 2;
  const width = height;
  const lineEndX = lastSegRect.origin.x + lastSegRect.size.width;
  return {
    origin: {
      x: lineEndX - width / 2,
      y: lastSegRect.origin.y + lineHeight / 2
    },
    size: { width, height }
  };
}
const insertTextSelectionHandler = {
  toolId: "insertText",
  handle(context, selections, getText) {
    const tool = context.getTool();
    if (!tool) return;
    const getDefaults = () => ({
      strokeColor: tool.defaults.strokeColor ?? "#E44234",
      opacity: tool.defaults.opacity ?? 1,
      flags: tool.defaults.flags ?? ["print"]
    });
    for (const selection of selections) {
      const lastSegRect = selection.segmentRects[selection.segmentRects.length - 1];
      if (!lastSegRect) continue;
      const caretRect = computeCaretRect(lastSegRect);
      const caretId = uuidV4();
      const defaults = getDefaults();
      getText().then((text) => {
        var _a;
        context.createAnnotation(selection.pageIndex, {
          type: PdfAnnotationSubtype.CARET,
          id: caretId,
          pageIndex: selection.pageIndex,
          rect: caretRect,
          strokeColor: defaults.strokeColor,
          opacity: defaults.opacity,
          intent: "Insert",
          rectangleDifferences: { left: 0.5, top: 0.5, right: 0.5, bottom: 0.5 },
          created: /* @__PURE__ */ new Date(),
          flags: defaults.flags,
          ...text != null && { custom: { text } }
        });
        if ((_a = tool.behavior) == null ? void 0 : _a.selectAfterCreate) {
          context.selectAnnotation(selection.pageIndex, caretId);
        }
      });
    }
  }
};
const replaceTextSelectionHandler = {
  toolId: "replaceText",
  handle(context, selections, getText) {
    const tool = context.getTool();
    if (!tool) return;
    const getDefaults = () => ({
      strokeColor: tool.defaults.strokeColor ?? "#E44234",
      opacity: tool.defaults.opacity ?? 1,
      flags: tool.defaults.flags ?? ["print"]
    });
    for (const selection of selections) {
      const lastSegRect = selection.segmentRects[selection.segmentRects.length - 1];
      if (!lastSegRect) continue;
      const caretRect = computeCaretRect(lastSegRect);
      const caretId = uuidV4();
      const strikeoutId = uuidV4();
      const defaults = getDefaults();
      getText().then((text) => {
        var _a;
        context.createAnnotation(selection.pageIndex, {
          type: PdfAnnotationSubtype.CARET,
          id: caretId,
          pageIndex: selection.pageIndex,
          rect: caretRect,
          strokeColor: defaults.strokeColor,
          opacity: defaults.opacity,
          intent: "Replace",
          rectangleDifferences: { left: 0.5, top: 0.5, right: 0.5, bottom: 0.5 },
          created: /* @__PURE__ */ new Date(),
          flags: defaults.flags
        });
        context.createAnnotation(selection.pageIndex, {
          type: PdfAnnotationSubtype.STRIKEOUT,
          id: strikeoutId,
          pageIndex: selection.pageIndex,
          rect: selection.rect,
          segmentRects: selection.segmentRects,
          strokeColor: defaults.strokeColor,
          opacity: defaults.opacity,
          intent: "StrikeOutTextEdit",
          inReplyToId: caretId,
          replyType: PdfAnnotationReplyType.Group,
          created: /* @__PURE__ */ new Date(),
          flags: defaults.flags,
          ...text != null && { custom: { text } }
        });
        if ((_a = tool.behavior) == null ? void 0 : _a.selectAfterCreate) {
          context.selectAnnotation(selection.pageIndex, caretId);
        }
      });
    }
  }
};
const textMarkupTools = [
  {
    id: "highlight",
    name: "Highlight",
    labelKey: "annotation.highlight",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.HIGHLIGHT ? 1 : 0,
    interaction: {
      exclusive: false,
      textSelection: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      // Text markup annotations are anchored to text and should not move/resize in groups
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.HIGHLIGHT,
      strokeColor: "#FFCD45",
      color: "#FFCD45",
      // deprecated alias
      opacity: 1,
      blendMode: PdfBlendMode.Multiply
    }
  },
  {
    id: "underline",
    name: "Underline",
    labelKey: "annotation.underline",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.UNDERLINE ? 1 : 0,
    interaction: {
      exclusive: false,
      textSelection: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.UNDERLINE,
      strokeColor: "#E44234",
      color: "#E44234",
      // deprecated alias
      opacity: 1
    }
  },
  {
    id: "strikeout",
    name: "Strikeout",
    labelKey: "annotation.strikeout",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.STRIKEOUT ? 1 : 0,
    interaction: {
      exclusive: false,
      textSelection: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.STRIKEOUT,
      strokeColor: "#E44234",
      color: "#E44234",
      // deprecated alias
      opacity: 1
    }
  },
  {
    id: "squiggly",
    name: "Squiggly",
    labelKey: "annotation.squiggly",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.SQUIGGLY ? 1 : 0,
    interaction: {
      exclusive: false,
      textSelection: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.SQUIGGLY,
      strokeColor: "#E44234",
      color: "#E44234",
      // deprecated alias
      opacity: 1
    }
  }
];
const insertTextTools = [
  {
    id: "insertText",
    name: "Insert Text",
    labelKey: "annotation.insertText",
    categories: ["annotation", "markup"],
    matchScore: (a) => {
      var _a;
      if (a.type !== PdfAnnotationSubtype.CARET) return 0;
      return ((_a = a.intent) == null ? void 0 : _a.includes("Insert")) ? 2 : 1;
    },
    interaction: {
      exclusive: false,
      textSelection: true,
      showSelectionRects: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.CARET,
      strokeColor: "#E44234",
      opacity: 1,
      intent: "Insert"
    },
    selectionHandler: insertTextSelectionHandler
  }
];
const replaceTextTools = [
  {
    id: "replaceText",
    name: "Replace Text",
    labelKey: "annotation.replaceText",
    categories: ["annotation", "markup"],
    matchScore: (a) => {
      var _a, _b;
      if (a.type === PdfAnnotationSubtype.STRIKEOUT && ((_a = a.intent) == null ? void 0 : _a.includes("StrikeOutTextEdit")))
        return 2;
      if (a.type === PdfAnnotationSubtype.CARET && ((_b = a.intent) == null ? void 0 : _b.includes("Replace"))) return 2;
      return 0;
    },
    interaction: {
      exclusive: false,
      textSelection: true,
      isDraggable: false,
      isResizable: false,
      isRotatable: false,
      isGroupDraggable: false,
      isGroupResizable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.STRIKEOUT,
      strokeColor: "#E44234",
      opacity: 1,
      intent: "StrikeOutTextEdit"
    },
    selectionHandler: replaceTextSelectionHandler
  }
];
const inkTools = [
  {
    id: "ink",
    name: "Pen",
    labelKey: "annotation.ink",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.INK && a.intent !== "InkHighlight" ? 5 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: false
    },
    defaults: {
      type: PdfAnnotationSubtype.INK,
      strokeColor: "#E44234",
      color: "#E44234",
      // deprecated alias
      opacity: 1,
      strokeWidth: 6
    },
    behavior: {
      commitDelay: 800
    },
    transform: patchInk,
    pointerHandler: inkHandlerFactory
  },
  {
    id: "inkHighlighter",
    name: "Ink Highlighter",
    labelKey: "annotation.inkHighlighter",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.INK && a.intent === "InkHighlight" ? 10 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: false,
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.INK,
      intent: "InkHighlight",
      strokeColor: "#FFCD45",
      color: "#FFCD45",
      // deprecated alias
      opacity: 1,
      strokeWidth: 14,
      blendMode: PdfBlendMode.Multiply
    },
    behavior: {
      commitDelay: 800,
      smartLineRecognition: true,
      smartLineThreshold: 0.15
    },
    transform: patchInk,
    pointerHandler: inkHandlerFactory
  }
];
const circleTools = [
  {
    id: "circle",
    name: "Circle",
    labelKey: "annotation.circle",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.CIRCLE ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: false,
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.CIRCLE,
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234",
      strokeStyle: PdfAnnotationBorderStyle.SOLID
    },
    clickBehavior: {
      enabled: true,
      defaultSize: { width: 100, height: 100 }
    },
    transform: patchCircle,
    pointerHandler: circleHandlerFactory
  }
];
const squareTools = [
  {
    id: "square",
    name: "Square",
    labelKey: "annotation.square",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.SQUARE ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: false,
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.SQUARE,
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234",
      strokeStyle: PdfAnnotationBorderStyle.SOLID
    },
    clickBehavior: {
      enabled: true,
      defaultSize: { width: 100, height: 100 }
    },
    transform: patchSquare,
    pointerHandler: squareHandlerFactory
  }
];
const lineTools = [
  {
    id: "line",
    name: "Line",
    labelKey: "annotation.line",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.LINE && a.intent !== "LineArrow" ? 5 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      // Uses vertex editing when selected individually
      lockAspectRatio: false,
      isGroupResizable: true,
      // Scales proportionally in a group
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.LINE,
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234"
    },
    clickBehavior: {
      enabled: true,
      defaultLength: 100,
      defaultAngle: 0
    },
    transform: patchLine,
    pointerHandler: lineHandlerFactory
  },
  {
    id: "lineArrow",
    name: "Arrow",
    labelKey: "annotation.arrow",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.LINE && a.intent === "LineArrow" ? 10 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      // Uses vertex editing when selected individually
      lockAspectRatio: false,
      isGroupResizable: true,
      // Scales proportionally in a group
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.LINE,
      intent: "LineArrow",
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234",
      lineEndings: {
        start: PdfAnnotationLineEnding.None,
        end: PdfAnnotationLineEnding.OpenArrow
      }
    },
    clickBehavior: {
      enabled: true,
      defaultLength: 100,
      defaultAngle: 0
    },
    transform: patchLine,
    pointerHandler: lineHandlerFactory
  }
];
const polylineTools = [
  {
    id: "polyline",
    name: "Polyline",
    labelKey: "annotation.polyline",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.POLYLINE ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      // Uses vertex editing when selected individually
      lockAspectRatio: false,
      isGroupResizable: true,
      // Scales proportionally in a group
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.POLYLINE,
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234"
    },
    transform: patchPolyline,
    pointerHandler: polylineHandlerFactory
  }
];
const polygonTools = [
  {
    id: "polygon",
    name: "Polygon",
    labelKey: "annotation.polygon",
    categories: ["annotation", "shape"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.POLYGON ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      // Uses vertex editing when selected individually
      lockAspectRatio: false,
      isGroupResizable: true,
      // Scales proportionally in a group
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.POLYGON,
      color: "transparent",
      opacity: 1,
      strokeWidth: 6,
      strokeColor: "#E44234"
    },
    transform: patchPolygon,
    pointerHandler: polygonHandlerFactory
  }
];
const textCommentTools = [
  {
    id: "textComment",
    name: "Comment",
    labelKey: "annotation.text",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.TEXT && !a.inReplyToId ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      isRotatable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.TEXT,
      strokeColor: "#FFCD45",
      opacity: 1
    },
    behavior: {
      selectAfterCreate: true
    },
    pointerHandler: textHandlerFactory
  }
];
const freeTextTools = [
  {
    id: "freeText",
    name: "Free Text",
    labelKey: "annotation.freeText",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent !== "FreeTextCallout" ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: false,
      lockGroupAspectRatio: (a) => {
        const r2 = ((a.rotation ?? 0) % 90 + 90) % 90;
        return r2 >= 6 && r2 <= 84;
      }
    },
    defaults: {
      type: PdfAnnotationSubtype.FREETEXT,
      contents: "Insert text",
      fontSize: 14,
      fontColor: "#E44234",
      fontFamily: PdfStandardFont.Helvetica,
      textAlign: PdfTextAlignment.Left,
      verticalAlign: PdfVerticalAlignment.Top,
      color: "transparent",
      // fill color (matches shape convention)
      backgroundColor: "transparent",
      // deprecated alias
      opacity: 1
    },
    clickBehavior: {
      enabled: true,
      defaultSize: { width: 100, height: 20 },
      defaultContent: "Insert text"
    },
    behavior: {
      insertUpright: true,
      editAfterCreate: true,
      selectAfterCreate: true
    },
    transform: patchFreeText,
    pointerHandler: freeTextHandlerFactory
  }
];
const calloutFreeTextTools = [
  {
    id: "freeTextCallout",
    name: "Callout",
    labelKey: "annotation.callout",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.FREETEXT && a.intent === "FreeTextCallout" ? 10 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: false,
      isRotatable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.FREETEXT,
      intent: "FreeTextCallout",
      contents: "Insert text",
      fontSize: 14,
      fontColor: "#E44234",
      fontFamily: PdfStandardFont.Helvetica,
      textAlign: PdfTextAlignment.Left,
      verticalAlign: PdfVerticalAlignment.Top,
      color: "transparent",
      opacity: 1,
      lineEnding: PdfAnnotationLineEnding.OpenArrow,
      strokeColor: "#E44234",
      strokeWidth: 1
    },
    behavior: {
      insertUpright: true,
      editAfterCreate: true,
      selectAfterCreate: true
    },
    transform: patchCalloutFreeText,
    pointerHandler: calloutFreeTextHandlerFactory
  }
];
const stampTools = [
  {
    id: "stamp",
    name: "Image",
    labelKey: "annotation.stamp",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.STAMP ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "copy",
      isDraggable: true,
      isResizable: true,
      lockAspectRatio: true,
      lockGroupAspectRatio: true
    },
    defaults: {
      type: PdfAnnotationSubtype.STAMP
      // No imageSrc by default, which tells the UI to open a file picker
    },
    behavior: {
      insertUpright: true,
      useAppearanceStream: false
    },
    transform: patchStamp,
    pointerHandler: stampHandlerFactory
  }
];
const linkTools = [
  {
    id: "link",
    name: "Link",
    labelKey: "annotation.link",
    categories: ["annotation", "markup"],
    matchScore: (a) => a.type === PdfAnnotationSubtype.LINK ? 1 : 0,
    interaction: {
      exclusive: false,
      cursor: "crosshair",
      isDraggable: true,
      isResizable: true,
      isRotatable: false
    },
    defaults: {
      type: PdfAnnotationSubtype.LINK,
      strokeColor: "#0000FF",
      strokeWidth: 2,
      strokeStyle: PdfAnnotationBorderStyle.UNDERLINE
    },
    clickBehavior: {
      enabled: true,
      defaultSize: { width: 100, height: 20 }
    },
    pointerHandler: linkHandlerFactory
  }
];
const defaultTools = [
  ...textMarkupTools,
  ...insertTextTools,
  ...replaceTextTools,
  ...inkTools,
  ...circleTools,
  ...squareTools,
  ...lineTools,
  ...polylineTools,
  ...polygonTools,
  ...textCommentTools,
  ...freeTextTools,
  ...calloutFreeTextTools,
  ...stampTools,
  ...linkTools
];
const DEFAULT_COLORS = [
  "#E44234",
  "#FF8D00",
  "#FFCD45",
  "#5CC96E",
  "#25D2D1",
  "#597CE2",
  "#C544CE",
  "#7D2E25",
  "#000000",
  "#FFFFFF"
];
const computeSelectedUid = (selectedUids) => selectedUids.length === 1 ? selectedUids[0] : null;
const initialDocumentState = (cfg) => ({
  pages: {},
  byUid: {},
  selectedUids: [],
  selectedUid: null,
  activeToolId: null,
  hasPendingChanges: false,
  locked: (cfg == null ? void 0 : cfg.locked) ?? { type: LockModeType.None }
});
const patchAnno = (docState, uid, patch) => {
  const prev = docState.byUid[uid];
  if (!prev) return docState;
  return {
    ...docState,
    byUid: {
      ...docState.byUid,
      [uid]: {
        ...prev,
        commitState: prev.commitState === "synced" || prev.commitState === "moved" ? "dirty" : prev.commitState,
        object: { ...prev.object, ...patch },
        dictMode: true
      }
    },
    hasPendingChanges: true
  };
};
const moveAnno = (docState, uid, patch) => {
  const prev = docState.byUid[uid];
  if (!prev) return docState;
  return {
    ...docState,
    byUid: {
      ...docState.byUid,
      [uid]: {
        ...prev,
        // synced -> moved, moved -> moved, dirty stays dirty, new stays new
        commitState: prev.commitState === "synced" ? "moved" : prev.commitState,
        object: { ...prev.object, ...patch }
      }
    },
    hasPendingChanges: true
  };
};
const initialState = (cfg) => {
  const defaultMap = /* @__PURE__ */ new Map();
  defaultTools.forEach((t) => defaultMap.set(t.id, t));
  const toolMap = new Map(defaultMap);
  (cfg.tools || []).forEach((userTool) => {
    const base = defaultMap.get(userTool.id);
    if (base) {
      toolMap.set(userTool.id, {
        ...base,
        ...userTool,
        defaults: { ...base.defaults, ...userTool.defaults },
        interaction: { ...base.interaction, ...userTool.interaction },
        behavior: { ...base.behavior, ...userTool.behavior },
        ...base.clickBehavior || userTool.clickBehavior ? {
          clickBehavior: {
            ...base.clickBehavior,
            ...userTool.clickBehavior
          }
        } : {}
      });
    } else {
      toolMap.set(userTool.id, userTool);
    }
  });
  const tools = Array.from(toolMap.values()).map((t) => {
    var _a, _b, _c;
    return {
      ...t,
      behavior: {
        ...t.behavior,
        deactivateToolAfterCreate: ((_a = t.behavior) == null ? void 0 : _a.deactivateToolAfterCreate) ?? cfg.deactivateToolAfterCreate ?? false,
        selectAfterCreate: ((_b = t.behavior) == null ? void 0 : _b.selectAfterCreate) ?? cfg.selectAfterCreate ?? true,
        editAfterCreate: ((_c = t.behavior) == null ? void 0 : _c.editAfterCreate) ?? cfg.editAfterCreate ?? false
      }
    };
  });
  return {
    documents: {},
    activeDocumentId: null,
    tools,
    colorPresets: cfg.colorPresets ?? DEFAULT_COLORS
  };
};
const reducer = (state, action) => {
  switch (action.type) {
    case INIT_ANNOTATION_STATE: {
      const { documentId, state: docState } = action.payload;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: docState
        },
        // Set as active if no active document
        activeDocumentId: state.activeDocumentId ?? documentId
      };
    }
    case CLEANUP_ANNOTATION_STATE: {
      const documentId = action.payload;
      const { [documentId]: removed, ...remainingDocs } = state.documents;
      return {
        ...state,
        documents: remainingDocs,
        activeDocumentId: state.activeDocumentId === documentId ? null : state.activeDocumentId
      };
    }
    case SET_ACTIVE_DOCUMENT: {
      return {
        ...state,
        activeDocumentId: action.payload
      };
    }
    case SET_ANNOTATIONS: {
      const { documentId, annotations } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const newPages = {};
      const newByUid = {};
      for (const [pgStr, list] of Object.entries(annotations)) {
        const pageIndex = Number(pgStr);
        const oldUidsOnPage = docState.pages[pageIndex] || [];
        for (const uid of oldUidsOnPage) {
          delete newByUid[uid];
        }
        const newUidsOnPage = list.map((a) => {
          const uid = a.id;
          newByUid[uid] = { commitState: "synced", object: a };
          return uid;
        });
        newPages[pageIndex] = newUidsOnPage;
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pages: newPages,
            byUid: newByUid
          }
        }
      };
    }
    case SELECT_ANNOTATION: {
      const { documentId, id } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...docState, selectedUids: [id], selectedUid: id }
        }
      };
    }
    case DESELECT_ANNOTATION: {
      const { documentId } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...docState, selectedUids: [], selectedUid: null }
        }
      };
    }
    case ADD_TO_SELECTION: {
      const { documentId, id } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      if (docState.selectedUids.includes(id)) return state;
      const newSelectedUids = [...docState.selectedUids, id];
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selectedUids: newSelectedUids,
            selectedUid: computeSelectedUid(newSelectedUids)
          }
        }
      };
    }
    case REMOVE_FROM_SELECTION: {
      const { documentId, id } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const newSelectedUids = docState.selectedUids.filter((uid) => uid !== id);
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selectedUids: newSelectedUids,
            selectedUid: computeSelectedUid(newSelectedUids)
          }
        }
      };
    }
    case SET_SELECTION: {
      const { documentId, ids } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            selectedUids: ids,
            selectedUid: computeSelectedUid(ids)
          }
        }
      };
    }
    case SET_ACTIVE_TOOL_ID: {
      const { documentId, toolId, context } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...docState, activeToolId: toolId, activeToolContext: context }
        }
      };
    }
    case CREATE_ANNOTATION: {
      const { documentId, pageIndex, annotation } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const uid = annotation.id;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pages: {
              ...docState.pages,
              [pageIndex]: [...docState.pages[pageIndex] ?? [], uid]
            },
            byUid: {
              ...docState.byUid,
              [uid]: { commitState: "new", object: annotation, dictMode: true }
            },
            hasPendingChanges: true
          }
        }
      };
    }
    case DELETE_ANNOTATION: {
      const { documentId, pageIndex, id: uid } = action.payload;
      const docState = state.documents[documentId];
      if (!docState || !docState.byUid[uid]) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pages: {
              ...docState.pages,
              [pageIndex]: (docState.pages[pageIndex] ?? []).filter((u) => u !== uid)
            },
            byUid: {
              ...docState.byUid,
              [uid]: { ...docState.byUid[uid], commitState: "deleted" }
            },
            hasPendingChanges: true
          }
        }
      };
    }
    case PATCH_ANNOTATION: {
      const { documentId, id, patch } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: patchAnno(docState, id, patch)
        }
      };
    }
    case MOVE_ANNOTATION: {
      const { documentId, id, patch } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: moveAnno(docState, id, patch)
        }
      };
    }
    case COMMIT_PENDING_CHANGES: {
      const { documentId, committedUids } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const committedSet = new Set(committedUids);
      const cleaned = {};
      let stillHasPending = false;
      for (const [uid, ta] of Object.entries(docState.byUid)) {
        if (committedSet.has(uid)) {
          cleaned[uid] = {
            ...ta,
            commitState: ta.commitState === "dirty" || ta.commitState === "new" || ta.commitState === "moved" ? "synced" : ta.commitState
          };
        } else {
          cleaned[uid] = ta;
          if (ta.commitState === "new" || ta.commitState === "dirty" || ta.commitState === "moved" || ta.commitState === "deleted") {
            stillHasPending = true;
          }
        }
      }
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...docState, byUid: cleaned, hasPendingChanges: stillHasPending }
        }
      };
    }
    case PURGE_ANNOTATION: {
      const { documentId, pageIndex, uid } = action.payload;
      const docState = state.documents[documentId];
      if (!docState || !docState.byUid[uid]) return state;
      const { [uid]: _gone, ...rest } = docState.byUid;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            pages: {
              ...docState.pages,
              [pageIndex]: (docState.pages[pageIndex] ?? []).filter((u) => u !== uid)
            },
            byUid: rest
          }
        }
      };
    }
    case SET_LOCKED: {
      const { documentId, mode } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: { ...docState, locked: mode }
        }
      };
    }
    case SYNC_ANNOTATION_OBJECT: {
      const { documentId, id, patch } = action.payload;
      const docState = state.documents[documentId];
      if (!docState) return state;
      const prev = docState.byUid[id];
      if (!prev) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [documentId]: {
            ...docState,
            byUid: {
              ...docState.byUid,
              [id]: {
                ...prev,
                object: { ...prev.object, ...patch }
              }
            }
          }
        }
      };
    }
    // Global actions
    case ADD_TOOL: {
      const toolMap = new Map(state.tools.map((t) => [t.id, t]));
      toolMap.set(action.payload.id, action.payload);
      return { ...state, tools: Array.from(toolMap.values()) };
    }
    case SET_TOOL_DEFAULTS: {
      const { toolId, patch } = action.payload;
      return {
        ...state,
        tools: state.tools.map((tool) => {
          if (tool.id === toolId) {
            return { ...tool, defaults: { ...tool.defaults, ...patch } };
          }
          return tool;
        })
      };
    }
    case ADD_COLOR_PRESET:
      return state.colorPresets.includes(action.payload) ? state : { ...state, colorPresets: [...state.colorPresets, action.payload] };
    default:
      return state;
  }
};
const _AnnotationPlugin = class _AnnotationPlugin extends BasePlugin {
  constructor(id, registry, config) {
    var _a, _b, _c, _d;
    super(id, registry);
    this.ANNOTATION_HISTORY_TOPIC = "annotations";
    this.state$ = createScopedEmitter((documentId, state) => ({ documentId, state }));
    this.pendingContexts = /* @__PURE__ */ new Map();
    this.isInitialLoadComplete = /* @__PURE__ */ new Map();
    this.importQueue = /* @__PURE__ */ new Map();
    this.commitInProgress = /* @__PURE__ */ new Map();
    this.activeTool$ = createScopedEmitter((documentId, tool) => ({ documentId, tool }));
    this.events$ = createScopedEmitter(
      (_, event) => event,
      { cache: false }
    );
    this.toolsChange$ = createBehaviorEmitter();
    this.appearanceCache = /* @__PURE__ */ new Map();
    this.unifiedDragStates = /* @__PURE__ */ new Map();
    this.unifiedDrag$ = createBehaviorEmitter();
    this.unifiedResizeStates = /* @__PURE__ */ new Map();
    this.unifiedResize$ = createBehaviorEmitter();
    this.unifiedRotateStates = /* @__PURE__ */ new Map();
    this.unifiedRotate$ = createBehaviorEmitter();
    this.navigate$ = createScopedEmitter(
      (_, event) => event,
      { cache: false }
    );
    this.config = config;
    this.selection = ((_a = registry.getPlugin("selection")) == null ? void 0 : _a.provides()) ?? null;
    this.history = ((_b = registry.getPlugin("history")) == null ? void 0 : _b.provides()) ?? null;
    this.scroll = ((_c = registry.getPlugin("scroll")) == null ? void 0 : _c.provides()) ?? null;
    this.interactionManager = ((_d = registry.getPlugin("interaction-manager")) == null ? void 0 : _d.provides()) ?? null;
  }
  // ─────────────────────────────────────────────────────────
  // Document Lifecycle (from BasePlugin)
  // ─────────────────────────────────────────────────────────
  onDocumentLoadingStarted(documentId) {
    this.dispatch(initAnnotationState(documentId, initialDocumentState(this.config)));
    this.pendingContexts.set(documentId, /* @__PURE__ */ new Map());
    this.isInitialLoadComplete.set(documentId, false);
    this.importQueue.set(documentId, []);
    this.logger.debug(
      "AnnotationPlugin",
      "DocumentOpened",
      `Initialized annotation state for document: ${documentId}`
    );
  }
  onDocumentLoaded(documentId) {
    const docState = this.getCoreDocument(documentId);
    if (docState == null ? void 0 : docState.document) {
      this.getAllAnnotations(documentId, docState.document);
    }
    if (this.selection) {
      for (const tool of this.state.tools) {
        if (tool.interaction.textSelection) {
          this.selection.enableForMode(tool.interaction.mode ?? tool.id, {
            showSelectionRects: tool.interaction.showSelectionRects ?? false,
            enableSelection: true,
            enableMarquee: false
          });
        }
      }
    }
  }
  onDocumentClosed(documentId) {
    this.dispatch(cleanupAnnotationState(documentId));
    this.pendingContexts.delete(documentId);
    this.isInitialLoadComplete.delete(documentId);
    this.importQueue.delete(documentId);
    this.appearanceCache.delete(documentId);
    this.state$.clearScope(documentId);
    this.activeTool$.clearScope(documentId);
    this.events$.clearScope(documentId);
    this.navigate$.clearScope(documentId);
    this.logger.debug(
      "AnnotationPlugin",
      "DocumentClosed",
      `Cleaned up annotation state for document: ${documentId}`
    );
  }
  async initialize() {
    var _a, _b, _c;
    this.state.tools.forEach((tool) => this.registerInteractionForTool(tool));
    if (this.history) {
      this.history.onHistoryChange((event) => {
        if (event.topic === this.ANNOTATION_HISTORY_TOPIC && this.config.autoCommit !== false) {
          this.commit(event.documentId);
        }
      });
    }
    (_a = this.interactionManager) == null ? void 0 : _a.onModeChange((s) => {
      var _a2, _b2;
      const newToolId = ((_a2 = this.state.tools.find((t) => (t.interaction.mode ?? t.id) === s.activeMode)) == null ? void 0 : _a2.id) ?? null;
      const currentToolId = ((_b2 = this.state.documents[s.documentId]) == null ? void 0 : _b2.activeToolId) ?? null;
      if (newToolId !== currentToolId && s.documentId) {
        this.dispatch(setActiveToolId(s.documentId, newToolId));
      }
    });
    (_b = this.selection) == null ? void 0 : _b.onMarqueeEnd(({ documentId, pageIndex, rect, modeId }) => {
      if (modeId !== "pointerMode") return;
      const docState = this.state.documents[documentId];
      if (!docState) return;
      const pageAnnotations = (docState.pages[pageIndex] ?? []).map((uid) => docState.byUid[uid]).filter((ta) => ta !== void 0).filter((ta) => isSelectableAnnotation(ta));
      const selectedIds = pageAnnotations.filter((ta) => rectsIntersect(rect, ta.object.rect)).filter((ta) => this.isAnnotationSelectable(ta.object, documentId)).map((ta) => ta.object.id);
      if (selectedIds.length > 0) {
        const expandedIds = /* @__PURE__ */ new Set();
        for (const id of selectedIds) {
          if (this.isInGroupMethod(id, documentId)) {
            const members = this.getGroupMembersMethod(id, documentId);
            for (const member of members) {
              expandedIds.add(member.object.id);
            }
          } else {
            expandedIds.add(id);
          }
        }
        this.setSelectionMethod([...expandedIds], documentId);
      }
    });
    (_c = this.selection) == null ? void 0 : _c.onEndSelection(({ documentId }) => {
      var _a2, _b2, _c2, _d;
      if (!this.checkPermission(documentId, PdfPermissionFlag.ModifyAnnotations)) return;
      const activeTool = this.getActiveTool(documentId);
      if (!activeTool || !activeTool.interaction.textSelection) return;
      const formattedSelection = (_a2 = this.selection) == null ? void 0 : _a2.getFormattedSelection();
      const selectionText = (_b2 = this.selection) == null ? void 0 : _b2.getSelectedText();
      if (!formattedSelection || !selectionText) return;
      const getText = () => new Promise((resolve) => {
        selectionText.wait(
          (text) => resolve(text.join("\n")),
          () => resolve(void 0)
        );
      });
      const context = {
        toolId: activeTool.id,
        documentId,
        getTool: () => this.getActiveTool(documentId) ?? null,
        createAnnotation: (pageIndex, annotation) => this.createAnnotation(pageIndex, annotation, void 0, documentId),
        selectAnnotation: (pageIndex, id) => this.selectAnnotation(pageIndex, id, documentId)
      };
      const handler = activeTool.selectionHandler ?? textMarkupSelectionHandler;
      handler.handle(context, formattedSelection, getText);
      if ((_c2 = activeTool.behavior) == null ? void 0 : _c2.deactivateToolAfterCreate) {
        this.setActiveTool(null, documentId);
      }
      (_d = this.selection) == null ? void 0 : _d.clear();
    });
  }
  registerInteractionForTool(tool) {
    var _a;
    (_a = this.interactionManager) == null ? void 0 : _a.registerMode({
      id: tool.interaction.mode ?? tool.id,
      scope: "page",
      exclusive: tool.interaction.exclusive,
      cursor: tool.interaction.cursor
    });
  }
  buildCapability() {
    return {
      // Active document operations
      getActiveTool: () => this.getActiveTool(),
      setActiveTool: (toolId, context) => this.setActiveTool(toolId, void 0, context),
      getState: () => this.getDocumentState(),
      getPageAnnotations: (options) => this.getPageAnnotations(options),
      getSelectedAnnotation: () => this.getSelectedAnnotation(),
      getSelectedAnnotations: () => this.getSelectedAnnotationsMethod(),
      getSelectedAnnotationIds: () => this.getSelectedAnnotationIdsMethod(),
      getAnnotationById: (id) => this.getAnnotationById(id),
      getAnnotations: (options) => this.getAnnotationsMethod(options),
      selectAnnotation: (pageIndex, id) => this.selectAnnotation(pageIndex, id),
      toggleSelection: (pageIndex, id) => this.toggleSelectionMethod(pageIndex, id),
      addToSelection: (pageIndex, id) => this.addToSelectionMethod(pageIndex, id),
      removeFromSelection: (id) => this.removeFromSelectionMethod(id),
      setSelection: (ids) => this.setSelectionMethod(ids),
      deselectAnnotation: () => this.deselectAnnotation(),
      importAnnotations: (items) => this.importAnnotations(items),
      exportAnnotations: (options, documentId) => this.exportAnnotationsMethod(options, documentId),
      createAnnotation: (pageIndex, anno, ctx) => this.createAnnotation(pageIndex, anno, ctx),
      updateAnnotation: (pageIndex, id, patch) => this.updateAnnotation(pageIndex, id, patch),
      updateAnnotations: (patches) => this.updateAnnotationsMethod(patches),
      moveAnnotation: (pageIndex, id, position, mode, documentId) => this.moveAnnotationMethod(pageIndex, id, position, mode, documentId),
      deleteAnnotation: (pageIndex, id) => this.deleteAnnotation(pageIndex, id),
      deleteAnnotations: (annotations, documentId) => this.deleteAnnotationsMethod(annotations, documentId),
      deleteAllAnnotations: (documentId) => this.deleteAllAnnotationsMethod(documentId),
      purgeAnnotation: (pageIndex, id, documentId) => this.purgeAnnotationMethod(pageIndex, id, documentId),
      renderAnnotation: (options) => this.renderAnnotation(options),
      getPageAppearances: (pageIndex, options, documentId) => this.getPageAppearances(pageIndex, options, documentId),
      invalidatePageAppearances: (pageIndex, documentId) => this.invalidatePageAppearances(pageIndex, documentId),
      commit: () => this.commit(),
      // Attached links (IRT link children)
      getAttachedLinks: (id, documentId) => this.getAttachedLinksMethod(id, documentId),
      hasAttachedLinks: (id, documentId) => this.hasAttachedLinksMethod(id, documentId),
      deleteAttachedLinks: (id, documentId) => this.deleteAttachedLinksMethod(id, documentId),
      // Annotation grouping (RT = Group)
      groupAnnotations: (documentId) => this.groupAnnotationsMethod(documentId),
      ungroupAnnotations: (id, documentId) => this.ungroupAnnotationsMethod(id, documentId),
      getGroupMembers: (id, documentId) => this.getGroupMembersMethod(id, documentId),
      isInGroup: (id, documentId) => this.isInGroupMethod(id, documentId),
      // Locking
      setLocked: (mode, documentId) => this.setLocked(mode, documentId),
      getLocked: (documentId) => this.getLocked(documentId),
      isAnnotationLocked: (annotation, documentId) => this.isAnnotationLocked(annotation, documentId),
      isAnnotationInteractive: (annotation, documentId) => this.isAnnotationInteractive(annotation, documentId),
      isAnnotationStructurallyLocked: (annotation, documentId) => this.isAnnotationStructurallyLocked(annotation, documentId),
      isAnnotationContentLocked: (annotation, documentId) => this.isAnnotationContentLocked(annotation, documentId),
      isCategoryLocked: (category, documentId) => this.isCategoryLockedMethod(category, documentId),
      isToolLocked: (toolId, documentId) => this.isToolLockedMethod(toolId, documentId),
      // Sync (lightweight state update without commit)
      syncAnnotationObject: (id, patch, documentId) => this.syncAnnotationObject(id, patch, documentId),
      // Link navigation
      navigateTarget: (target, documentId) => this.navigateTargetMethod(target, documentId),
      // Document-scoped operations
      forDocument: (documentId) => this.createAnnotationScope(documentId),
      // Global operations
      getTools: () => this.state.tools,
      getTool: (toolId) => this.getTool(toolId),
      addTool: (tool) => {
        this.dispatch(addTool(tool));
        this.registerInteractionForTool(tool);
      },
      findToolForAnnotation: (anno) => this.findToolForAnnotation(anno),
      setToolDefaults: (toolId, patch) => this.dispatch(setToolDefaults(toolId, patch)),
      getColorPresets: () => [...this.state.colorPresets],
      addColorPreset: (color) => this.dispatch(addColorPreset(color)),
      transformAnnotation: (annotation, options) => this.transformAnnotation(annotation, options),
      // Events
      onStateChange: this.state$.onGlobal,
      onActiveToolChange: this.activeTool$.onGlobal,
      onAnnotationEvent: this.events$.onGlobal,
      onToolsChange: this.toolsChange$.on,
      onNavigate: this.navigate$.onGlobal
    };
  }
  // ─────────────────────────────────────────────────────────
  // Document Scoping
  // ─────────────────────────────────────────────────────────
  createAnnotationScope(documentId) {
    return {
      getState: () => this.getDocumentState(documentId),
      getPageAnnotations: (options) => this.getPageAnnotations(options, documentId),
      getSelectedAnnotation: () => this.getSelectedAnnotation(documentId),
      getSelectedAnnotations: () => this.getSelectedAnnotationsMethod(documentId),
      getSelectedAnnotationIds: () => this.getSelectedAnnotationIdsMethod(documentId),
      getAnnotationById: (id) => this.getAnnotationById(id, documentId),
      getAnnotations: (options) => this.getAnnotationsMethod(options, documentId),
      selectAnnotation: (pageIndex, id) => this.selectAnnotation(pageIndex, id, documentId),
      toggleSelection: (pageIndex, id) => this.toggleSelectionMethod(pageIndex, id, documentId),
      addToSelection: (pageIndex, id) => this.addToSelectionMethod(pageIndex, id, documentId),
      removeFromSelection: (id) => this.removeFromSelectionMethod(id, documentId),
      setSelection: (ids) => this.setSelectionMethod(ids, documentId),
      deselectAnnotation: () => this.deselectAnnotation(documentId),
      getActiveTool: () => this.getActiveTool(documentId),
      setActiveTool: (toolId, context) => this.setActiveTool(toolId, documentId, context),
      findToolForAnnotation: (anno) => this.findToolForAnnotation(anno),
      importAnnotations: (items) => this.importAnnotations(items, documentId),
      exportAnnotations: (options) => this.exportAnnotationsMethod(options, documentId),
      createAnnotation: (pageIndex, anno, ctx) => this.createAnnotation(pageIndex, anno, ctx, documentId),
      updateAnnotation: (pageIndex, id, patch) => this.updateAnnotation(pageIndex, id, patch, documentId),
      updateAnnotations: (patches) => this.updateAnnotationsMethod(patches, documentId),
      moveAnnotation: (pageIndex, id, position, mode) => this.moveAnnotationMethod(pageIndex, id, position, mode, documentId),
      deleteAnnotation: (pageIndex, id) => this.deleteAnnotation(pageIndex, id, documentId),
      deleteAnnotations: (annotations) => this.deleteAnnotationsMethod(annotations, documentId),
      deleteAllAnnotations: () => this.deleteAllAnnotationsMethod(documentId),
      purgeAnnotation: (pageIndex, id) => this.purgeAnnotationMethod(pageIndex, id, documentId),
      renderAnnotation: (options) => this.renderAnnotation(options, documentId),
      getPageAppearances: (pageIndex, options) => this.getPageAppearances(pageIndex, options, documentId),
      invalidatePageAppearances: (pageIndex) => this.invalidatePageAppearances(pageIndex, documentId),
      commit: () => this.commit(documentId),
      getAttachedLinks: (id) => this.getAttachedLinksMethod(id, documentId),
      hasAttachedLinks: (id) => this.hasAttachedLinksMethod(id, documentId),
      deleteAttachedLinks: (id) => this.deleteAttachedLinksMethod(id, documentId),
      groupAnnotations: () => this.groupAnnotationsMethod(documentId),
      ungroupAnnotations: (id) => this.ungroupAnnotationsMethod(id, documentId),
      getGroupMembers: (id) => this.getGroupMembersMethod(id, documentId),
      isInGroup: (id) => this.isInGroupMethod(id, documentId),
      getGroupingAction: () => this.getGroupingActionMethod(documentId),
      setLocked: (mode) => this.setLocked(mode, documentId),
      getLocked: () => this.getLocked(documentId),
      isAnnotationLocked: (annotation) => this.isAnnotationLocked(annotation, documentId),
      isAnnotationInteractive: (annotation) => this.isAnnotationInteractive(annotation, documentId),
      isAnnotationStructurallyLocked: (annotation) => this.isAnnotationStructurallyLocked(annotation, documentId),
      isAnnotationContentLocked: (annotation) => this.isAnnotationContentLocked(annotation, documentId),
      isCategoryLocked: (category) => this.isCategoryLockedMethod(category, documentId),
      isToolLocked: (toolId) => this.isToolLockedMethod(toolId, documentId),
      syncAnnotationObject: (id, patch) => this.syncAnnotationObject(id, patch, documentId),
      navigateTarget: (target) => this.navigateTargetMethod(target, documentId),
      onStateChange: this.state$.forScope(documentId),
      onAnnotationEvent: this.events$.forScope(documentId),
      onActiveToolChange: this.activeTool$.forScope(documentId),
      onNavigate: this.navigate$.forScope(documentId)
    };
  }
  onStoreUpdated(prev, next) {
    for (const documentId in next.documents) {
      const prevDoc = prev.documents[documentId];
      const nextDoc = next.documents[documentId];
      if (prevDoc !== nextDoc) {
        this.state$.emit(documentId, nextDoc);
        if (prevDoc && prevDoc.activeToolId !== nextDoc.activeToolId) {
          this.activeTool$.emit(documentId, this.getActiveTool(documentId));
        }
        if ((prevDoc == null ? void 0 : prevDoc.selectedUids) !== nextDoc.selectedUids) {
          this.updateAnnotationSelectionActivity(documentId, nextDoc);
        }
      }
    }
    if (prev.tools !== next.tools) {
      for (const documentId in next.documents) {
        this.activeTool$.emit(documentId, this.getActiveTool(documentId));
      }
      this.toolsChange$.emit({
        tools: next.tools
      });
    }
  }
  transformAnnotation(annotation, options) {
    const context = {
      type: options.type,
      changes: options.changes,
      metadata: options.metadata
    };
    const tool = this.findToolForAnnotation(annotation);
    if (tool == null ? void 0 : tool.transform) {
      return tool.transform(annotation, context);
    }
    return context.changes;
  }
  registerPageHandlers(documentId, pageIndex, scale, callbacks) {
    var _a, _b;
    const docState = this.getCoreDocument(documentId);
    const page = (_a = docState == null ? void 0 : docState.document) == null ? void 0 : _a.pages[pageIndex];
    if (!page) return () => {
    };
    if (!this.interactionManager) return () => {
    };
    const unregisterFns = [];
    const effectivePageRotation = ((page.rotation ?? 0) + ((docState == null ? void 0 : docState.rotation) ?? 0)) % 4;
    for (const tool of this.state.tools) {
      const factory = tool.pointerHandler ?? (((_b = tool.defaults) == null ? void 0 : _b.type) ? _AnnotationPlugin.defaultHandlerFactories.get(tool.defaults.type) : void 0);
      if (!factory) continue;
      const context = {
        pageIndex,
        pageSize: page.size,
        pageRotation: effectivePageRotation,
        scale,
        services: callbacks.services,
        onPreview: (state) => callbacks.onPreview(tool.id, state),
        onCommit: (annotation, ctx) => {
          var _a2, _b2, _c;
          const editAfterCreate = ((_a2 = tool.behavior) == null ? void 0 : _a2.editAfterCreate) ?? false;
          this.createAnnotation(pageIndex, annotation, ctx, documentId, { editAfterCreate });
          if ((_b2 = tool.behavior) == null ? void 0 : _b2.deactivateToolAfterCreate) {
            this.setActiveTool(null, documentId);
          }
          if (((_c = tool.behavior) == null ? void 0 : _c.selectAfterCreate) || editAfterCreate) {
            this.selectAnnotation(pageIndex, annotation.id, documentId);
          }
        },
        getTool: () => this.state.tools.find((t) => t.id === tool.id),
        getToolContext: () => {
          var _a2;
          return (_a2 = this.state.documents[documentId]) == null ? void 0 : _a2.activeToolContext;
        }
      };
      const unregister = this.interactionManager.registerHandlers({
        documentId,
        modeId: tool.interaction.mode ?? tool.id,
        handlers: factory.create(context),
        pageIndex
      });
      unregisterFns.push(unregister);
    }
    return () => unregisterFns.forEach((fn) => fn());
  }
  // ─────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────
  getDocumentState(documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.state.documents[id];
    if (!docState) {
      throw new Error(`Annotation state not found for document: ${id}`);
    }
    return docState;
  }
  getAllAnnotations(documentId, doc) {
    const task = this.engine.getAllAnnotations(doc);
    task.wait((annotations) => {
      this.dispatch(setAnnotations(documentId, annotations));
      this.isInitialLoadComplete.set(documentId, true);
      const queue = this.importQueue.get(documentId);
      if (queue && queue.length > 0) {
        this.processImportQueue(documentId);
      }
      this.events$.emit(documentId, {
        type: "loaded",
        documentId,
        total: Object.values(annotations).reduce(
          (sum, pageAnnotations) => sum + pageAnnotations.length,
          0
        )
      });
    }, ignore);
  }
  getPageAnnotations(options, documentId) {
    const { pageIndex } = options;
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getCoreDocument(id);
    const doc = docState == null ? void 0 : docState.document;
    if (!doc) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const page = doc.pages.find((p) => p.index === pageIndex);
    if (!page) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Page not found" });
    }
    return this.engine.getPageAnnotations(doc, page);
  }
  getSelectedAnnotation(documentId) {
    return getSelectedAnnotation(this.getDocumentState(documentId));
  }
  getAnnotationById(id, documentId) {
    const docState = this.getDocumentState(documentId);
    return getAnnotationByUid(docState, id);
  }
  getAnnotationsMethod(options, documentId) {
    const docState = this.getDocumentState(documentId);
    if ((options == null ? void 0 : options.pageIndex) !== void 0) {
      return getAnnotationsByPageIndex(docState, options.pageIndex).filter(
        (ta) => ta !== void 0
      );
    }
    return Object.values(docState.byUid);
  }
  renderAnnotation({ pageIndex, annotation, options }, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getCoreDocument(id);
    const doc = docState == null ? void 0 : docState.document;
    if (!doc) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const page = doc.pages.find((page2) => page2.index === pageIndex);
    if (!page) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Page not found" });
    }
    return this.engine.renderPageAnnotation(doc, page, annotation, options);
  }
  /**
   * Batch-fetch rendered appearance stream images for all annotations on a page.
   * Results are cached per document + page. Call invalidatePageAppearances to clear.
   */
  getPageAppearances(pageIndex, options, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getCoreDocument(id);
    const doc = docState == null ? void 0 : docState.document;
    if (!doc) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const page = doc.pages.find((p) => p.index === pageIndex);
    if (!page) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Page not found" });
    }
    let docCache = this.appearanceCache.get(id);
    if (!docCache) {
      docCache = /* @__PURE__ */ new Map();
      this.appearanceCache.set(id, docCache);
    }
    const cached = docCache.get(pageIndex);
    if (cached && !options) {
      const task = new Task();
      task.resolve(cached);
      return task;
    }
    const engineTask = this.engine.renderPageAnnotations(doc, page, options);
    const resultTask = new Task();
    engineTask.wait(
      (result) => {
        docCache.set(pageIndex, result);
        resultTask.resolve(result);
      },
      (error) => {
        resultTask.fail(error);
      }
    );
    return resultTask;
  }
  /**
   * Clear cached appearances for a specific page (e.g. on zoom change).
   */
  invalidatePageAppearances(pageIndex, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docCache = this.appearanceCache.get(id);
    if (docCache) {
      docCache.delete(pageIndex);
    }
  }
  /**
   * Remove a single annotation's entry from the page appearance cache.
   * Used after committing changes that regenerate the annotation's appearance.
   */
  invalidateAnnotationAppearance(annotId, pageIndex, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docCache = this.appearanceCache.get(id);
    if (!docCache) return;
    const pageMap = docCache.get(pageIndex);
    if (!pageMap) return;
    delete pageMap[annotId];
  }
  exportAnnotationsMethod(options, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(id);
    const coreDoc = this.getCoreDocument(id);
    const doc = coreDoc == null ? void 0 : coreDoc.document;
    if (!doc) {
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const pageIndices = (options == null ? void 0 : options.pageIndex) !== void 0 ? [options.pageIndex] : Object.keys(docState.pages).map(Number);
    const entries = [];
    for (const pi of pageIndices) {
      const uids = docState.pages[pi] ?? [];
      for (const uid of uids) {
        const ta = docState.byUid[uid];
        if (!ta || ta.commitState === "deleted") continue;
        entries.push({
          annotation: ta.object,
          pageIndex: pi,
          isStamp: ta.object.type === PdfAnnotationSubtype.STAMP
        });
      }
    }
    const stampEntries = entries.filter((e) => e.isStamp);
    if (stampEntries.length === 0) {
      return PdfTaskHelper.resolve(entries.map((e) => ({ annotation: e.annotation })));
    }
    const resultTask = PdfTaskHelper.create();
    const appearances = /* @__PURE__ */ new Map();
    let pending = stampEntries.length;
    let failed = false;
    for (const entry of stampEntries) {
      const page = doc.pages.find((p) => p.index === entry.pageIndex);
      if (!page) {
        pending--;
        continue;
      }
      const exportTask = this.engine.exportAnnotationAppearanceAsPdf(doc, page, entry.annotation);
      exportTask.wait(
        (buffer) => {
          if (failed) return;
          appearances.set(entry.annotation.id, buffer);
          pending--;
          if (pending === 0) {
            resultTask.resolve(
              entries.map((e) => ({
                annotation: e.annotation,
                ...appearances.has(e.annotation.id) ? {
                  ctx: {
                    data: appearances.get(e.annotation.id),
                    mimeType: "application/pdf"
                  }
                } : {}
              }))
            );
          }
        },
        (error) => {
          if (failed) return;
          failed = true;
          resultTask.reject(error.reason);
        }
      );
    }
    if (pending === 0) {
      resultTask.resolve(entries.map((e) => ({ annotation: e.annotation })));
    }
    return resultTask;
  }
  importAnnotations(items, documentId) {
    const id = documentId ?? this.getActiveDocumentId();
    if (!this.isInitialLoadComplete.get(id)) {
      const queue = this.importQueue.get(id) || [];
      queue.push(...items);
      this.importQueue.set(id, queue);
      return;
    }
    this.processImportItems(id, items);
  }
  processImportQueue(documentId) {
    const queue = this.importQueue.get(documentId);
    if (!queue || queue.length === 0) return;
    const items = [...queue];
    this.importQueue.set(documentId, []);
    this.processImportItems(documentId, items);
  }
  processImportItems(documentId, items) {
    const contexts = this.pendingContexts.get(documentId);
    if (!contexts) return;
    for (const item of items) {
      const { annotation, ctx } = item;
      const pageIndex = annotation.pageIndex;
      const id = annotation.id;
      this.dispatch(createAnnotation(documentId, pageIndex, annotation));
      if (ctx) contexts.set(id, ctx);
    }
    if (this.config.autoCommit !== false) this.commit(documentId);
  }
  createAnnotation(pageIndex, annotation, ctx, documentId, options) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "CreateAnnotation",
        `Cannot create annotation: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const id = annotation.id;
    const contexts = this.pendingContexts.get(docId);
    if (!contexts) return;
    const newAnnotation = {
      ...annotation,
      author: annotation.author ?? this.config.annotationAuthor
    };
    const editAfterCreate = options == null ? void 0 : options.editAfterCreate;
    const execute = () => {
      this.dispatch(createAnnotation(docId, pageIndex, newAnnotation));
      if (ctx) contexts.set(id, ctx);
      this.events$.emit(docId, {
        type: "create",
        documentId: docId,
        annotation: newAnnotation,
        pageIndex,
        ctx,
        committed: false,
        editAfterCreate
      });
    };
    if (!this.history) {
      execute();
      if (this.config.autoCommit) this.commit(docId);
      return;
    }
    const command = {
      execute,
      undo: () => {
        contexts.delete(id);
        this.dispatch(deselectAnnotation(docId));
        this.dispatch(deleteAnnotation(docId, pageIndex, id));
        this.events$.emit(docId, {
          type: "delete",
          documentId: docId,
          annotation: newAnnotation,
          pageIndex,
          committed: false
        });
      },
      metadata: { annotationIds: [id] }
    };
    const historyScope = this.history.forDocument(docId);
    historyScope.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }
  buildPatch(original, patch) {
    if ("rect" in patch) return patch;
    return this.transformAnnotation(original, {
      type: "property-update",
      changes: patch
    });
  }
  updateAnnotation(pageIndex, id, patch, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "UpdateAnnotation",
        `Cannot update annotation: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const docState = this.getDocumentState(docId);
    const originalObject = docState.byUid[id].object;
    const finalPatch = this.buildPatch(originalObject, {
      ...patch,
      author: patch.author ?? this.config.annotationAuthor
    });
    const execute = () => {
      this.dispatch(patchAnnotation(docId, pageIndex, id, finalPatch));
      this.events$.emit(docId, {
        type: "update",
        documentId: docId,
        annotation: originalObject,
        pageIndex,
        patch: finalPatch,
        committed: false
      });
    };
    if (!this.history) {
      execute();
      if (this.config.autoCommit !== false) {
        this.commit(docId);
      }
      return;
    }
    const originalPatch = Object.fromEntries(
      Object.keys(patch).map((key) => [key, originalObject[key]])
    );
    const command = {
      execute,
      undo: () => {
        this.dispatch(patchAnnotation(docId, pageIndex, id, originalPatch));
        this.events$.emit(docId, {
          type: "update",
          documentId: docId,
          annotation: originalObject,
          pageIndex,
          patch: originalPatch,
          committed: false
        });
      },
      metadata: { annotationIds: [id] }
    };
    const historyScope = this.history.forDocument(docId);
    historyScope.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }
  deleteAnnotation(pageIndex, id, documentId) {
    var _a;
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "DeleteAnnotation",
        `Cannot delete annotation: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const docState = this.getDocumentState(docId);
    const originalAnnotation = (_a = docState.byUid[id]) == null ? void 0 : _a.object;
    if (!originalAnnotation) return;
    const irtChildren = getIRTChildIds(docState, id);
    const childAnnotations = irtChildren.map((child) => {
      var _a2;
      return (_a2 = docState.byUid[child.id]) == null ? void 0 : _a2.object;
    }).filter((obj) => obj !== void 0);
    const execute = () => {
      var _a2;
      for (const child of irtChildren) {
        const childObj = (_a2 = docState.byUid[child.id]) == null ? void 0 : _a2.object;
        if (childObj) {
          this.dispatch(deleteAnnotation(docId, child.pageIndex, child.id));
          this.events$.emit(docId, {
            type: "delete",
            documentId: docId,
            annotation: childObj,
            pageIndex: child.pageIndex,
            committed: false
          });
        }
      }
      this.dispatch(deselectAnnotation(docId));
      this.dispatch(deleteAnnotation(docId, pageIndex, id));
      this.events$.emit(docId, {
        type: "delete",
        documentId: docId,
        annotation: originalAnnotation,
        pageIndex,
        committed: false
      });
    };
    if (!this.history) {
      execute();
      if (this.config.autoCommit !== false) this.commit(docId);
      return;
    }
    const command = {
      execute,
      undo: () => {
        this.dispatch(createAnnotation(docId, pageIndex, originalAnnotation));
        this.events$.emit(docId, {
          type: "create",
          documentId: docId,
          annotation: originalAnnotation,
          pageIndex,
          committed: false
        });
        for (const childObj of childAnnotations) {
          this.dispatch(createAnnotation(docId, childObj.pageIndex, childObj));
          this.events$.emit(docId, {
            type: "create",
            documentId: docId,
            annotation: childObj,
            pageIndex: childObj.pageIndex,
            committed: false
          });
        }
      },
      metadata: { annotationIds: [id, ...irtChildren.map((c) => c.id)] }
    };
    const historyScope = this.history.forDocument(docId);
    historyScope.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }
  deleteAnnotationsMethod(annotations, documentId) {
    for (const { pageIndex, id } of annotations) {
      this.deleteAnnotation(pageIndex, id, documentId);
    }
  }
  deleteAllAnnotationsMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(docId);
    const toDelete = [];
    for (const [pageIdx, uids] of Object.entries(docState.pages)) {
      for (const uid of uids) {
        const ta = docState.byUid[uid];
        if (ta) toDelete.push({ pageIndex: Number(pageIdx), id: ta.object.id });
      }
    }
    if (toDelete.length > 0) {
      this.deleteAnnotationsMethod(toDelete, docId);
    }
  }
  purgeAnnotationMethod(pageIndex, id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(purgeAnnotation(docId, pageIndex, id));
  }
  selectAnnotation(pageIndex, id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ta = this.getAnnotationById(id, docId);
    if (ta && !this.isAnnotationSelectable(ta.object, docId)) return;
    if (this.isInGroupMethod(id, docId)) {
      const members = this.getGroupMembersMethod(id, docId);
      const memberIds = members.map((m) => m.object.id);
      this.dispatch(setSelection(docId, memberIds));
    } else {
      this.dispatch(selectAnnotation(docId, pageIndex, id));
    }
  }
  deselectAnnotation(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(deselectAnnotation(docId));
  }
  /**
   * Derive page activity from the current annotation selection.
   * Called from onStoreUpdated whenever selectedUids changes,
   * so ALL selection code paths are covered automatically.
   */
  updateAnnotationSelectionActivity(docId, docState) {
    var _a, _b;
    if (docState.selectedUids.length === 0) {
      (_a = this.interactionManager) == null ? void 0 : _a.releasePageActivity(docId, "annotation-selection");
      return;
    }
    const firstUid = docState.selectedUids[0];
    const ta = docState.byUid[firstUid];
    if (ta) {
      (_b = this.interactionManager) == null ? void 0 : _b.claimPageActivity(
        docId,
        "annotation-selection",
        ta.object.pageIndex
      );
    }
  }
  // ─────────────────────────────────────────────────────────
  // Multi-Select Methods
  // ─────────────────────────────────────────────────────────
  getSelectedAnnotationsMethod(documentId) {
    return getSelectedAnnotations(this.getDocumentState(documentId));
  }
  getSelectedAnnotationIdsMethod(documentId) {
    return getSelectedAnnotationIds(this.getDocumentState(documentId));
  }
  toggleSelectionMethod(pageIndex, id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ta = this.getAnnotationById(id, docId);
    if (ta && !this.isAnnotationSelectable(ta.object, docId)) return;
    const docState = this.getDocumentState(docId);
    if (docState.selectedUids.includes(id)) {
      this.dispatch(removeFromSelection(docId, id));
    } else {
      if (this.isInGroupMethod(id, docId)) {
        const members = this.getGroupMembersMethod(id, docId);
        for (const member of members) {
          if (!docState.selectedUids.includes(member.object.id)) {
            this.dispatch(addToSelection(docId, member.object.pageIndex, member.object.id));
          }
        }
      } else {
        this.dispatch(addToSelection(docId, pageIndex, id));
      }
    }
  }
  addToSelectionMethod(pageIndex, id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ta = this.getAnnotationById(id, docId);
    if (ta && !this.isAnnotationInteractive(ta.object, docId)) return;
    this.dispatch(addToSelection(docId, pageIndex, id));
  }
  removeFromSelectionMethod(id, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(removeFromSelection(docId, id));
  }
  setSelectionMethod(ids, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(docId);
    const filtered = ids.filter((id) => {
      const ta = docState.byUid[id];
      return !ta || this.isAnnotationInteractive(ta.object, docId);
    });
    this.dispatch(setSelection(docId, filtered));
  }
  // ─────────────────────────────────────────────────────────
  // Attached Links Methods
  // ─────────────────────────────────────────────────────────
  getAttachedLinksMethod(annotationId, documentId) {
    return getAttachedLinks(this.getDocumentState(documentId), annotationId);
  }
  hasAttachedLinksMethod(annotationId, documentId) {
    return this.getAttachedLinksMethod(annotationId, documentId).length > 0;
  }
  deleteAttachedLinksMethod(annotationId, documentId) {
    const links = this.getAttachedLinksMethod(annotationId, documentId);
    for (const link of links) {
      this.deleteAnnotation(link.object.pageIndex, link.object.id, documentId);
    }
  }
  // ─────────────────────────────────────────────────────────
  // Annotation Grouping Methods
  // ─────────────────────────────────────────────────────────
  /**
   * Group the currently selected annotations.
   * The first selected annotation becomes the group leader.
   * All other selected annotations get their IRT set to the leader's ID with RT = Group.
   */
  groupAnnotationsMethod(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "GroupAnnotations",
        `Cannot group annotations: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const selected = this.getSelectedAnnotationsMethod(docId);
    if (selected.length < 2) {
      this.logger.debug(
        "AnnotationPlugin",
        "GroupAnnotations",
        "Need at least 2 annotations to group"
      );
      return;
    }
    const leader = selected[0];
    const members = selected.slice(1);
    const patches = members.map((ta) => ({
      pageIndex: ta.object.pageIndex,
      id: ta.object.id,
      patch: {
        inReplyToId: leader.object.id,
        replyType: PdfAnnotationReplyType.Group
      }
    }));
    this.updateAnnotationsMethod(patches, docId);
  }
  /**
   * Ungroup all annotations in the group containing the specified annotation.
   * Clears IRT and RT from all group members (the leader doesn't have them).
   */
  ungroupAnnotationsMethod(annotationId, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "UngroupAnnotations",
        `Cannot ungroup annotations: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const members = this.getGroupMembersMethod(annotationId, docId);
    const patches = members.filter((ta) => ta.object.inReplyToId && ta.object.replyType === PdfAnnotationReplyType.Group).map((ta) => ({
      pageIndex: ta.object.pageIndex,
      id: ta.object.id,
      patch: {
        inReplyToId: void 0,
        replyType: void 0
      }
    }));
    if (patches.length > 0) {
      this.updateAnnotationsMethod(patches, docId);
    }
  }
  /**
   * Get all annotations in the same group as the specified annotation.
   */
  getGroupMembersMethod(annotationId, documentId) {
    return getGroupMembers(this.getDocumentState(documentId), annotationId);
  }
  /**
   * Check if an annotation is part of a group.
   */
  isInGroupMethod(annotationId, documentId) {
    return isInGroup(this.getDocumentState(documentId), annotationId);
  }
  /**
   * Get the available grouping action for the current selection.
   */
  getGroupingActionMethod(documentId) {
    return getSelectionGroupingAction(this.getDocumentState(documentId));
  }
  // ─────────────────────────────────────────────────────────
  // Multi-Drag Coordination (Internal API for framework components)
  // ─────────────────────────────────────────────────────────
  /**
   * Compute combined constraints from all selected annotations.
   * This finds the "weakest link" in each direction - the annotation with the least
   * room to move determines the group's limit.
   */
  computeCombinedConstraints(annotations) {
    let maxUp = Infinity;
    let maxDown = Infinity;
    let maxLeft = Infinity;
    let maxRight = Infinity;
    for (const anno of annotations) {
      const upLimit = anno.rect.origin.y;
      const downLimit = anno.pageSize.height - (anno.rect.origin.y + anno.rect.size.height);
      const leftLimit = anno.rect.origin.x;
      const rightLimit = anno.pageSize.width - (anno.rect.origin.x + anno.rect.size.width);
      maxUp = Math.min(maxUp, upLimit);
      maxDown = Math.min(maxDown, downLimit);
      maxLeft = Math.min(maxLeft, leftLimit);
      maxRight = Math.min(maxRight, rightLimit);
    }
    if (!isFinite(maxUp)) maxUp = 0;
    if (!isFinite(maxDown)) maxDown = 0;
    if (!isFinite(maxLeft)) maxLeft = 0;
    if (!isFinite(maxRight)) maxRight = 0;
    return { maxUp, maxDown, maxLeft, maxRight };
  }
  /**
   * Clamp a delta to the combined constraints.
   * Negative y = moving up, positive y = moving down
   * Negative x = moving left, positive x = moving right
   */
  clampDelta(rawDelta, constraints) {
    return {
      x: Math.max(-constraints.maxLeft, Math.min(constraints.maxRight, rawDelta.x)),
      y: Math.max(-constraints.maxUp, Math.min(constraints.maxDown, rawDelta.y))
    };
  }
  // ─────────────────────────────────────────────────────────
  // Unified Drag API (Plugin owns all logic - framework just calls these)
  // ─────────────────────────────────────────────────────────
  /**
   * Start a unified drag operation.
   * The plugin automatically expands the selection to include attached links.
   * Framework components should call this instead of building their own logic.
   *
   * @param documentId - The document ID
   * @param options - Drag options (annotationIds and pageSize)
   */
  startDrag(documentId, options) {
    const { annotationIds, pageSize } = options;
    const attachedLinkIds = [];
    for (const id of annotationIds) {
      const links = this.getAttachedLinksMethod(id, documentId);
      for (const link of links) {
        if (!attachedLinkIds.includes(link.object.id)) {
          attachedLinkIds.push(link.object.id);
        }
      }
    }
    const allParticipantIds = [...annotationIds, ...attachedLinkIds];
    const originalRects = /* @__PURE__ */ new Map();
    const constraints = [];
    for (const id of allParticipantIds) {
      const ta = this.getAnnotationById(id, documentId);
      if (ta) {
        originalRects.set(id, { ...ta.object.rect });
        constraints.push({
          id,
          rect: ta.object.rect,
          pageIndex: ta.object.pageIndex,
          pageSize
        });
      }
    }
    const combinedConstraints = this.computeCombinedConstraints(constraints);
    const state = {
      documentId,
      isDragging: true,
      primaryIds: annotationIds,
      attachedLinkIds,
      allParticipantIds,
      originalRects,
      delta: { x: 0, y: 0 },
      combinedConstraints
    };
    this.unifiedDragStates.set(documentId, state);
    this.unifiedDrag$.emit({ documentId, type: "start", state, previewPatches: {} });
  }
  /**
   * Compute preview patches for all drag participants.
   * Uses transformAnnotation to properly handle vertices, inkList, etc.
   */
  computeDragPreviewPatches(state, documentId) {
    const previewPatches = {};
    for (const id of state.allParticipantIds) {
      const ta = this.getAnnotationById(id, documentId);
      if (!ta) continue;
      const originalRect = state.originalRects.get(id);
      if (!originalRect) continue;
      const newRect = {
        ...originalRect,
        origin: {
          x: originalRect.origin.x + state.delta.x,
          y: originalRect.origin.y + state.delta.y
        }
      };
      previewPatches[id] = this.transformAnnotation(ta.object, {
        type: "move",
        changes: { rect: newRect }
      });
    }
    return previewPatches;
  }
  /**
   * Update the drag delta during a unified drag operation.
   * Returns the clamped delta synchronously for the caller's preview.
   *
   * @param documentId - The document ID
   * @param rawDelta - The unconstrained delta from the drag gesture
   * @returns The clamped delta
   */
  updateDrag(documentId, rawDelta) {
    const state = this.unifiedDragStates.get(documentId);
    if (!(state == null ? void 0 : state.isDragging)) {
      return { x: 0, y: 0 };
    }
    const clampedDelta = this.clampDelta(rawDelta, state.combinedConstraints);
    const newState = {
      ...state,
      delta: clampedDelta
    };
    this.unifiedDragStates.set(documentId, newState);
    const previewPatches = this.computeDragPreviewPatches(newState, documentId);
    this.unifiedDrag$.emit({ documentId, type: "update", state: newState, previewPatches });
    return clampedDelta;
  }
  /**
   * Commit the drag - plugin builds and applies ALL patches.
   * This is the key method that centralizes patch building in the plugin.
   *
   * @param documentId - The document ID
   */
  commitDrag(documentId) {
    const state = this.unifiedDragStates.get(documentId);
    if (!state) return;
    const finalDelta = state.delta;
    if (finalDelta.x !== 0 || finalDelta.y !== 0) {
      const patches = [];
      for (const id of state.allParticipantIds) {
        const ta = this.getAnnotationById(id, documentId);
        if (!ta) continue;
        const originalRect = state.originalRects.get(id) ?? ta.object.rect;
        const newRect = {
          ...originalRect,
          origin: {
            x: originalRect.origin.x + finalDelta.x,
            y: originalRect.origin.y + finalDelta.y
          }
        };
        const patch = this.transformAnnotation(ta.object, {
          type: "move",
          changes: { rect: newRect }
        });
        patches.push({ pageIndex: ta.object.pageIndex, id, patch });
      }
      if (patches.length > 0) {
        this.moveAnnotationsMethod(patches, documentId);
      }
    }
    const endPatches = this.computeDragPreviewPatches(state, documentId);
    this.unifiedDrag$.emit({
      documentId,
      type: "end",
      state: { ...state, isDragging: false },
      previewPatches: endPatches
    });
    this.unifiedDragStates.delete(documentId);
  }
  /**
   * Cancel the drag without committing.
   *
   * @param documentId - The document ID
   */
  cancelDrag(documentId) {
    const state = this.unifiedDragStates.get(documentId);
    if (!state) return;
    this.unifiedDrag$.emit({
      documentId,
      type: "cancel",
      state: { ...state, isDragging: false, delta: { x: 0, y: 0 } },
      previewPatches: {}
    });
    this.unifiedDragStates.delete(documentId);
  }
  /**
   * Get the current unified drag state for a document.
   */
  getDragState(documentId) {
    return this.unifiedDragStates.get(documentId) ?? null;
  }
  /**
   * Subscribe to unified drag state changes.
   * Framework components use this for preview updates.
   */
  get onDragChange() {
    return this.unifiedDrag$.on;
  }
  // ─────────────────────────────────────────────────────────
  // Unified Resize API (Plugin owns all logic - framework just calls these)
  // ─────────────────────────────────────────────────────────
  /**
   * Compute the union bounding box of multiple rects.
   */
  computeUnifiedGroupBoundingBox(rects) {
    if (rects.length === 0) {
      return { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const rect of rects) {
      minX = Math.min(minX, rect.origin.x);
      minY = Math.min(minY, rect.origin.y);
      maxX = Math.max(maxX, rect.origin.x + rect.size.width);
      maxY = Math.max(maxY, rect.origin.y + rect.size.height);
    }
    return {
      origin: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY }
    };
  }
  /**
   * Compute relative positions for annotations within a group bounding box.
   */
  computeUnifiedRelativePositions(annotations, groupBox) {
    return annotations.map((anno) => ({
      id: anno.id,
      originalRect: anno.rect,
      originalUnrotatedRect: anno.unrotatedRect,
      pageIndex: anno.pageIndex,
      isAttachedLink: anno.isAttachedLink,
      parentId: anno.parentId,
      relativeX: groupBox.size.width > 0 ? (anno.rect.origin.x - groupBox.origin.x) / groupBox.size.width : 0,
      relativeY: groupBox.size.height > 0 ? (anno.rect.origin.y - groupBox.origin.y) / groupBox.size.height : 0,
      relativeWidth: groupBox.size.width > 0 ? anno.rect.size.width / groupBox.size.width : 1,
      relativeHeight: groupBox.size.height > 0 ? anno.rect.size.height / groupBox.size.height : 1
    }));
  }
  /**
   * Compute new rects for all annotations based on the new group bounding box.
   */
  computeUnifiedResizedRects(participatingAnnotations, newGroupBox, minSize = 10) {
    const result = /* @__PURE__ */ new Map();
    for (const anno of participatingAnnotations) {
      const newWidth = Math.max(minSize, anno.relativeWidth * newGroupBox.size.width);
      const newHeight = Math.max(minSize, anno.relativeHeight * newGroupBox.size.height);
      result.set(anno.id, {
        origin: {
          x: newGroupBox.origin.x + anno.relativeX * newGroupBox.size.width,
          y: newGroupBox.origin.y + anno.relativeY * newGroupBox.size.height
        },
        size: {
          width: newWidth,
          height: newHeight
        }
      });
    }
    return result;
  }
  /**
   * Compute preview patches for all resize participants.
   * Uses transformAnnotation to properly handle vertices, inkList, etc.
   */
  computeResizePreviewPatches(computedRects, documentId) {
    const previewPatches = {};
    const state = this.unifiedResizeStates.get(documentId);
    const participantMap = state ? new Map(state.participatingAnnotations.map((p) => [p.id, p])) : void 0;
    for (const [id, newRect] of computedRects) {
      const ta = this.getAnnotationById(id, documentId);
      if (!ta) continue;
      let targetRect = newRect;
      const info = participantMap == null ? void 0 : participantMap.get(id);
      if ((state == null ? void 0 : state.isGroupResize) && (info == null ? void 0 : info.originalUnrotatedRect)) {
        targetRect = convertAABBRectToUnrotatedSpace(
          newRect,
          info.originalRect,
          info.originalUnrotatedRect,
          ta.object.rotation ?? 0
        );
      }
      previewPatches[id] = this.transformAnnotation(ta.object, {
        type: "resize",
        changes: { rect: targetRect }
      });
    }
    return previewPatches;
  }
  /**
   * Start a unified resize operation.
   * The plugin automatically expands the selection to include attached links.
   *
   * @param documentId - The document ID
   * @param options - Resize options
   */
  startResize(documentId, options) {
    const { annotationIds, pageSize, resizeHandle } = options;
    const attachedLinkIds = [];
    const annotationsWithLinks = [];
    for (const id of annotationIds) {
      const ta = this.getAnnotationById(id, documentId);
      if (ta) {
        annotationsWithLinks.push({
          id,
          rect: ta.object.rect,
          unrotatedRect: ta.object.unrotatedRect ? this.cloneRect(ta.object.unrotatedRect) : void 0,
          pageIndex: ta.object.pageIndex,
          isAttachedLink: false
        });
        const links = this.getAttachedLinksMethod(id, documentId);
        for (const link of links) {
          if (!attachedLinkIds.includes(link.object.id)) {
            attachedLinkIds.push(link.object.id);
            annotationsWithLinks.push({
              id: link.object.id,
              rect: link.object.rect,
              unrotatedRect: link.object.unrotatedRect ? this.cloneRect(link.object.unrotatedRect) : void 0,
              pageIndex: link.object.pageIndex,
              isAttachedLink: true,
              parentId: id
            });
          }
        }
      }
    }
    const allParticipantIds = [...annotationIds, ...attachedLinkIds];
    const rects = annotationsWithLinks.map((a) => a.rect);
    const groupBox = this.computeUnifiedGroupBoundingBox(rects);
    const participatingAnnotations = this.computeUnifiedRelativePositions(
      annotationsWithLinks,
      groupBox
    );
    const computedRects = this.computeUnifiedResizedRects(participatingAnnotations, groupBox);
    const state = {
      documentId,
      isResizing: true,
      isGroupResize: annotationIds.length > 1,
      primaryIds: annotationIds,
      attachedLinkIds,
      allParticipantIds,
      originalGroupBox: groupBox,
      currentGroupBox: groupBox,
      participatingAnnotations,
      resizeHandle,
      computedRects
    };
    this.unifiedResizeStates.set(documentId, state);
    const startPatches = this.computeResizePreviewPatches(computedRects, documentId);
    this.unifiedResize$.emit({
      documentId,
      type: "start",
      state,
      computedRects: Object.fromEntries(computedRects),
      previewPatches: startPatches
    });
  }
  /**
   * Update the resize with a new group bounding box.
   * Returns the computed rects synchronously for immediate preview use.
   *
   * @param documentId - The document ID
   * @param newGroupBox - The new group bounding box
   * @returns Record of annotation ID to new rect
   */
  updateResize(documentId, newGroupBox) {
    const state = this.unifiedResizeStates.get(documentId);
    if (!(state == null ? void 0 : state.isResizing)) {
      return {};
    }
    const computedRects = this.computeUnifiedResizedRects(
      state.participatingAnnotations,
      newGroupBox
    );
    const newState = {
      ...state,
      currentGroupBox: newGroupBox,
      computedRects
    };
    this.unifiedResizeStates.set(documentId, newState);
    const computedRectsObj = Object.fromEntries(computedRects);
    const previewPatches = this.computeResizePreviewPatches(computedRects, documentId);
    this.unifiedResize$.emit({
      documentId,
      type: "update",
      state: newState,
      computedRects: computedRectsObj,
      previewPatches
    });
    return computedRectsObj;
  }
  /**
   * Commit the resize - plugin builds and applies ALL patches.
   *
   * @param documentId - The document ID
   */
  commitResize(documentId) {
    const state = this.unifiedResizeStates.get(documentId);
    if (!state) return;
    const computedRects = this.computeUnifiedResizedRects(
      state.participatingAnnotations,
      state.currentGroupBox
    );
    const patches = [];
    const participantMap = new Map(state.participatingAnnotations.map((p) => [p.id, p]));
    for (const [id, newRect] of computedRects) {
      const ta = this.getAnnotationById(id, documentId);
      if (!ta) continue;
      let targetRect = newRect;
      const info = participantMap.get(id);
      if (state.isGroupResize && (info == null ? void 0 : info.originalUnrotatedRect)) {
        targetRect = convertAABBRectToUnrotatedSpace(
          newRect,
          info.originalRect,
          info.originalUnrotatedRect,
          ta.object.rotation ?? 0
        );
      }
      const patch = this.transformAnnotation(ta.object, {
        type: "resize",
        changes: { rect: targetRect }
      });
      patches.push({ pageIndex: ta.object.pageIndex, id, patch });
    }
    if (patches.length > 0) {
      this.updateAnnotationsMethod(patches, documentId);
    }
    const endPatches = this.computeResizePreviewPatches(computedRects, documentId);
    this.unifiedResize$.emit({
      documentId,
      type: "end",
      state: { ...state, isResizing: false },
      computedRects: Object.fromEntries(computedRects),
      previewPatches: endPatches
    });
    this.unifiedResizeStates.delete(documentId);
  }
  /**
   * Cancel the resize without committing.
   *
   * @param documentId - The document ID
   */
  cancelResize(documentId) {
    const state = this.unifiedResizeStates.get(documentId);
    if (!state) return;
    const originalRects = this.computeUnifiedResizedRects(
      state.participatingAnnotations,
      state.originalGroupBox
    );
    this.unifiedResize$.emit({
      documentId,
      type: "cancel",
      state: { ...state, isResizing: false, currentGroupBox: state.originalGroupBox },
      computedRects: Object.fromEntries(originalRects),
      previewPatches: {}
    });
    this.unifiedResizeStates.delete(documentId);
  }
  /**
   * Get the current unified resize state for a document.
   */
  getResizeState(documentId) {
    return this.unifiedResizeStates.get(documentId) ?? null;
  }
  /**
   * Subscribe to unified resize state changes.
   * Framework components use this for preview updates.
   */
  get onResizeChange() {
    return this.unifiedResize$.on;
  }
  // ─────────────────────────────────────────────────────────
  // Unified Rotation API (Plugin owns all rotation logic)
  // ─────────────────────────────────────────────────────────
  cloneRect(rect) {
    return {
      origin: { x: rect.origin.x, y: rect.origin.y },
      size: { width: rect.size.width, height: rect.size.height }
    };
  }
  translateRect(rect, delta) {
    return {
      origin: {
        x: rect.origin.x + delta.x,
        y: rect.origin.y + delta.y
      },
      size: { ...rect.size }
    };
  }
  normalizeAngle(angle) {
    const normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }
  normalizeDelta(delta) {
    const normalized = (delta + 540) % 360 - 180;
    return normalized;
  }
  buildRotationParticipants(annotationIds, documentId) {
    const participants = [];
    const attachedLinkIds = [];
    for (const id of annotationIds) {
      const ta = this.getAnnotationById(id, documentId);
      if (!ta) continue;
      participants.push({
        id,
        rect: this.cloneRect(ta.object.rect),
        pageIndex: ta.object.pageIndex,
        rotation: ta.object.rotation ?? 0,
        unrotatedRect: ta.object.unrotatedRect ? this.cloneRect(ta.object.unrotatedRect) : void 0,
        isAttachedLink: false
      });
      const links = this.getAttachedLinksMethod(id, documentId);
      for (const link of links) {
        if (attachedLinkIds.includes(link.object.id)) continue;
        attachedLinkIds.push(link.object.id);
        participants.push({
          id: link.object.id,
          rect: this.cloneRect(link.object.rect),
          pageIndex: link.object.pageIndex,
          rotation: link.object.rotation ?? 0,
          unrotatedRect: link.object.unrotatedRect ? this.cloneRect(link.object.unrotatedRect) : void 0,
          isAttachedLink: true,
          parentId: id
        });
      }
    }
    return { participants, attachedLinkIds };
  }
  computeRotatePreviewPatches(state, documentId) {
    const preview = {};
    for (const participant of state.participants) {
      const ta = this.getAnnotationById(participant.id, documentId);
      if (!ta) continue;
      const originalCenter = resolveAnnotationRotationCenter({
        rect: participant.rect,
        unrotatedRect: participant.unrotatedRect,
        rotation: participant.rotation
      });
      const rotatedCenter = rotatePointAround(
        originalCenter,
        state.rotationCenter,
        state.delta
      );
      const translation = {
        x: rotatedCenter.x - originalCenter.x,
        y: rotatedCenter.y - originalCenter.y
      };
      const nextRotation = this.normalizeAngle(participant.rotation + state.delta);
      const patch = this.transformAnnotation(ta.object, {
        type: "rotate",
        changes: {
          rotation: nextRotation,
          unrotatedRect: this.translateRect(
            participant.unrotatedRect ?? participant.rect,
            translation
          )
        },
        metadata: {
          rotationAngle: nextRotation,
          rotationDelta: state.delta,
          rotationCenter: state.rotationCenter
        }
      });
      if (!patch.rect && (translation.x !== 0 || translation.y !== 0)) {
        patch.rect = {
          origin: {
            x: ta.object.rect.origin.x + translation.x,
            y: ta.object.rect.origin.y + translation.y
          },
          size: { ...ta.object.rect.size }
        };
      }
      preview[participant.id] = patch;
    }
    return preview;
  }
  startRotation(documentId, options) {
    const { annotationIds, cursorAngle, rotationCenter } = options;
    const { participants, attachedLinkIds } = this.buildRotationParticipants(
      annotationIds,
      documentId
    );
    if (participants.length === 0) return;
    const rects = participants.map((p) => p.rect);
    const groupBox = this.computeUnifiedGroupBoundingBox(rects);
    const center = rotationCenter ?? {
      x: groupBox.origin.x + groupBox.size.width / 2,
      y: groupBox.origin.y + groupBox.size.height / 2
    };
    const state = {
      documentId,
      isRotating: true,
      primaryIds: annotationIds,
      attachedLinkIds,
      allParticipantIds: participants.map((p) => p.id),
      rotationCenter: center,
      cursorStartAngle: cursorAngle,
      currentAngle: cursorAngle,
      delta: 0,
      participants
    };
    this.unifiedRotateStates.set(documentId, state);
    const previewPatches = this.computeRotatePreviewPatches(state, documentId);
    this.unifiedRotate$.emit({
      documentId,
      type: "start",
      state,
      previewPatches
    });
  }
  updateRotation(documentId, cursorAngle, rotationDelta) {
    const state = this.unifiedRotateStates.get(documentId);
    if (!(state == null ? void 0 : state.isRotating)) {
      return;
    }
    const delta = rotationDelta !== void 0 ? rotationDelta : this.normalizeDelta(cursorAngle - state.cursorStartAngle);
    const newState = {
      ...state,
      currentAngle: cursorAngle,
      delta
    };
    this.unifiedRotateStates.set(documentId, newState);
    const previewPatches = this.computeRotatePreviewPatches(newState, documentId);
    this.unifiedRotate$.emit({
      documentId,
      type: "update",
      state: newState,
      previewPatches
    });
  }
  commitRotation(documentId) {
    const state = this.unifiedRotateStates.get(documentId);
    if (!state) return;
    const previewPatches = this.computeRotatePreviewPatches(state, documentId);
    const patches = [];
    for (const [id, patch] of Object.entries(previewPatches)) {
      const ta = this.getAnnotationById(id, documentId);
      if (!ta) continue;
      patches.push({ pageIndex: ta.object.pageIndex, id, patch });
    }
    if (patches.length > 0) {
      this.updateAnnotationsMethod(patches, documentId);
    }
    this.unifiedRotate$.emit({
      documentId,
      type: "end",
      state: { ...state, isRotating: false },
      previewPatches
    });
    this.unifiedRotateStates.delete(documentId);
  }
  cancelRotation(documentId) {
    const state = this.unifiedRotateStates.get(documentId);
    if (!state) return;
    this.unifiedRotate$.emit({
      documentId,
      type: "cancel",
      state: { ...state, isRotating: false, delta: 0, currentAngle: state.cursorStartAngle },
      previewPatches: {}
    });
    this.unifiedRotateStates.delete(documentId);
  }
  getRotateState(documentId) {
    return this.unifiedRotateStates.get(documentId) ?? null;
  }
  /**
   * Subscribe to unified rotation state changes.
   */
  get onRotateChange() {
    return this.unifiedRotate$.on;
  }
  updateAnnotationsMethod(patches, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "UpdateAnnotations",
        `Cannot update annotations: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const docState = this.getDocumentState(docId);
    const patchData = patches.map(({ pageIndex, id, patch }) => {
      var _a;
      const originalObject = (_a = docState.byUid[id]) == null ? void 0 : _a.object;
      if (!originalObject) return null;
      const finalPatch = this.buildPatch(originalObject, {
        ...patch,
        author: patch.author ?? this.config.annotationAuthor
      });
      return { pageIndex, id, patch: finalPatch, originalObject };
    }).filter((p) => p !== null);
    if (patchData.length === 0) return;
    const execute = () => {
      for (const { pageIndex, id, patch, originalObject } of patchData) {
        this.dispatch(patchAnnotation(docId, pageIndex, id, patch));
        this.events$.emit(docId, {
          type: "update",
          documentId: docId,
          annotation: originalObject,
          pageIndex,
          patch,
          committed: false
        });
      }
    };
    if (!this.history) {
      execute();
      if (this.config.autoCommit !== false) {
        this.commit(docId);
      }
      return;
    }
    const undoData = patchData.map(({ pageIndex, id, patch, originalObject }) => ({
      pageIndex,
      id,
      originalPatch: Object.fromEntries(
        Object.keys(patch).map((key) => [key, originalObject[key]])
      ),
      originalObject
    }));
    const command = {
      execute,
      undo: () => {
        for (const { pageIndex, id, originalPatch, originalObject } of undoData) {
          this.dispatch(patchAnnotation(docId, pageIndex, id, originalPatch));
          this.events$.emit(docId, {
            type: "update",
            documentId: docId,
            annotation: originalObject,
            pageIndex,
            patch: originalPatch,
            committed: false
          });
        }
      },
      metadata: { annotationIds: patchData.map((p) => p.id) }
    };
    const historyScope = this.history.forDocument(docId);
    historyScope.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }
  moveAnnotationsMethod(patches, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    if (!this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "MoveAnnotations",
        `Cannot move annotations: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const docState = this.getDocumentState(docId);
    const moveData = patches.map(({ pageIndex, id, patch }) => {
      var _a;
      const originalObject = (_a = docState.byUid[id]) == null ? void 0 : _a.object;
      if (!originalObject) return null;
      return { pageIndex, id, patch, originalObject };
    }).filter((p) => p !== null);
    if (moveData.length === 0) return;
    const execute = () => {
      for (const { pageIndex, id, patch, originalObject } of moveData) {
        this.dispatch(moveAnnotation(docId, pageIndex, id, patch));
        this.events$.emit(docId, {
          type: "update",
          documentId: docId,
          annotation: originalObject,
          pageIndex,
          patch,
          committed: false
        });
      }
    };
    if (!this.history) {
      execute();
      if (this.config.autoCommit !== false) {
        this.commit(docId);
      }
      return;
    }
    const undoData = moveData.map(({ pageIndex, id, patch, originalObject }) => ({
      pageIndex,
      id,
      originalPatch: Object.fromEntries(
        Object.keys(patch).map((key) => [key, originalObject[key]])
      ),
      originalObject
    }));
    const command = {
      execute,
      undo: () => {
        for (const { pageIndex, id, originalPatch, originalObject } of undoData) {
          this.dispatch(moveAnnotation(docId, pageIndex, id, originalPatch));
          this.events$.emit(docId, {
            type: "update",
            documentId: docId,
            annotation: originalObject,
            pageIndex,
            patch: originalPatch,
            committed: false
          });
        }
      },
      metadata: { annotationIds: moveData.map((p) => p.id) }
    };
    const historyScope = this.history.forDocument(docId);
    historyScope.register(command, this.ANNOTATION_HISTORY_TOPIC);
  }
  moveAnnotationMethod(pageIndex, annotationId, position, mode = "delta", documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const ta = this.getAnnotationById(annotationId, docId);
    if (!ta) return;
    const currentRect = ta.object.rect;
    const newRect = {
      ...currentRect,
      origin: mode === "absolute" ? { x: position.x, y: position.y } : { x: currentRect.origin.x + position.x, y: currentRect.origin.y + position.y }
    };
    const patch = this.transformAnnotation(ta.object, {
      type: "move",
      changes: { rect: newRect }
    });
    this.moveAnnotationsMethod([{ pageIndex, id: annotationId, patch }], docId);
  }
  getActiveTool(documentId) {
    const docState = this.getDocumentState(documentId);
    if (!docState.activeToolId) return null;
    return this.state.tools.find((t) => t.id === docState.activeToolId) ?? null;
  }
  setActiveTool(toolId, documentId, context) {
    var _a, _b;
    const docId = documentId ?? this.getActiveDocumentId();
    if (toolId !== null && !this.checkPermission(docId, PdfPermissionFlag.ModifyAnnotations)) {
      this.logger.debug(
        "AnnotationPlugin",
        "SetActiveTool",
        `Cannot activate tool: document ${docId} lacks ModifyAnnotations permission`
      );
      return;
    }
    const docState = this.getDocumentState(docId);
    if (toolId === docState.activeToolId && !context) return;
    this.dispatch(setActiveToolId(docId, toolId, context));
    const tool = this.state.tools.find((t) => t.id === toolId);
    if (tool) {
      (_a = this.interactionManager) == null ? void 0 : _a.forDocument(docId).activate(tool.interaction.mode ?? tool.id);
    } else {
      (_b = this.interactionManager) == null ? void 0 : _b.forDocument(docId).activateDefaultMode();
    }
  }
  getTool(toolId) {
    return this.state.tools.find((t) => t.id === toolId);
  }
  findToolForAnnotation(annotation) {
    let bestTool = null;
    let bestScore = 0;
    for (const tool of this.state.tools) {
      const score = tool.matchScore(annotation);
      if (score > bestScore) {
        bestScore = score;
        bestTool = tool;
      }
    }
    return bestTool;
  }
  // ─────────────────────────────────────────────────────────
  // Locking
  // ─────────────────────────────────────────────────────────
  setLocked(mode, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(setLockedAction(docId, mode));
    const updatedDocState = this.getDocumentState(docId);
    const lockedSelected = updatedDocState.selectedUids.filter((uid) => {
      const ta = updatedDocState.byUid[uid];
      if (!ta) return false;
      return !this.isAnnotationInteractive(ta.object, docId);
    });
    if (lockedSelected.length > 0) {
      const remaining = updatedDocState.selectedUids.filter((uid) => !lockedSelected.includes(uid));
      this.dispatch(setSelection(docId, remaining));
    }
  }
  getLocked(documentId) {
    return this.getDocumentState(documentId).locked;
  }
  isAnnotationLocked(annotation, documentId) {
    if (hasLockedFlag(annotation)) return true;
    const tool = this.findToolForAnnotation(annotation);
    const categories = getAnnotationCategories(tool);
    return isCategoryLocked(categories, this.getLocked(documentId));
  }
  /**
   * Whether the annotation can be interacted with at all (selected, edited, menu shown).
   * Returns false for `noView`, `hidden`, `readOnly`, or category-locked annotations.
   * This is the spec-compliant "can the user do anything with this?" predicate.
   */
  isAnnotationInteractive(annotation, documentId) {
    if (hasNoViewFlag(annotation)) return false;
    if (hasHiddenFlag(annotation)) return false;
    if (hasReadOnlyFlag(annotation)) return false;
    const tool = this.findToolForAnnotation(annotation);
    const categories = getAnnotationCategories(tool);
    if (isCategoryLocked(categories, this.getLocked(documentId))) return false;
    return true;
  }
  /**
   * Whether the annotation's structure (position, size, rotation, vertices) is locked.
   * Non-interactive annotations are treated as structurally locked. PDF `locked` flag
   * makes an otherwise-interactive annotation structurally locked while still selectable.
   */
  isAnnotationStructurallyLocked(annotation, documentId) {
    if (!this.isAnnotationInteractive(annotation, documentId)) return true;
    return hasLockedFlag(annotation);
  }
  /**
   * Whether the annotation's content (e.g. FreeText text) is locked.
   * Non-interactive annotations are treated as content-locked. PDF `lockedContents`
   * flag blocks content edits while still allowing move/resize.
   */
  isAnnotationContentLocked(annotation, documentId) {
    if (!this.isAnnotationInteractive(annotation, documentId)) return true;
    return hasLockedContentsFlag(annotation);
  }
  /**
   * Whether a specific annotation is eligible to be added to the selection store.
   * Differs from the subtype-based `isSelectableAnnotation` helper: that answers
   * "is this subtype ever selectable?", while this answers "is this specific
   * annotation selectable right now given its flags and document lock state?".
   */
  isAnnotationSelectable(annotation, documentId) {
    return this.isAnnotationInteractive(annotation, documentId);
  }
  isCategoryLockedMethod(category, documentId) {
    return isCategoryLocked([category], this.getLocked(documentId));
  }
  isToolLockedMethod(toolId, documentId) {
    const tool = this.getTool(toolId);
    if (!tool) return false;
    const categories = getAnnotationCategories(tool);
    return isCategoryLocked(categories, this.getLocked(documentId));
  }
  syncAnnotationObject(id, patch, documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    this.dispatch(syncAnnotationObject(docId, id, patch));
  }
  // ─────────────────────────────────────────────────────────
  // Link Target Navigation
  // ─────────────────────────────────────────────────────────
  navigateTargetMethod(target, documentId) {
    var _a;
    const docId = documentId ?? this.getActiveDocumentId();
    const emit = (result) => {
      this.navigate$.emit(docId, { documentId: docId, result, target });
      return PdfTaskHelper.resolve(result);
    };
    let destination;
    if (target.type === "destination") {
      destination = target.destination;
    } else if (target.type === "action") {
      const action = target.action;
      if (action.type === PdfActionType.Goto || action.type === PdfActionType.RemoteGoto) {
        destination = action.destination;
      } else if (action.type === PdfActionType.URI) {
        return emit({ outcome: "uri", uri: action.uri });
      } else {
        return emit({ outcome: "unsupported" });
      }
    }
    if (!destination) {
      return emit({ outcome: "unsupported" });
    }
    if (!this.scroll) {
      return emit({ outcome: "destination", destination });
    }
    const scrollScope = this.scroll.forDocument(docId);
    if (destination.zoom.mode === PdfZoomMode.XYZ) {
      const coreDoc = this.getCoreDocument(docId);
      const page = (_a = coreDoc == null ? void 0 : coreDoc.document) == null ? void 0 : _a.pages.find((p) => p.index === destination.pageIndex);
      scrollScope.scrollToPage({
        pageNumber: destination.pageIndex + 1,
        pageCoordinates: page && destination.zoom.params ? { x: destination.zoom.params.x, y: page.size.height - destination.zoom.params.y } : void 0,
        behavior: "smooth"
      });
    } else {
      scrollScope.scrollToPage({
        pageNumber: destination.pageIndex + 1,
        behavior: "smooth"
      });
    }
    return emit({ outcome: "navigated" });
  }
  /**
   * Collects all pending annotation changes for a document into a batch.
   * This separates the "what to commit" from "how to commit" for cleaner code.
   */
  collectPendingChanges(docId, doc) {
    const docState = this.getDocumentState(docId);
    const contexts = this.pendingContexts.get(docId);
    const batch = {
      creations: [],
      updates: [],
      deletions: [],
      committedUids: [],
      isEmpty: true
    };
    for (const [uid, ta] of Object.entries(docState.byUid)) {
      if (ta.commitState === "synced") continue;
      const page = doc.pages.find((p) => p.index === ta.object.pageIndex);
      if (!page) continue;
      batch.committedUids.push(uid);
      batch.isEmpty = false;
      switch (ta.commitState) {
        case "new":
          batch.creations.push({
            uid,
            ta,
            ctx: contexts == null ? void 0 : contexts.get(ta.object.id)
          });
          break;
        case "moved":
          batch.updates.push({ uid, ta, moved: true });
          break;
        case "dirty":
          batch.updates.push({ uid, ta });
          break;
        case "deleted":
          batch.deletions.push({ uid, ta });
          break;
      }
    }
    return batch;
  }
  /**
   * Executes a batch of pending changes by creating engine tasks.
   * Returns a task that resolves when all operations complete.
   */
  executeCommitBatch(docId, doc, batch) {
    const task = new Task();
    const contexts = this.pendingContexts.get(docId);
    const pendingOps = [];
    for (const { uid, ta, ctx } of batch.creations) {
      const page = doc.pages.find((p) => p.index === ta.object.pageIndex);
      if (!page) continue;
      const createTask = this.engine.createPageAnnotation(doc, page, ta.object, ctx);
      pendingOps.push({ type: "create", task: createTask, ta, uid, ctx });
    }
    for (const { uid, ta, moved } of batch.updates) {
      const page = doc.pages.find((p) => p.index === ta.object.pageIndex);
      if (!page) continue;
      const updateTask = moved ? this.engine.updatePageAnnotation(doc, page, ta.object, { regenerateAppearance: false }) : this.engine.updatePageAnnotation(doc, page, ta.object);
      pendingOps.push({ type: "update", task: updateTask, ta, uid, moved });
    }
    for (const { uid, ta } of batch.deletions) {
      const page = doc.pages.find((p) => p.index === ta.object.pageIndex);
      if (!page) continue;
      if (ta.object.id) {
        const deleteTask = new Task();
        const removeTask = this.engine.removePageAnnotation(doc, page, ta.object);
        removeTask.wait(() => deleteTask.resolve(true), deleteTask.fail);
        pendingOps.push({ type: "delete", task: deleteTask, ta, uid });
      } else {
        this.dispatch(purgeAnnotation(docId, ta.object.pageIndex, uid));
      }
    }
    const allTasks = pendingOps.map((op) => op.task);
    Task.allSettled(allTasks).wait(
      () => {
        this.emitCommitEvents(docId, pendingOps, contexts);
        for (const op of pendingOps) {
          if (op.type === "update" && op.moved) continue;
          if (op.type === "create" || op.type === "update" || op.type === "delete") {
            this.invalidateAnnotationAppearance(op.ta.object.id, op.ta.object.pageIndex, docId);
          }
        }
        this.dispatch(commitPendingChanges(docId, batch.committedUids));
        task.resolve(true);
      },
      (error) => task.fail(error)
    );
    return task;
  }
  /**
   * Emits commit events for all completed operations.
   * Centralizes event emission for cleaner separation of concerns.
   */
  emitCommitEvents(docId, operations, contexts) {
    for (const op of operations) {
      if (op.task.state.stage !== TaskStage.Resolved) continue;
      switch (op.type) {
        case "create":
          this.events$.emit(docId, {
            type: "create",
            documentId: docId,
            annotation: op.ta.object,
            pageIndex: op.ta.object.pageIndex,
            ctx: op.ctx,
            committed: true
          });
          contexts == null ? void 0 : contexts.delete(op.ta.object.id);
          break;
        case "update":
          this.events$.emit(docId, {
            type: "update",
            documentId: docId,
            annotation: op.ta.object,
            pageIndex: op.ta.object.pageIndex,
            patch: op.ta.object,
            committed: true
          });
          break;
        case "delete":
          this.dispatch(purgeAnnotation(docId, op.ta.object.pageIndex, op.uid));
          this.events$.emit(docId, {
            type: "delete",
            documentId: docId,
            annotation: op.ta.object,
            pageIndex: op.ta.object.pageIndex,
            committed: true
          });
          break;
      }
    }
  }
  /**
   * Attempts to acquire the commit lock for a document.
   * Returns true if acquired, false if a commit is already in progress.
   */
  acquireCommitLock(docId) {
    if (this.commitInProgress.get(docId)) {
      return false;
    }
    this.commitInProgress.set(docId, true);
    return true;
  }
  /**
   * Releases the commit lock for a document.
   */
  releaseCommitLock(docId) {
    this.commitInProgress.set(docId, false);
  }
  commit(documentId) {
    const docId = documentId ?? this.getActiveDocumentId();
    const docState = this.getDocumentState(docId);
    if (!docState.hasPendingChanges) {
      return PdfTaskHelper.resolve(true);
    }
    if (!this.acquireCommitLock(docId)) {
      return PdfTaskHelper.resolve(true);
    }
    const coreDocState = this.getCoreDocument(docId);
    const doc = coreDocState == null ? void 0 : coreDocState.document;
    if (!doc) {
      this.releaseCommitLock(docId);
      return PdfTaskHelper.reject({ code: PdfErrorCode.NotFound, message: "Document not found" });
    }
    const batch = this.collectPendingChanges(docId, doc);
    if (batch.isEmpty) {
      this.releaseCommitLock(docId);
      return PdfTaskHelper.resolve(true);
    }
    const task = new Task();
    this.executeCommitBatch(docId, doc, batch).wait(
      () => {
        this.releaseCommitLock(docId);
        const updatedDocState = this.getDocumentState(docId);
        if (updatedDocState.hasPendingChanges) {
          this.commit(docId).wait(
            (result) => task.resolve(result),
            (error) => task.fail(error)
          );
        } else {
          task.resolve(true);
        }
      },
      (error) => {
        this.releaseCommitLock(docId);
        task.fail(error);
      }
    );
    return task;
  }
};
_AnnotationPlugin.id = "annotation";
_AnnotationPlugin.defaultHandlerFactories = /* @__PURE__ */ new Map([
  [PdfAnnotationSubtype.CIRCLE, circleHandlerFactory],
  [PdfAnnotationSubtype.SQUARE, squareHandlerFactory],
  [PdfAnnotationSubtype.STAMP, stampHandlerFactory],
  [PdfAnnotationSubtype.POLYGON, polygonHandlerFactory],
  [PdfAnnotationSubtype.POLYLINE, polylineHandlerFactory],
  [PdfAnnotationSubtype.LINE, lineHandlerFactory],
  [PdfAnnotationSubtype.INK, inkHandlerFactory],
  [PdfAnnotationSubtype.FREETEXT, freeTextHandlerFactory],
  [PdfAnnotationSubtype.TEXT, textHandlerFactory],
  [PdfAnnotationSubtype.LINK, linkHandlerFactory]
]);
let AnnotationPlugin = _AnnotationPlugin;
function resolveInteractionProp(prop, annotation, defaultValue) {
  if (prop === void 0) return defaultValue;
  if (typeof prop === "function") return prop(annotation);
  return prop;
}
const defineAnnotationTool = (tool) => tool;
function createToolPredicate(id) {
  return (tool) => {
    return (tool == null ? void 0 : tool.id) === id;
  };
}
const isHighlightTool = createToolPredicate("highlight");
const isSquigglyTool = createToolPredicate("squiggly");
const isUnderlineTool = createToolPredicate("underline");
const isStrikeoutTool = createToolPredicate("strikeout");
const isInkTool = createToolPredicate("ink");
const isInkHighlighterTool = createToolPredicate("inkHighlighter");
const isSquareTool = createToolPredicate("square");
const isCircleTool = createToolPredicate("circle");
const isLineTool = createToolPredicate("line");
const isPolylineTool = createToolPredicate("polyline");
const isPolygonTool = createToolPredicate("polygon");
const isFreeTextTool = createToolPredicate("freeText");
const isStampTool = createToolPredicate("stamp");
const isInsertTextTool = createToolPredicate("insertText");
const isReplaceTextTool = createToolPredicate("replaceText");
const AnnotationPluginPackage = {
  manifest,
  create: (registry, config) => new AnnotationPlugin(ANNOTATION_PLUGIN_ID, registry, config),
  reducer,
  initialState: (_, config) => initialState(config)
};
export {
  ANNOTATION_PLUGIN_ID,
  AnnotationPlugin,
  AnnotationPluginPackage,
  LockModeType,
  applyInsertUpright,
  calculateRotatedRectAABB2 as calculateRotatedRectAABB,
  calculateRotatedRectAABBAroundPoint2 as calculateRotatedRectAABBAroundPoint,
  clampAnnotationToPage,
  convertAABBRectToUnrotatedSpace,
  createToolPredicate,
  defineAnnotationTool,
  generateCloudyEllipsePath,
  generateCloudyPolygonPath,
  generateCloudyRectanglePath,
  getAnnotationByUid,
  getAnnotationCategories,
  getAnnotations,
  getAnnotationsByPageIndex,
  getAttachedLinks,
  getCloudyBorderExtent,
  getGroupLeaderId,
  getGroupMembers,
  getIRTChildIds,
  getIRTChildrenByType,
  getRectCenter2 as getRectCenter,
  getSelectedAnnotation,
  getSelectedAnnotationByPageIndex,
  getSelectedAnnotationIds,
  getSelectedAnnotations,
  getSelectedAnnotationsByPageIndex,
  getSelectionGroupingAction,
  getSidebarAnnotationsWithReplies,
  getSidebarAnnotationsWithRepliesGroupedByPage,
  getToolDefaultsById,
  hasAttachedLinks,
  hasHiddenFlag,
  hasIRTChildren,
  hasLockedContentsFlag,
  hasLockedFlag,
  hasMultipleSelected,
  hasNoViewFlag,
  hasReadOnlyFlag,
  inferRotationCenterFromRects2 as inferRotationCenterFromRects,
  initialDocumentState,
  initialState,
  isAnnotationSelected,
  isCaret,
  isCategoryLocked,
  isCircle,
  isCircleTool,
  isFreeText,
  isFreeTextTool,
  isHighlight,
  isHighlightTool,
  isInGroup,
  isInk,
  isInkHighlighterTool,
  isInkTool,
  isInsertTextTool,
  isLine,
  isLineTool,
  isLink,
  isPolygon,
  isPolygonTool,
  isPolyline,
  isPolylineTool,
  isRedact,
  isReplaceTextTool,
  isSelectableAnnotation,
  isSidebarAnnotation,
  isSquare,
  isSquareTool,
  isSquiggly,
  isSquigglyTool,
  isStamp,
  isStampTool,
  isStrikeout,
  isStrikeoutTool,
  isText,
  isTextMarkup,
  isUnderline,
  isUnderlineTool,
  isWidget,
  manifest,
  index as patching,
  rectsIntersect,
  resolveInteractionProp,
  rotatePointAround2 as rotatePointAroundCenter,
  rotateVertices2 as rotateVertices,
  useClickDetector,
  useState
};
//# sourceMappingURL=index.js.map
