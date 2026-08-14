export * from './hooks';
export * from './components';
export * from '../lib/index.ts';
/**
 * Build a Svelte-flavoured package by adding the Svelte PrintFrame utility.
 * Keeps heavy logic inside the plugin; framework layer just wires the component.
 */
export declare const PrintPluginPackage: import('@embedpdf/core').WithAutoMount<import('@embedpdf/core').PluginPackage<import('../lib/index.ts').PrintPlugin, import('../lib/index.ts').PrintPluginConfig, unknown, import('@embedpdf/core').Action>>;
