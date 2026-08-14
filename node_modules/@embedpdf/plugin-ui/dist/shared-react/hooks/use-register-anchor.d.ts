/**
 * Register a DOM element as an anchor for menus
 *
 * @param documentId - Document ID
 * @param itemId - Item ID (typically matches the toolbar/menu item ID)
 * @returns Ref callback to attach to the element
 *
 * @example
 * ```tsx
 * function ZoomButton({ documentId }: Props) {
 *   const anchorRef = useRegisterAnchor(documentId, 'zoom-button');
 *
 *   return <button ref={anchorRef}>Zoom</button>;
 * }
 * ```
 */
export declare function useRegisterAnchor(documentId: string, itemId: string): (element: HTMLElement | null) => void;
