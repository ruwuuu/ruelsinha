import { Snippet } from 'svelte';
import { HTMLAttributes } from 'svelte/elements';
type ZoomGestureWrapperProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    documentId: string;
    children: Snippet;
    class?: string;
    /** Enable pinch-to-zoom gesture (default: true) */
    enablePinch?: boolean;
    /** Enable wheel zoom with ctrl/cmd key (default: true) */
    enableWheel?: boolean;
};
declare const ZoomGestureWrapper: import('svelte', { with: { "resolution-mode": "import" } }).Component<ZoomGestureWrapperProps, {}, "">;
type ZoomGestureWrapper = ReturnType<typeof ZoomGestureWrapper>;
export default ZoomGestureWrapper;
