import { ReactNode } from '../../preact/adapter.ts';
import { PluginBatchRegistration, IPlugin } from '../../lib/index.ts';
interface AutoMountProps {
    plugins: PluginBatchRegistration<IPlugin<any>, any>[];
    children: ReactNode;
}
export declare function AutoMount({ plugins, children }: AutoMountProps): import("preact").JSX.Element;
export {};
