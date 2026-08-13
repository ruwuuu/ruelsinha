import { Rect } from '@embedpdf/models';
import { CirclePreviewData } from '../../../lib/index.ts';
interface CirclePreviewProps {
    data: CirclePreviewData;
    bounds: Rect;
    scale: number;
}
declare const CirclePreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<CirclePreviewProps, {}, "">;
type CirclePreview = ReturnType<typeof CirclePreview>;
export default CirclePreview;
