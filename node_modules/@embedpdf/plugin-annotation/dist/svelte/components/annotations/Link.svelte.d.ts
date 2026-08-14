import { PdfAnnotationBorderStyle, Rect } from '@embedpdf/models';
interface LinkProps {
    /** Whether the annotation is selected */
    isSelected: boolean;
    /** Stroke colour – defaults to blue when omitted */
    strokeColor?: string;
    /** Stroke width in PDF units */
    strokeWidth?: number;
    /** Stroke type – defaults to underline when omitted */
    strokeStyle?: PdfAnnotationBorderStyle;
    /** Stroke dash array – for dashed style */
    strokeDashArray?: number[];
    /** Bounding box of the annotation (PDF units) */
    rect: Rect;
    /** Current page zoom factor */
    scale: number;
    /** Click handler (used for selection) */
    onClick?: (e: MouseEvent) => void;
    /** Whether this link has an IRT (In Reply To) reference - disables direct interaction */
    hasIRT?: boolean;
}
declare const Link: import('svelte', { with: { "resolution-mode": "import" } }).Component<LinkProps, {}, "">;
type Link = ReturnType<typeof Link>;
export default Link;
