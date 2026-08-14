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
/**
 * Hook to get a reactive command for a specific document
 * Automatically updates when command state changes
 * @param commandId Command ID
 * @param documentId Document ID
 * @returns ResolvedCommand or null if not available
 */
export declare const useCommand: (commandId: string, documentId: string) => ResolvedCommand | null;
/**
 * Hook to execute a command
 */
export declare const useCommandExecutor: (documentId: string) => (commandId: string) => void;
