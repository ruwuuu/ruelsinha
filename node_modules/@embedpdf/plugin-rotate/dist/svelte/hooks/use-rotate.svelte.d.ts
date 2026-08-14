import { Rotation } from '@embedpdf/models';
import { RotatePlugin, RotateScope } from '../../lib/index.ts';
/**
 * Hook to get the raw rotate plugin instance.
 */
export declare const useRotatePlugin: () => {
    plugin: RotatePlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
/**
 * Hook to get the rotate plugin's capability API.
 * This provides methods for rotating the document.
 */
export declare const useRotateCapability: () => {
    provides: Readonly<import('../../lib/index.ts').RotateCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseRotateReturn {
    provides: RotateScope | null;
    rotation: Rotation;
}
/**
 * Hook that provides reactive rotation state and methods for a specific document.
 * @param getDocumentId Function that returns the document ID
 */
export declare const useRotate: (getDocumentId: () => string | null) => UseRotateReturn;
export {};
