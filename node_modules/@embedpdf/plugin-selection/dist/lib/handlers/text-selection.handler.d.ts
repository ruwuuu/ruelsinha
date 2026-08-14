import { PdfPageGeometry } from '@embedpdf/models';
import { EmbedPdfPointerEvent, PointerEventHandlersWithLifecycle } from '@embedpdf/plugin-interaction-manager';
export interface TextSelectionHandlerOptions {
    /** Returns the page geometry, or undefined if not loaded yet */
    getGeometry: () => PdfPageGeometry | undefined;
    /** Check if selection is enabled for this mode */
    isEnabled: (modeId: string) => boolean;
    /** Called when drag-selection begins on a glyph */
    onBegin: (glyphIndex: number, modeId: string) => void;
    /** Called when drag-selection updates to a new glyph */
    onUpdate: (glyphIndex: number, modeId: string) => void;
    /** Called when drag-selection ends (pointer up) */
    onEnd: (modeId: string) => void;
    /** Called to clear the current selection */
    onClear: (modeId: string) => void;
    /** Returns whether text selection is currently in progress */
    isSelecting: () => boolean;
    /** Set or remove the text cursor */
    setCursor: (cursor: string | null) => void;
    /** Called when the user clicks directly on empty page space (target === currentTarget) */
    onEmptySpaceClick?: (modeId: string) => void;
    /** Called on double-click over a glyph; receives the char index */
    onWordSelect?: (glyphIndex: number, modeId: string) => void;
    /** Called on triple-click over a glyph; receives the char index */
    onLineSelect?: (glyphIndex: number, modeId: string) => void;
    /**
     * Signals whether the text handler has claimed a pointer-down (anchor set)
     * even before the drag threshold is met. Used to prevent the marquee handler
     * from activating concurrently.
     */
    setHasTextAnchor?: (active: boolean) => void;
    /**
     * Minimum drag distance (in page-coordinate units) before a pointer-down
     * starts an actual selection drag. Default: 3.
     */
    minDragDistance?: number;
    /** Tolerance factor passed through to glyphAt. Default: 0.9. */
    toleranceFactor?: number;
}
/**
 * Creates a text selection handler that manages pointer-based text selection,
 * double-click word selection, triple-click line selection, and a drag threshold.
 *
 * Behaviour modelled after Chromium's PDFiumEngine (pdfium-engine.cc):
 *  - Single pointer-down records an anchor but does NOT begin selection until
 *    the pointer has moved beyond `minDragDistance`.
 *  - Double-click selects the word around the clicked glyph.
 *  - Triple-click selects the full visual line.
 *  - The marquee handler coordinates via `isTextSelecting` / `hasTextAnchor`
 *    to avoid activating during text selection.
 */
export declare function createTextSelectionHandler(opts: TextSelectionHandlerOptions): PointerEventHandlersWithLifecycle<EmbedPdfPointerEvent>;
