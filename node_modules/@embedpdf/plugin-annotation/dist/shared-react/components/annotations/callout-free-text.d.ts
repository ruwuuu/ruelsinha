import { MouseEvent } from '../../../react/adapter.ts';
import { PdfFreeTextAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib/index.ts';
interface CalloutFreeTextProps {
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent<Element>) => void;
    appearanceActive?: boolean;
}
export declare function CalloutFreeText({ documentId, isSelected, isEditing, annotation, pageIndex, scale, onClick, appearanceActive, }: CalloutFreeTextProps): import("react/jsx-runtime").JSX.Element;
export {};
