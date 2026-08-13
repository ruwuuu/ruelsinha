import { MouseEvent } from '../../../preact/adapter.ts';
import { PdfFreeTextAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib/index.ts';
interface FreeTextProps {
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void;
    /** When true, AP canvas provides the visual; hide text content */
    appearanceActive?: boolean;
}
export declare function FreeText({ documentId, isSelected, isEditing, annotation, pageIndex, scale, onClick, appearanceActive, }: FreeTextProps): import("preact").JSX.Element;
export {};
