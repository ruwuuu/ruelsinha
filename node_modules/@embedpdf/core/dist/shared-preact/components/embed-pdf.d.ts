import { ReactNode } from '../../preact/adapter.ts';
import { Logger, PdfEngine } from '@embedpdf/models';
import { PluginRegistry, PluginRegistryConfig, PluginBatchRegistrations } from '../../lib/index.ts';
import { PDFContextState } from '../context';
export type { PluginBatchRegistrations };
interface EmbedPDFProps {
    /**
     * The PDF engine to use for the PDF viewer.
     */
    engine: PdfEngine;
    /**
     * Registry configuration including logger, permissions, and defaults.
     */
    config?: PluginRegistryConfig;
    /**
     * @deprecated Use config.logger instead. Will be removed in next major version.
     */
    logger?: Logger;
    /**
     * The callback to call when the PDF viewer is initialized.
     */
    onInitialized?: (registry: PluginRegistry) => Promise<void>;
    /**
     * The plugins to use for the PDF viewer.
     */
    plugins: PluginBatchRegistrations;
    /**
     * The children to render for the PDF viewer.
     */
    children: ReactNode | ((state: PDFContextState) => ReactNode);
    /**
     * Whether to auto-mount specific non-visual DOM elements from plugins.
     * @default true
     */
    autoMountDomElements?: boolean;
}
export declare function EmbedPDF({ engine, config, logger, onInitialized, plugins, children, autoMountDomElements, }: EmbedPDFProps): import("preact").JSX.Element;
