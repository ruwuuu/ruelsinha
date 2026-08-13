import { HistoryPlugin } from '../../index.ts';
export declare const useHistoryPlugin: () => {
    plugin: HistoryPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useHistoryCapability: () => {
    provides: Readonly<import('../../index.ts').HistoryCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
