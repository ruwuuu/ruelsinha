import { PdfDocumentObject, Rotation } from '@embedpdf/models';
import { PageLayout } from '../index.ts';
export interface RenderPageProps extends PageLayout {
    rotation: Rotation;
    scale: number;
    document: PdfDocumentObject | null;
}
