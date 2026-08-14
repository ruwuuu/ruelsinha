import { Rect, Rotation } from '@embedpdf/models';
import { ReactNode, CSSProperties } from '../../preact/adapter.ts';
interface CounterRotateProps {
    rect: Rect;
    rotation: Rotation;
}
export interface MenuWrapperProps {
    style: CSSProperties;
    ref: (el: HTMLDivElement | null) => void;
}
interface CounterRotateComponentProps extends CounterRotateProps {
    children: (props: {
        matrix: string;
        rect: Rect;
        menuWrapperProps: MenuWrapperProps;
    }) => ReactNode;
}
export declare function CounterRotate({ children, ...props }: CounterRotateComponentProps): import("preact").JSX.Element;
export {};
