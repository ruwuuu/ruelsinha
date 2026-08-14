import { SelectionPlugin } from '../../lib/index.ts';
export declare const useSelectionCapability: () => {
    provides: Readonly<import('../../lib/index.ts').SelectionCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useSelectionPlugin: () => {
    plugin: SelectionPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
