import { PdfStampAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const StampRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfStampAnnoObject>, {}, "">;
type StampRenderer = ReturnType<typeof StampRenderer>;
export default StampRenderer;
