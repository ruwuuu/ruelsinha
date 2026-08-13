import { CSSProperties, MouseEvent } from '../../../react/adapter.ts';
import { Rect } from '@embedpdf/models';
type StrikeoutProps = {
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
export declare function Strikeout({ strokeColor, opacity, segmentRects, rect, scale, onClick, style, appearanceActive, }: StrikeoutProps): import("react/jsx-runtime").JSX.Element;
export {};
