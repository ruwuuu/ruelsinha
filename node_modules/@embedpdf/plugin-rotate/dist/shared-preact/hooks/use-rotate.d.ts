import { Rotation } from '@embedpdf/models';
import { RotatePlugin } from '../../lib/index.ts';
export declare const useRotatePlugin: () => {
    plugin: RotatePlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useRotateCapability: () => {
    provides: Readonly<import('../../lib/index.ts').RotateCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook for rotation state for a specific document
 * @param documentId Document ID
 */
export declare const useRotate: (documentId: string) => {
    rotation: Rotation;
    provides: import('../../lib/index.ts').RotateScope | null;
};
