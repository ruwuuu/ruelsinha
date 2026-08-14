import { PdfSquigglyAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const SquigglyRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfSquigglyAnnoObject>, {}, "">;
type SquigglyRenderer = ReturnType<typeof SquigglyRenderer>;
export default SquigglyRenderer;
