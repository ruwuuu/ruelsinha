import { ReactNode, HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
type ZoomGestureWrapperProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    children: ReactNode;
    documentId: string;
    style?: CSSProperties;
    /** Enable pinch-to-zoom gesture (default: true) */
    enablePinch?: boolean;
    /** Enable wheel zoom with ctrl/cmd key (default: true) */
    enableWheel?: boolean;
};
export declare function ZoomGestureWrapper({ children, documentId, style, enablePinch, enableWheel, ...props }: ZoomGestureWrapperProps): import("preact").JSX.Element;
export {};
