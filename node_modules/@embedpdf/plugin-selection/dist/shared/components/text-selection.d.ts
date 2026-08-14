import { Rotation } from '@embedpdf/models';
import { SelectionSelectionMenuRenderFn } from '../types';
type TextSelectionProps = {
    documentId: string;
    pageIndex: number;
    scale?: number;
    rotation?: Rotation;
    /** Background color for text selection highlights. Default: 'rgba(33,150,243)' */
    background?: string;
    selectionMenu?: SelectionSelectionMenuRenderFn;
};
/**
 * TextSelection renders text selection highlight rects and the selection menu.
 * It registers the text selection handler on the page and subscribes to menu
 * placement changes.
 *
 * Use this component directly for advanced cases, or use `SelectionLayer`
 * which composes both `TextSelection` and `MarqueeSelection`.
 */
export declare function TextSelection({ documentId, pageIndex, scale: scaleOverride, rotation: rotationOverride, background, selectionMenu, }: TextSelectionProps): import("react/jsx-runtime").JSX.Element | null;
export {};
