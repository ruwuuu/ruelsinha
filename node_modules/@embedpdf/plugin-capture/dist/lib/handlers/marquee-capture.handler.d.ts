import { Rect, Size } from '@embedpdf/models';
import { EmbedPdfPointerEvent, PointerEventHandlersWithLifecycle } from '@embedpdf/plugin-interaction-manager';
export declare function createMarqueeHandler(opts: {
    pageSize: Size;
    scale: number;
    minDragPx?: number;
    onPreview?: (rect: Rect | null) => void;
    onCommit?: (rect: Rect) => void;
}): PointerEventHandlersWithLifecycle<EmbedPdfPointerEvent>;
