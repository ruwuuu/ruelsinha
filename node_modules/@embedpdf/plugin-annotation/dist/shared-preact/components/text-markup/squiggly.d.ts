import { CSSProperties, MouseEvent } from '../../../preact/adapter.ts';
import { Rect } from '@embedpdf/models';
type SquigglyProps = {
    /** Stroke/markup color */
    strokeColor?: string;
    opacity?: number;
    segmentRects: Rect[];
    rect?: Rect;
    scale: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    style?: CSSProperties;
    /** When true, AP image provides the visual; only render hit area */
    appearanceActive?: boolean;
};
export declare function Squiggly({ strokeColor, opacity, segmentRects, rect, scale, onClick, style, appearanceActive, }: SquigglyProps): import("preact").JSX.Element;
export {};
