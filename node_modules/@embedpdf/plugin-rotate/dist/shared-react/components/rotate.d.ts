import { ReactNode, HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
import { Rotation } from '@embedpdf/models';
type RotateProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    children: ReactNode;
    documentId: string;
    pageIndex: number;
    rotation?: Rotation;
    scale?: number;
    style?: CSSProperties;
};
export declare function Rotate({ children, documentId, pageIndex, rotation: rotationOverride, scale: scaleOverride, style, ...props }: RotateProps): import("react/jsx-runtime").JSX.Element | null;
export {};
