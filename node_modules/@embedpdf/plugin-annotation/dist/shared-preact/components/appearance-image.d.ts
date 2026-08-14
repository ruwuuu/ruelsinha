import { AnnotationAppearanceImage } from '@embedpdf/models';
import { CSSProperties } from '../../preact/adapter.ts';
interface AppearanceImageProps {
    appearance: AnnotationAppearanceImage<Blob>;
    style?: CSSProperties;
}
/**
 * Renders a pre-rendered annotation appearance stream image as an img URL.
 * Purely visual -- pointer events are always disabled; hit-area SVG handles interaction.
 */
export declare function AppearanceImage({ appearance, style }: AppearanceImageProps): import("preact").JSX.Element | null;
export {};
