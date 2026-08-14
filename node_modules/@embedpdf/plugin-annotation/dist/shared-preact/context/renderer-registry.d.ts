import { ReactNode } from '../../preact/adapter.ts';
import { BoxedAnnotationRenderer } from '../components/types';
type RegisterFn = (entries: BoxedAnnotationRenderer[]) => () => void;
export declare function AnnotationRendererProvider({ children }: {
    children: ReactNode;
}): import("preact").JSX.Element;
/**
 * Hook to register annotation renderers. Handles all registration lifecycle internally.
 * Plugin authors just call this with their renderers array.
 */
export declare function useRegisterRenderers(renderers: BoxedAnnotationRenderer[]): void;
/**
 * Hook to get all registered renderers (for rendering components).
 */
export declare function useRegisteredRenderers(): BoxedAnnotationRenderer[];
/**
 * Low-level hook if someone needs direct access to register function.
 * Most plugins should use useRegisterRenderers instead.
 */
export declare function useRendererRegistry(): RegisterFn | null;
export {};
