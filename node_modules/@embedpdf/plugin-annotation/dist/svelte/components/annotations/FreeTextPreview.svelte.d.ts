import { Rect } from '@embedpdf/models';
import { FreeTextPreviewData } from '../../../lib/index.ts';
interface FreeTextPreviewProps {
    data: FreeTextPreviewData;
    bounds: Rect;
    scale: number;
}
declare const FreeTextPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<FreeTextPreviewProps, {}, "">;
type FreeTextPreview = ReturnType<typeof FreeTextPreview>;
export default FreeTextPreview;
