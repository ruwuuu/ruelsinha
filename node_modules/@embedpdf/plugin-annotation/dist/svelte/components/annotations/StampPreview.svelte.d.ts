import { Rect } from '@embedpdf/models';
import { StampPreviewData } from '../../../lib/index.ts';
interface StampPreviewProps {
    data: StampPreviewData;
    bounds: Rect;
    scale: number;
}
declare const StampPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<StampPreviewProps, {}, "">;
type StampPreview = ReturnType<typeof StampPreview>;
export default StampPreview;
