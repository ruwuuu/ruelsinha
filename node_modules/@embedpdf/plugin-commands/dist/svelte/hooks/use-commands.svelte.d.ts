import { CommandsPlugin, ResolvedCommand } from '../../lib/index.ts';
export declare const useCommandsCapability: () => {
    provides: Readonly<import('../../lib/index.ts').CommandsCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useCommandsPlugin: () => {
    plugin: CommandsPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
interface UseCommandReturn {
    current: ResolvedCommand | null;
}
/**
 * Hook to get a reactive command for a specific document
 * @param getCommandId Function that returns the command ID
 * @param getDocumentId Function that returns the document ID
 */
export declare const useCommand: (getCommandId: () => string, getDocumentId: () => string) => UseCommandReturn;
export {};
