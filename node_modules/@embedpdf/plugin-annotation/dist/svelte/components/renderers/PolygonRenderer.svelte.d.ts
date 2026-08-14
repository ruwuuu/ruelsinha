import { PdfPolygonAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const PolygonRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfPolygonAnnoObject>, {}, "">;
type PolygonRenderer = ReturnType<typeof PolygonRenderer>;
export default PolygonRenderer;
