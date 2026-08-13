import { HTMLAttributes, CSSProperties, ReactNode } from '../../react/adapter.ts';
type FullscreenProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
    children: ReactNode;
    style?: CSSProperties;
};
export declare function FullscreenProvider({ children, ...props }: FullscreenProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
