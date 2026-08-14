import { ReactNode, HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
import { Position } from '@embedpdf/models';
interface PagePointerProviderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    documentId: string;
    pageIndex: number;
    rotation?: number;
    scale?: number;
    style?: CSSProperties;
    convertEventToPoint?: (event: PointerEvent, element: HTMLElement) => Position;
}
export declare const PagePointerProvider: ({ documentId, pageIndex, children, rotation: rotationOverride, scale: scaleOverride, convertEventToPoint, style, ...props }: PagePointerProviderProps) => import("preact").JSX.Element;
export {};
