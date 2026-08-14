import { PdfFreeTextAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib/index.ts';
interface FreeTextProps {
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    onDoubleClick?: (e: MouseEvent) => void;
    appearanceActive?: boolean;
}
declare const FreeText: import('svelte', { with: { "resolution-mode": "import" } }).Component<FreeTextProps, {}, "">;
type FreeText = ReturnType<typeof FreeText>;
export default FreeText;
