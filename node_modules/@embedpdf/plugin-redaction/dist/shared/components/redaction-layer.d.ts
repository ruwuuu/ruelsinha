import { Rotation } from '@embedpdf/models';
import { RedactionSelectionMenuRenderFn } from './types';
interface RedactionLayerProps {
    /** The ID of the document this layer belongs to */
    documentId: string;
    /** Index of the page this layer lives on */
    pageIndex: number;
    /** Current render scale for this page */
    scale?: number;
    /** Page rotation (for counter-rotating menus, etc.) */
    rotation?: Rotation;
    /** Optional menu renderer for a selected redaction */
    selectionMenu?: RedactionSelectionMenuRenderFn;
}
export declare const RedactionLayer: ({ documentId, pageIndex, scale, rotation, selectionMenu, }: RedactionLayerProps) => import("react/jsx-runtime").JSX.Element;
export {};
