import { Logger, PdfEngine } from '@embedpdf/models';
import { PluginBatchRegistrations, PluginRegistryConfig, PluginRegistry } from '../../lib/index.ts';
import { Snippet } from 'svelte';
import { PDFContextState } from '../hooks';
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
    children: Snippet<[PDFContextState]>;
    /**
     * Whether to auto-mount specific non-visual DOM elements from plugins.
     * @default true
     */
    autoMountDomElements?: boolean;
}
declare const EmbedPDF: import('svelte', { with: { "resolution-mode": "import" } }).Component<EmbedPDFProps, {
    PluginBatchRegistrations: typeof PluginBatchRegistrations;
}, "">;
type EmbedPDF = ReturnType<typeof EmbedPDF>;
export default EmbedPDF;
