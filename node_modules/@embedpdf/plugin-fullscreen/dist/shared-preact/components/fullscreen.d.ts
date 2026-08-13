import { HTMLAttributes, CSSProperties, ReactNode } from '../../preact/adapter.ts';
type FullscreenProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    children: ReactNode;
    style?: CSSProperties;
};
export declare function FullscreenProvider({ children, ...props }: FullscreenProviderProps): import("preact").JSX.Element;
export {};
