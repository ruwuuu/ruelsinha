import { StampPlugin, StampLibrary, ResolvedStamp, ActiveStampInfo } from '../../lib/index.ts';
import { MaybeRefOrGetter } from 'vue';
export declare const useStampPlugin: () => import('@embedpdf/core/vue').PluginState<StampPlugin>;
export declare const useStampCapability: () => import('@embedpdf/core/vue').CapabilityState<Readonly<import('../../lib/index.ts').StampCapability>>;
export declare const useStampLibraries: () => {
    libraries: import('vue').Ref<{
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    }[], StampLibrary[] | {
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    }[]>;
};
export declare const useStampsByCategory: (category: MaybeRefOrGetter<string>) => import('vue').Ref<{
    library: {
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    };
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
}[], ResolvedStamp[] | {
    library: {
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    };
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
}[]>;
export declare const useStampsByLibrary: (libraryId: MaybeRefOrGetter<string | undefined>, category?: MaybeRefOrGetter<string | undefined>) => import('vue').Ref<{
    library: {
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    };
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
}[], ResolvedStamp[] | {
    library: {
        id: string;
        name: string;
        nameKey?: string | undefined;
        document: {
            id: string;
            pageCount: number;
            pages: {
                index: number;
                size: {
                    width: number;
                    height: number;
                };
                rotation: import('@embedpdf/models').Rotation;
                objectNumber: number;
                boxes?: {
                    media: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    crop: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    };
                    bleed?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    trim?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                    art?: {
                        left: number;
                        top: number;
                        right: number;
                        bottom: number;
                    } | undefined;
                } | undefined;
            }[];
            isEncrypted: boolean;
            isOwnerUnlocked: boolean;
            permissions: number;
            normalizedRotation: boolean;
        };
        stamps: {
            id: string;
            pageIndex: number;
            name: import('@embedpdf/models').PdfAnnotationName;
            subject: string;
            subjectKey?: string | undefined;
            label?: string | undefined;
            categories?: string[] | undefined;
        }[];
        categories?: string[] | undefined;
        readonly: boolean;
    };
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
}[]>;
export declare const useActiveStamp: (documentId: MaybeRefOrGetter<string>) => import('vue').Ref<{
    libraryId: string;
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
} | null, ActiveStampInfo | {
    libraryId: string;
    stamp: {
        id: string;
        pageIndex: number;
        name: import('@embedpdf/models').PdfAnnotationName;
        subject: string;
        subjectKey?: string | undefined;
        label?: string | undefined;
        categories?: string[] | undefined;
    };
} | null>;
