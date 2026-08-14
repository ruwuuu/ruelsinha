import { Rect } from '@embedpdf/models';
import { InkPreviewData } from '../../../lib/index.ts';
interface InkPreviewProps {
    data: InkPreviewData;
    bounds: Rect;
    scale: number;
}
declare const InkPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<InkPreviewProps, {}, "">;
type InkPreview = ReturnType<typeof InkPreview>;
export default InkPreview;
