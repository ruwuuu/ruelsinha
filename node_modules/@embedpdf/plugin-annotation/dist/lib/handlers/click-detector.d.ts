import { PdfAnnotationObject } from '@embedpdf/models';
import { AnnotationTool } from '../tools/types';
interface ClickDetectorOptions<T extends PdfAnnotationObject> {
    threshold?: number;
    getTool: () => AnnotationTool<T> | undefined;
    onClickDetected: (pos: {
        x: number;
        y: number;
    }, tool: AnnotationTool<T>) => void;
}
export declare function useClickDetector<T extends PdfAnnotationObject>({ threshold, getTool, onClickDetected, }: ClickDetectorOptions<T>): {
    onStart: (pos: {
        x: number;
        y: number;
    }) => void;
    onMove: (pos: {
        x: number;
        y: number;
    }) => void;
    onEnd: (pos: {
        x: number;
        y: number;
    }) => void;
    hasMoved: () => boolean;
    reset: () => void;
};
export {};
