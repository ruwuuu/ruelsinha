import { ReactNode, HTMLAttributes } from '../../preact/adapter.ts';
type ViewportProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    /**
     * The ID of the document that this viewport displays
     */
    documentId: string;
};
export declare function Viewport({ children, documentId, ...props }: ViewportProps): import("preact").JSX.Element;
export {};
