import { Rect } from '@embedpdf/models';
import { PolygonPreviewData } from '../../../lib/index.ts';
interface PolygonPreviewProps {
    data: PolygonPreviewData;
    bounds: Rect;
    scale: number;
}
declare const PolygonPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<PolygonPreviewProps, {}, "">;
type PolygonPreview = ReturnType<typeof PolygonPreview>;
export default PolygonPreview;
