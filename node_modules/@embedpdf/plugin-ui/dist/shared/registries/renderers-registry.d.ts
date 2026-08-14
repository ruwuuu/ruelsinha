import { ReactNode } from '../../react/adapter.ts';
import { UIRenderers } from '../types';
export interface RenderersProviderProps {
    children: ReactNode;
    renderers: UIRenderers;
}
export declare function RenderersProvider({ children, renderers }: RenderersProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useRenderers(): UIRenderers;
