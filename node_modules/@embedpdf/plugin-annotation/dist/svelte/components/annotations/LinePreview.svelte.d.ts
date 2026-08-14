import { Rect } from '@embedpdf/models';
import { LinePreviewData } from '../../../lib/index.ts';
interface LinePreviewProps {
    data: LinePreviewData;
    bounds: Rect;
    scale: number;
}
declare const LinePreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<LinePreviewProps, {}, "">;
type LinePreview = ReturnType<typeof LinePreview>;
export default LinePreview;
