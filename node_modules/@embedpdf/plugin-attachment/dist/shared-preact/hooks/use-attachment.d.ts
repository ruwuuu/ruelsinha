import { AttachmentPlugin } from '../../lib/index.ts';
export declare const useAttachmentPlugin: () => {
    plugin: AttachmentPlugin | null;
    isLoading: boolean;
    ready: Promise<void>;
};
export declare const useAttachmentCapability: () => {
    provides: Readonly<import('../../lib/index.ts').AttachmentCapability> | null;
    isLoading: boolean;
    ready: Promise<void>;
};
