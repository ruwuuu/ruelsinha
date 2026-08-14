import { AnnotationState, AnnotationDocumentState, SidebarAnnotationEntry, TrackedAnnotation, GroupingAction } from './types';
import { PdfAnnotationSubtype, PdfAnnotationObject } from '@embedpdf/models';
import { ToolMap } from './tools/tools-utils';
/** All annotations _objects_ on a single page (order preserved). */
export declare const getAnnotationsByPageIndex: (s: AnnotationDocumentState, page: number) => TrackedAnnotation<PdfAnnotationObject>[];
/** Shortcut: every page → list of annotation objects. */
export declare const getAnnotations: (s: AnnotationDocumentState) => Record<number, TrackedAnnotation<PdfAnnotationObject>[]>;
/**
 * The full `TrackedAnnotation` for the current selection.
 * @deprecated Use getSelectedAnnotations() for multi-select support. Returns first selected or null.
 */
export declare const getSelectedAnnotation: (s: AnnotationDocumentState) => TrackedAnnotation | null;
/** Get all selected TrackedAnnotations */
export declare const getSelectedAnnotations: (s: AnnotationDocumentState) => TrackedAnnotation[];
/** Get the IDs of all selected annotations */
export declare const getSelectedAnnotationIds: (s: AnnotationDocumentState) => string[];
/** Get a tracked annotation by its ID */
export declare const getAnnotationByUid: (s: AnnotationDocumentState, uid: string) => TrackedAnnotation<PdfAnnotationObject>;
/**
 * Get selected annotation on a specific page (single, for backward compatibility)
 * @deprecated Use getSelectedAnnotationsByPageIndex() for multi-select support.
 */
export declare const getSelectedAnnotationByPageIndex: (s: AnnotationDocumentState, pageIndex: number) => TrackedAnnotation | null;
/** Get all selected annotations on a specific page */
export declare const getSelectedAnnotationsByPageIndex: (s: AnnotationDocumentState, pageIndex: number) => TrackedAnnotation[];
/** Check if a given annotation is in the current selection. */
export declare const isAnnotationSelected: (s: AnnotationDocumentState, id: string) => boolean;
/** Check if multiple annotations are selected */
export declare const hasMultipleSelected: (s: AnnotationDocumentState) => boolean;
/**
 * Returns the current defaults for a specific tool by its ID.
 * This is fully type-safe and infers the correct return type.
 *
 * @param state The annotation plugin's state.
 * @param toolId The ID of the tool (e.g., 'highlight', 'pen').
 * @returns The tool's current `defaults` object, or `undefined` if not found.
 */
export declare function getToolDefaultsById<K extends keyof ToolMap>(state: AnnotationState, toolId: K): ToolMap[K]['defaults'] | undefined;
/**
 * Collect every sidebar-eligible annotation and attach its TEXT replies,
 * grouped by page for efficient rendering.
 *
 * Annotations linked via IRT / RT=Group are collapsed: the group leader
 * becomes the sidebar entry and its non-LINK group members are attached
 * as `groupMembers`. This keeps the sidebar compact for tools like
 * Replace Text (Caret + StrikeOut pair).
 *
 * Result shape:
 * {
 *   0: [{ page: 0, annotation: <TrackedAnnotation>, replies: [ … ], groupMembers: [ … ] }, ...],
 *   1: [{ page: 1, annotation: <TrackedAnnotation>, replies: [ … ] }, ...],
 *   …
 * }
 */
export declare const getSidebarAnnotationsWithRepliesGroupedByPage: (s: AnnotationDocumentState) => Record<number, SidebarAnnotationEntry[]>;
/**
 * Collect every sidebar-eligible annotation and attach its TEXT replies.
 *
 * Result shape:
 * [
 *   { page: 0, annotation: <TrackedAnnotation>, replies: [ … ] },
 *   { page: 1, annotation: <TrackedAnnotation>, replies: [ … ] },
 *   …
 * ]
 */
export declare const getSidebarAnnotationsWithReplies: (s: AnnotationDocumentState) => SidebarAnnotationEntry[];
/**
 * Get all IRT child annotation info for cascade delete.
 * Returns array of { id, pageIndex } for each annotation that references parentId.
 */
export declare const getIRTChildIds: (s: AnnotationDocumentState, parentId: string) => {
    id: string;
    pageIndex: number;
}[];
/**
 * Check if an annotation has any IRT children (links, replies, etc.)
 */
export declare const hasIRTChildren: (s: AnnotationDocumentState, parentId: string) => boolean;
/**
 * Get IRT children filtered by annotation type (e.g., only LINK).
 * @param s - The annotation document state
 * @param parentId - The parent annotation ID
 * @param types - Array of annotation subtypes to include
 */
export declare const getIRTChildrenByType: (s: AnnotationDocumentState, parentId: string, types: PdfAnnotationSubtype[]) => TrackedAnnotation[];
/**
 * Get link annotations attached to a parent annotation via IRT relationship.
 * @param s - The annotation document state
 * @param parentId - The parent annotation ID
 */
export declare const getAttachedLinks: (s: AnnotationDocumentState, parentId: string) => TrackedAnnotation[];
/**
 * Check if an annotation has attached link children.
 * @param s - The annotation document state
 * @param parentId - The parent annotation ID
 */
export declare const hasAttachedLinks: (s: AnnotationDocumentState, parentId: string) => boolean;
/**
 * Get the leader ID of a group.
 * If the annotation has inReplyToId with replyType = Group, return the inReplyToId.
 * Otherwise, the annotation itself is the leader.
 *
 * @param s - The annotation document state
 * @param annotationId - The annotation ID to find the group leader for
 * @returns The leader annotation ID, or undefined if annotation not found
 */
export declare const getGroupLeaderId: (s: AnnotationDocumentState, annotationId: string) => string | undefined;
/**
 * Get all annotations in the same group as the given annotation.
 * Returns the leader plus all annotations with inReplyToId pointing to leader and replyType = Group.
 * Note: LINK annotations are excluded - they use IRT/Group for attachment but are not "group members"
 * in the user-facing sense.
 *
 * @param s - The annotation document state
 * @param annotationId - Any annotation ID in the group
 * @returns Array of TrackedAnnotations in the group (including the annotation itself)
 */
export declare const getGroupMembers: (s: AnnotationDocumentState, annotationId: string) => TrackedAnnotation<PdfAnnotationObject>[];
/**
 * Check if an annotation is part of a group.
 * An annotation is in a group if:
 * - It has inReplyToId with replyType = Group (it's a group member), OR
 * - It has at least one other annotation pointing to it with replyType = Group (it's a group leader)
 *
 * Note: LINK annotations are excluded - they use IRT/Group for attachment but are not "group members"
 * in the user-facing sense. An annotation with only attached links is NOT considered "in a group".
 *
 * @param s - The annotation document state
 * @param annotationId - The annotation ID to check
 * @returns true if the annotation is part of a group
 */
export declare const isInGroup: (s: AnnotationDocumentState, annotationId: string) => boolean;
/**
 * Determine what grouping action is available for the current selection.
 *
 * @param s - The annotation document state
 * @returns The available grouping action
 */
export declare const getSelectionGroupingAction: (s: AnnotationDocumentState) => GroupingAction;
