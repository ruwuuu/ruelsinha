import { PdfWidgetAnnoObject } from '@embedpdf/models';
interface RenderWidgetProps {
    pageIndex: number;
    annotation: PdfWidgetAnnoObject;
    scaleFactor?: number;
    renderKey?: number;
    style?: string;
}
declare const RenderWidget: import('svelte', { with: { "resolution-mode": "import" } }).Component<RenderWidgetProps, {}, "">;
type RenderWidget = ReturnType<typeof RenderWidget>;
export default RenderWidget;
