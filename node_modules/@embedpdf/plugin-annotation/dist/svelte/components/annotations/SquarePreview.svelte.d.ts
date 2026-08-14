import { Rect } from '@embedpdf/models';
import { SquarePreviewData } from '../../../lib/index.ts';
interface SquarePreviewProps {
    data: SquarePreviewData;
    bounds: Rect;
    scale: number;
}
declare const SquarePreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<SquarePreviewProps, {}, "">;
type SquarePreview = ReturnType<typeof SquarePreview>;
export default SquarePreview;
