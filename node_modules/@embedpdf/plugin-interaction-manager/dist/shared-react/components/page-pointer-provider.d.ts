import { ReactNode, HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
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
export declare const PagePointerProvider: ({ documentId, pageIndex, children, rotation: rotationOverride, scale: scaleOverride, convertEventToPoint, style, ...props }: PagePointerProviderProps) => import("react/jsx-runtime").JSX.Element;
export {};
