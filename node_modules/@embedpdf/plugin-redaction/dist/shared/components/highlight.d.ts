import { HTMLAttributes, CSSProperties, MouseEvent } from '../../react/adapter.ts';
import { Rect } from '@embedpdf/models';
type HighlightProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    color?: string;
    opacity?: number;
    border?: string;
    rects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    style?: CSSProperties;
};
export declare function Highlight({ color, opacity, border, rects, rect, scale, onClick, style, ...props }: HighlightProps): import("react/jsx-runtime").JSX.Element;
export {};
