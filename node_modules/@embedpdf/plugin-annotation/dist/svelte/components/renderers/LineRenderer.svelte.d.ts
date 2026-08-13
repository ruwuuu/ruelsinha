import { PdfLineAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const LineRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfLineAnnoObject>, {}, "">;
type LineRenderer = ReturnType<typeof LineRenderer>;
export default LineRenderer;
