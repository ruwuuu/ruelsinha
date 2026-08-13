import { BasePluginConfig, EventHook } from '@embedpdf/core';
export type PanDefaultMode = 'never' | 'mobile' | 'always';
export interface PanPluginConfig extends BasePluginConfig {
    /** When should pan be the default interaction mode?
     *  – 'never' (default) : pointerMode stays the default
     *  – 'mobile' : default only on touch devices
     *  – 'always' : default on every device           */
    defaultMode?: PanDefaultMode;
}
export interface PanDocumentState {
    isPanMode: boolean;
}
export interface PanState {
    documents: Record<string, PanDocumentState>;
    activeDocumentId: string | null;
}
export interface PanModeChangeEvent {
    documentId: string;
    isPanMode: boolean;
}
export interface PanScope {
    enablePan: () => void;
    disablePan: () => void;
    togglePan: () => void;
    isPanMode: () => boolean;
    onPanModeChange: EventHook<boolean>;
}
export interface PanCapability {
    enablePan: () => void;
    disablePan: () => void;
    togglePan: () => void;
    makePanDefault: (autoActivate?: boolean) => void;
    isPanMode: () => boolean;
    forDocument(documentId: string): PanScope;
    onPanModeChange: EventHook<PanModeChangeEvent>;
}
