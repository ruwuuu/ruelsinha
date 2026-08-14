import { ReactNode } from '../../preact/adapter.ts';
import { UIRenderers } from '../types';
export interface RenderersProviderProps {
    children: ReactNode;
    renderers: UIRenderers;
}
export declare function RenderersProvider({ children, renderers }: RenderersProviderProps): import("preact").JSX.Element;
export declare function useRenderers(): UIRenderers;
