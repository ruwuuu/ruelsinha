import { MaybeRefOrGetter } from 'vue';
import { CommandsPlugin } from '../../lib/index.ts';
export declare const useCommandsCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').CommandsCapability>>;
export declare const useCommandsPlugin: () => import('@embedpdf/core/vue').PluginState<CommandsPlugin>;
/**
 * Hook to get a reactive command for a specific document
 * @param commandId Command ID (can be ref, computed, getter, or plain value)
 * @param documentId Document ID (can be ref, computed, getter, or plain value)
 */
export declare const useCommand: (commandId: MaybeRefOrGetter<string>, documentId: MaybeRefOrGetter<string>) => Readonly<import('vue').Ref<{
    readonly id: string;
    readonly label: string;
    readonly icon?: string | undefined;
    readonly iconProps?: {
        readonly primaryColor?: string | undefined;
        readonly secondaryColor?: string | undefined;
        readonly className?: string | undefined;
        readonly title?: string | undefined;
    } | undefined;
    readonly active: boolean;
    readonly disabled: boolean;
    readonly visible: boolean;
    readonly shortcuts?: readonly string[] | undefined;
    readonly shortcutLabel?: string | undefined;
    readonly categories?: readonly string[] | undefined;
    readonly description?: string | undefined;
    readonly execute: () => void;
} | null, {
    readonly id: string;
    readonly label: string;
    readonly icon?: string | undefined;
    readonly iconProps?: {
        readonly primaryColor?: string | undefined;
        readonly secondaryColor?: string | undefined;
        readonly className?: string | undefined;
        readonly title?: string | undefined;
    } | undefined;
    readonly active: boolean;
    readonly disabled: boolean;
    readonly visible: boolean;
    readonly shortcuts?: readonly string[] | undefined;
    readonly shortcutLabel?: string | undefined;
    readonly categories?: readonly string[] | undefined;
    readonly description?: string | undefined;
    readonly execute: () => void;
} | null>>;
