import { ReactNode } from '../../react/adapter.ts';
import { PluginBatchRegistration, IPlugin } from '../../index.ts';
interface AutoMountProps {
    plugins: PluginBatchRegistration<IPlugin<any>, any>[];
    children: ReactNode;
}
export declare function AutoMount({ plugins, children }: AutoMountProps): import("react/jsx-runtime").JSX.Element;
export {};
