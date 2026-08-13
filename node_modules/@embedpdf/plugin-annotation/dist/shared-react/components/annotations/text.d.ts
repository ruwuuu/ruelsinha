import { MouseEvent } from '../../../react/adapter.ts';
interface TextProps {
    isSelected: boolean;
    color?: string;
    opacity?: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    appearanceActive?: boolean;
}
/**
 * Renders a fallback sticky-note icon for PDF Text annotations when no
 * appearance stream image is available.
 */
export declare function Text({ isSelected, color, opacity, onClick, appearanceActive, }: TextProps): JSX.Element;
export {};
