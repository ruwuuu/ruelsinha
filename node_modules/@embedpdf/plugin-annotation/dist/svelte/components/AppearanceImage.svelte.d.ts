import { AnnotationAppearanceImage } from '@embedpdf/models';
interface Props {
    appearance: AnnotationAppearanceImage<Blob>;
    style?: string;
}
declare const AppearanceImage: import('svelte', { with: { "resolution-mode": "import" } }).Component<Props, {}, "">;
type AppearanceImage = ReturnType<typeof AppearanceImage>;
export default AppearanceImage;
