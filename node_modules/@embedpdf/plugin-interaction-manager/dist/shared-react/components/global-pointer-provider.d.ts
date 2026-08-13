import { ReactNode, HTMLAttributes, CSSProperties } from '../../react/adapter.ts';
interface GlobalPointerProviderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    documentId: string;
    style?: CSSProperties;
}
export declare const GlobalPointerProvider: ({ children, documentId, style, ...props }: GlobalPointerProviderProps) => import("react/jsx-runtime").JSX.Element;
export {};
