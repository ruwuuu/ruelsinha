import { ReactNode, HTMLAttributes, CSSProperties } from '../../preact/adapter.ts';
interface GlobalPointerProviderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    documentId: string;
    style?: CSSProperties;
}
export declare const GlobalPointerProvider: ({ children, documentId, style, ...props }: GlobalPointerProviderProps) => import("preact").JSX.Element;
export {};
