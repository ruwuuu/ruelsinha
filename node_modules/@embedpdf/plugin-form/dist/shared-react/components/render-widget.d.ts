import { HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
import { PdfWidgetAnnoObject } from '@embedpdf/models';
type RenderWidgetProps = Omit<HTMLAttributes<HTMLImageElement>, 'style'> & {
    pageIndex: number;
    annotation: PdfWidgetAnnoObject;
    scaleFactor?: number;
    dpr?: number;
    renderKey?: number;
    style?: CSSProperties;
};
export declare function RenderWidget({ pageIndex, annotation, scaleFactor, renderKey, style, ...props }: RenderWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
