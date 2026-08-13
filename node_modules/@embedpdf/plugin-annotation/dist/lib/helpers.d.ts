import { PdfAnnotationSubtype, PdfAnnotationObject, PdfAnnotationOf, Rect } from '@embedpdf/models';
import { LockMode, TrackedAnnotation } from './types';
import { AnnotationTool } from './tools/types';
/**
 * Check if two rectangles intersect
 */
export declare function rectsIntersect(a: Rect, b: Rect): boolean;
export type AnnoOf<S extends PdfAnnotationSubtype> = PdfAnnotationOf<S>;
export type TextMarkupSubtype = PdfAnnotationSubtype.HIGHLIGHT | PdfAnnotationSubtype.UNDERLINE | PdfAnnotationSubtype.STRIKEOUT | PdfAnnotationSubtype.SQUIGGLY;
export type SidebarSubtype = TextMarkupSubtype | PdfAnnotationSubtype.TEXT | PdfAnnotationSubtype.INK | PdfAnnotationSubtype.SQUARE | PdfAnnotationSubtype.CIRCLE | PdfAnnotationSubtype.POLYGON | PdfAnnotationSubtype.LINE | PdfAnnotationSubtype.POLYLINE | PdfAnnotationSubtype.FREETEXT | PdfAnnotationSubtype.STAMP | PdfAnnotationSubtype.REDACT | PdfAnnotationSubtype.CARET;
/** True when `a.object.type === INK` – and narrows the generic. */
export declare function isInk(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.INK>>;
/** Example for Circle – create similar ones for Square, Line, etc. */
export declare function isCircle(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.CIRCLE>>;
export declare function isPolygon(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.POLYGON>>;
export declare function isSquare(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.SQUARE>>;
export declare function isLine(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.LINE>>;
export declare function isPolyline(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.POLYLINE>>;
export declare function isHighlight(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.HIGHLIGHT>>;
export declare function isUnderline(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.UNDERLINE>>;
export declare function isStrikeout(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.STRIKEOUT>>;
export declare function isSquiggly(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.SQUIGGLY>>;
export declare function isTextMarkup(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<TextMarkupSubtype>>;
export declare function isFreeText(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.FREETEXT>>;
export declare function isStamp(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.STAMP>>;
export declare function isText(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.TEXT>>;
export declare function isLink(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.LINK>>;
export declare function isRedact(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.REDACT>>;
export declare function isCaret(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.CARET>>;
export declare function isWidget(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<PdfAnnotationSubtype.WIDGET>>;
export declare function isSidebarAnnotation(a: TrackedAnnotation): a is TrackedAnnotation<AnnoOf<SidebarSubtype>>;
export declare function isSelectableAnnotation(a: TrackedAnnotation): boolean;
/** Extract the category tags from a tool (returns `[]` for uncategorized). */
export declare function getAnnotationCategories(tool: AnnotationTool | null): string[];
/** Check if the category-based LockMode locks annotations with these categories. */
export declare function isCategoryLocked(categories: string[], mode: LockMode): boolean;
/** Check if the annotation itself has the PDF 'locked' flag (bit 7). */
export declare function hasLockedFlag(annotation: PdfAnnotationObject): boolean;
/** Check if the annotation has the PDF 'noView' flag (bit 6). */
export declare function hasNoViewFlag(annotation: PdfAnnotationObject): boolean;
/** Check if the annotation has the PDF 'hidden' flag (bit 2): do not render, do not interact, do not print. */
export declare function hasHiddenFlag(annotation: PdfAnnotationObject): boolean;
/** Check if the annotation has the PDF 'readOnly' flag (bit 7): do not allow user interaction. Ignored for widgets per spec. */
export declare function hasReadOnlyFlag(annotation: PdfAnnotationObject): boolean;
/** Check if the annotation has the PDF 'lockedContents' flag (bit 10): content cannot be modified by the user. */
export declare function hasLockedContentsFlag(annotation: PdfAnnotationObject): boolean;
