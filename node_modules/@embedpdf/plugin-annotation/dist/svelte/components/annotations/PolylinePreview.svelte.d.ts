import { Rect } from '@embedpdf/models';
import { PolylinePreviewData } from '../../../lib/index.ts';
interface PolylinePreviewProps {
    data: PolylinePreviewData;
    bounds: Rect;
    scale: number;
}
declare const PolylinePreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<PolylinePreviewProps, {}, "">;
type PolylinePreview = ReturnType<typeof PolylinePreview>;
export default PolylinePreview;
