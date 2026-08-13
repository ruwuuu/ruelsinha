import { Rect } from '@embedpdf/models';
import { FreeTextPreviewData } from '../../../lib/index.ts';
interface CalloutFreeTextPreviewProps {
    data: FreeTextPreviewData;
    bounds: Rect;
    scale: number;
}
declare const CalloutFreeTextPreview: import('svelte', { with: { "resolution-mode": "import" } }).Component<CalloutFreeTextPreviewProps, {}, "">;
type CalloutFreeTextPreview = ReturnType<typeof CalloutFreeTextPreview>;
export default CalloutFreeTextPreview;
