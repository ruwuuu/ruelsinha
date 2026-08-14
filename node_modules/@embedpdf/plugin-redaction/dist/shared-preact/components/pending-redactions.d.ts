import { RedactionSelectionMenuRenderFn } from './types';
import { Rotation } from '@embedpdf/models';
interface PendingRedactionsProps {
    documentId: string;
    pageIndex: number;
    scale: number;
    rotation: Rotation;
    bboxStroke?: string;
    selectionMenu?: RedactionSelectionMenuRenderFn;
}
export declare function PendingRedactions({ documentId, pageIndex, scale, bboxStroke, rotation, selectionMenu, }: PendingRedactionsProps): import("preact").JSX.Element | null;
export {};
