import { PdfTextAnnoObject } from '@embedpdf/models';
import { AnnotationRendererProps } from '../../context/types';
declare const TextRenderer: import('svelte', { with: { "resolution-mode": "import" } }).Component<AnnotationRendererProps<PdfTextAnnoObject>, {}, "">;
type TextRenderer = ReturnType<typeof TextRenderer>;
export default TextRenderer;
