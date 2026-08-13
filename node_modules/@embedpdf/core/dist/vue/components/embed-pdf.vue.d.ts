import { PluginRegistry, PluginBatchRegistrations, PluginRegistryConfig, DocumentState } from '../../lib/index.ts';
import { Logger, PdfEngine } from '@embedpdf/models';
export type { PluginBatchRegistrations };
type __VLS_Props = {
    engine: PdfEngine;
    /** Registry configuration including logger, permissions, and defaults. */
    config?: PluginRegistryConfig;
    /** @deprecated Use config.logger instead. Will be removed in next major version. */
    logger?: Logger;
    plugins: PluginBatchRegistrations;
    onInitialized?: (registry: PluginRegistry) => Promise<void>;
    autoMountDomElements?: boolean;
};
declare var __VLS_8: {
    registry: PluginRegistry | null;
    coreState: {
        documents: Record<string, DocumentState>;
        documentOrder: string[];
        activeDocumentId: string | null;
        defaultScale: number;
        defaultRotation: import('@embedpdf/models').Rotation;
        globalPermissions?: {
            enforceDocumentPermissions?: boolean | undefined;
            overrides?: {
                4?: boolean | undefined;
                8?: boolean | undefined;
                16?: boolean | undefined;
                32?: boolean | undefined;
                256?: boolean | undefined;
                512?: boolean | undefined;
                1024?: boolean | undefined;
                2048?: boolean | undefined;
                3900?: boolean | undefined;
                print?: boolean | undefined;
                modifyContents?: boolean | undefined;
                copyContents?: boolean | undefined;
                modifyAnnotations?: boolean | undefined;
                fillForms?: boolean | undefined;
                extractForAccessibility?: boolean | undefined;
                assembleDocument?: boolean | undefined;
                printHighQuality?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | null;
    isInitializing: boolean;
    pluginsReady: true;
    activeDocumentId: string | null;
    activeDocument: DocumentState | null;
    documents: Record<string, DocumentState>;
    documentStates: DocumentState[];
}, __VLS_10: {
    registry: PluginRegistry | null;
    coreState: {
        documents: Record<string, DocumentState>;
        documentOrder: string[];
        activeDocumentId: string | null;
        defaultScale: number;
        defaultRotation: import('@embedpdf/models').Rotation;
        globalPermissions?: {
            enforceDocumentPermissions?: boolean | undefined;
            overrides?: {
                4?: boolean | undefined;
                8?: boolean | undefined;
                16?: boolean | undefined;
                32?: boolean | undefined;
                256?: boolean | undefined;
                512?: boolean | undefined;
                1024?: boolean | undefined;
                2048?: boolean | undefined;
                3900?: boolean | undefined;
                print?: boolean | undefined;
                modifyContents?: boolean | undefined;
                copyContents?: boolean | undefined;
                modifyAnnotations?: boolean | undefined;
                fillForms?: boolean | undefined;
                extractForAccessibility?: boolean | undefined;
                assembleDocument?: boolean | undefined;
                printHighQuality?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | null;
    isInitializing: boolean;
    pluginsReady: boolean;
    activeDocumentId: string | null;
    activeDocument: DocumentState | null;
    documents: Record<string, DocumentState>;
    documentStates: DocumentState[];
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_8) => any;
} & {
    default?: (props: typeof __VLS_10) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    autoMountDomElements: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
