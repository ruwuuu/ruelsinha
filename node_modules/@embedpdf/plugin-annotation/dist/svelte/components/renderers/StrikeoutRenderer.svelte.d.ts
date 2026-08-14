import { PdfStrikeOutAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const StrikeoutRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfStrikeOutAnnoObject>, {}, "">;
type StrikeoutRenderer = ReturnType<typeof StrikeoutRenderer>;
export default StrikeoutRenderer;
