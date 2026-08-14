import { ReactNode, HTMLAttributes } from '../../react/adapter.ts';
type ViewportProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    /**
     * The ID of the document that this viewport displays
     */
    documentId: string;
};
export declare function Viewport({ children, documentId, ...props }: ViewportProps): import("react/jsx-runtime").JSX.Element;
export {};
