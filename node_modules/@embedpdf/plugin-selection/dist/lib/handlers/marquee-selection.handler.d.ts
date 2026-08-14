import { Position, Rect, Size } from '@embedpdf/models';
import { EmbedPdfPointerEvent, PointerEventHandlersWithLifecycle } from '@embedpdf/plugin-interaction-manager';
export interface MarqueeSelectionHandlerOptions {
    /** The page size for clamping */
    pageSize: Size;
    /** Current scale factor for min drag threshold calculation */
    scale: number;
    /** Minimum drag distance in pixels before considering it a marquee (default: 5) */
    minDragPx?: number;
    /** Check if marquee selection is enabled for this mode */
    isEnabled: (modeId: string) => boolean;
    /** Returns whether text selection is currently active (skip marquee if so) */
    isTextSelecting?: () => boolean;
    /** Called when marquee selection begins */
    onBegin: (startPos: Position, modeId: string) => void;
    /** Called during drag with the current marquee rect */
    onChange: (rect: Rect, modeId: string) => void;
    /** Called when marquee selection completes (drag was large enough) */
    onEnd: (rect: Rect, modeId: string) => void;
    /** Called when marquee selection is cancelled (drag too small or cancelled) */
    onCancel: (modeId: string) => void;
}
/**
 * Creates a marquee selection handler that allows users to drag a selection rectangle.
 *
 * This handler is meant to be combined with the text selection handler. When text is hit,
 * the text selection handler sets its selecting state, and this handler checks via
 * `isTextSelecting` to avoid activating during text selection.
 */
export declare function createMarqueeSelectionHandler(opts: MarqueeSelectionHandlerOptions): PointerEventHandlersWithLifecycle<EmbedPdfPointerEvent>;
