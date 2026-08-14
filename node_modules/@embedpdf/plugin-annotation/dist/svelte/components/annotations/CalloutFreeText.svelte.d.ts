import { PdfFreeTextAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib/index.ts';
interface CalloutFreeTextProps {
    documentId: string;
    isSelected: boolean;
    isEditing: boolean;
    annotation: TrackedAnnotation<PdfFreeTextAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent) => void;
    appearanceActive?: boolean;
}
declare const CalloutFreeText: import('svelte', { with: { "resolution-mode": "import" } }).Component<CalloutFreeTextProps, {}, "">;
type CalloutFreeText = ReturnType<typeof CalloutFreeText>;
export default CalloutFreeText;
