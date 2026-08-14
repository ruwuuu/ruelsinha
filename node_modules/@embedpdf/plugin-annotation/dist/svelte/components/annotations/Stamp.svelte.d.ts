import { PdfStampAnnoObject } from '@embedpdf/models';
import { TrackedAnnotation } from '../../../lib/index.ts';
interface StampProps {
    documentId: string;
    isSelected: boolean;
    annotation: TrackedAnnotation<PdfStampAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick?: (e: MouseEvent) => void;
}
declare const Stamp: import('svelte', { with: { "resolution-mode": "import" } }).Component<StampProps, {}, "">;
type Stamp = ReturnType<typeof Stamp>;
export default Stamp;
