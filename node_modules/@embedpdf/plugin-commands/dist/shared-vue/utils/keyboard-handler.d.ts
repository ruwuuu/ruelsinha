import { CommandsCapability } from '../../lib/types';
/**
 * Build a shortcut string from a keyboard event
 * @example Ctrl+Shift+A -> "ctrl+shift+a"
 */
export declare function buildShortcutString(event: KeyboardEvent): string | null;
/**
 * Handle keyboard events and execute commands based on shortcuts
 */
export declare function createKeyDownHandler(commands: CommandsCapability): (event: KeyboardEvent) => void;
