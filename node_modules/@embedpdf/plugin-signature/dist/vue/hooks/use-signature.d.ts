import { SignaturePlugin, SignatureEntry, ActivePlacementInfo } from '../../lib/index.ts';
import { MaybeRefOrGetter } from 'vue';
export declare const useSignaturePlugin: () => import('@embedpdf/core/vue').PluginState<SignaturePlugin>;
export declare const useSignatureCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').SignatureCapability>>;
export declare const useSignatureEntries: () => {
    entries: import('vue').Ref<{
        id: string;
        createdAt: number;
        signature: {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Draw;
            inkData: {
                inkList: {
                    points: {
                        x: number;
                        y: number;
                    }[];
                }[];
                strokeWidth: number;
                strokeColor: string;
                size: {
                    width: number;
                    height: number;
                };
            };
            label?: string | undefined;
            previewDataUrl: string;
        } | {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Type | import("@embedpdf/plugin-signature").SignatureCreationType.Upload;
            imageMimeType?: string | undefined;
            imageSize?: {
                width: number;
                height: number;
            } | undefined;
            imageData?: {
                readonly byteLength: number;
                slice: (begin?: number, end?: number) => ArrayBuffer;
                readonly maxByteLength: number;
                readonly resizable: boolean;
                resize: (newByteLength?: number) => void;
                readonly detached: boolean;
                transfer: (newByteLength?: number) => ArrayBuffer;
                transferToFixedLength: (newByteLength?: number) => ArrayBuffer;
                readonly [Symbol.toStringTag]: "ArrayBuffer";
            } | undefined;
            label?: string | undefined;
            previewDataUrl: string;
        };
        initials?: {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Draw;
            inkData: {
                inkList: {
                    points: {
                        x: number;
                        y: number;
                    }[];
                }[];
                strokeWidth: number;
                strokeColor: string;
                size: {
                    width: number;
                    height: number;
                };
            };
            label?: string | undefined;
            previewDataUrl: string;
        } | {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Type | import("@embedpdf/plugin-signature").SignatureCreationType.Upload;
            imageMimeType?: string | undefined;
            imageSize?: {
                width: number;
                height: number;
            } | undefined;
            imageData?: {
                readonly byteLength: number;
                slice: (begin?: number, end?: number) => ArrayBuffer;
                readonly maxByteLength: number;
                readonly resizable: boolean;
                resize: (newByteLength?: number) => void;
                readonly detached: boolean;
                transfer: (newByteLength?: number) => ArrayBuffer;
                transferToFixedLength: (newByteLength?: number) => ArrayBuffer;
                readonly [Symbol.toStringTag]: "ArrayBuffer";
            } | undefined;
            label?: string | undefined;
            previewDataUrl: string;
        } | undefined;
    }[], SignatureEntry[] | {
        id: string;
        createdAt: number;
        signature: {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Draw;
            inkData: {
                inkList: {
                    points: {
                        x: number;
                        y: number;
                    }[];
                }[];
                strokeWidth: number;
                strokeColor: string;
                size: {
                    width: number;
                    height: number;
                };
            };
            label?: string | undefined;
            previewDataUrl: string;
        } | {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Type | import("@embedpdf/plugin-signature").SignatureCreationType.Upload;
            imageMimeType?: string | undefined;
            imageSize?: {
                width: number;
                height: number;
            } | undefined;
            imageData?: {
                readonly byteLength: number;
                slice: (begin?: number, end?: number) => ArrayBuffer;
                readonly maxByteLength: number;
                readonly resizable: boolean;
                resize: (newByteLength?: number) => void;
                readonly detached: boolean;
                transfer: (newByteLength?: number) => ArrayBuffer;
                transferToFixedLength: (newByteLength?: number) => ArrayBuffer;
                readonly [Symbol.toStringTag]: "ArrayBuffer";
            } | undefined;
            label?: string | undefined;
            previewDataUrl: string;
        };
        initials?: {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Draw;
            inkData: {
                inkList: {
                    points: {
                        x: number;
                        y: number;
                    }[];
                }[];
                strokeWidth: number;
                strokeColor: string;
                size: {
                    width: number;
                    height: number;
                };
            };
            label?: string | undefined;
            previewDataUrl: string;
        } | {
            creationType: import("@embedpdf/plugin-signature").SignatureCreationType.Type | import("@embedpdf/plugin-signature").SignatureCreationType.Upload;
            imageMimeType?: string | undefined;
            imageSize?: {
                width: number;
                height: number;
            } | undefined;
            imageData?: {
                readonly byteLength: number;
                slice: (begin?: number, end?: number) => ArrayBuffer;
                readonly maxByteLength: number;
                readonly resizable: boolean;
                resize: (newByteLength?: number) => void;
                readonly detached: boolean;
                transfer: (newByteLength?: number) => ArrayBuffer;
                transferToFixedLength: (newByteLength?: number) => ArrayBuffer;
                readonly [Symbol.toStringTag]: "ArrayBuffer";
            } | undefined;
            label?: string | undefined;
            previewDataUrl: string;
        } | undefined;
    }[]>;
};
export declare const useActivePlacement: (documentId: MaybeRefOrGetter<string>) => import('vue').Ref<{
    entryId: string;
    kind: import('../../lib/index.ts').SignatureFieldKind;
} | null, ActivePlacementInfo | {
    entryId: string;
    kind: import('../../lib/index.ts').SignatureFieldKind;
} | null>;
