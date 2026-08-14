import { ReactNode, HTMLAttributes } from '../react/adapter.ts';
interface UIRootProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
/**
 * Internal component that handles:
 * 1. Injecting the generated stylesheet (into shadow root or document.head)
 * 2. Managing the data-disabled-categories attribute
 * 3. Updating styles on locale changes
 */
export declare function UIRoot({ children, style, ...restProps }: UIRootProps): import("react/jsx-runtime").JSX.Element;
export {};
