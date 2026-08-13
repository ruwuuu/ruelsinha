import { Rotation } from '@embedpdf/models';
import { TextSelectionStyle, MarqueeSelectionStyle } from '../../lib/index.ts';
import { SelectionSelectionMenuRenderFn } from '../types';
type Props = {
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: Rotation;
    /**
     * @deprecated Use `textStyle.background` instead.
     */
    background?: string;
    /** Styling options for text selection highlights */
    textStyle?: TextSelectionStyle;
    /** Styling options for the marquee selection rectangle */
    marqueeStyle?: MarqueeSelectionStyle;
    /** Optional CSS class applied to the marquee rectangle */
    marqueeClassName?: string;
    selectionMenu?: SelectionSelectionMenuRenderFn;
};
/**
 * SelectionLayer is a convenience component that composes both text selection
 * and marquee selection on a single page.
 *
 * For advanced use cases, you can use `TextSelection` and `MarqueeSelection`
 * individually.
 */
export declare function SelectionLayer({ documentId, pageIndex, scale, rotation, background, textStyle, marqueeStyle, marqueeClassName, selectionMenu, }: Props): import("preact").JSX.Element;
export {};
