import { HTMLAttributes, CSSProperties, ReactNode } from '../../preact/adapter.ts';
type ThumbnailsProps = Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> & {
    /**
     * The ID of the document that this thumbnail pane displays
     */
    documentId: string;
    style?: CSSProperties;
    children: (m: any) => ReactNode;
};
export declare function ThumbnailsPane({ documentId, style, children, ...props }: ThumbnailsProps): import("preact").JSX.Element;
export {};
