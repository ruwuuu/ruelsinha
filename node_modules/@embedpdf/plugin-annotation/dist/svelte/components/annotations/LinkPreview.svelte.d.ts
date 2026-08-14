import { Rect } from '@embedpdf/models';
import { LinkPreviewData } from '../../../lib/index.ts';
interface LinkPreviewProps {
    data: LinkPreviewData;
    bounds: Rect;
    scale: number;
}
declare const LinkPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<LinkPreviewProps, {}, "">;
type LinkPreview = ReturnType<typeof LinkPreview>;
export default LinkPreview;
