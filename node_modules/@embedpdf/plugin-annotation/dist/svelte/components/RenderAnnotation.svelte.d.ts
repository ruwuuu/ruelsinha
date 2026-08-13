import { PdfAnnotationObject } from '@embedpdf/models';
import { HTMLImgAttributes } from 'svelte/elements';
interface RenderAnnotationProps extends Omit<HTMLImgAttributes, 'style'> {
    documentId: string;
    pageIndex: number;
    annotation: PdfAnnotationObject;
    scaleFactor?: number;
    dpr?: number;
    unrotated?: boolean;
    style?: Record<string, string | number | undefined>;
}
declare const RenderAnnotation: import('svelte', { with: { "resolution-mode": "import" } }).Component<RenderAnnotationProps, {}, "">;
type RenderAnnotation = ReturnType<typeof RenderAnnotation>;
export default RenderAnnotation;
