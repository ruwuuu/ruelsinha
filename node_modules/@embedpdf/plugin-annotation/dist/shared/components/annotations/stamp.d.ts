import { MouseEvent } from '../../../react/adapter.ts';
import { PdfStampAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../index.ts';
interface StampProps {
    isSelected: boolean;
    annotation: TrackedAnnotation<PdfStampAnnoObject>;
    documentId: string;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}
export declare function Stamp({ isSelected, annotation, documentId, pageIndex, scale, onClick, }: StampProps): import("react/jsx-runtime").JSX.Element;
export {};
