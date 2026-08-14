import { PdfInkAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const InkRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfInkAnnoObject>, {}, "">;
type InkRenderer = ReturnType<typeof InkRenderer>;
export default InkRenderer;
