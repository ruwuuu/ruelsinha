import { SignatureStampFieldDefinition } from '../../lib/index.ts';
export interface UseSignatureUploadOptions {
    accept?: string;
    onResult: (result: SignatureStampFieldDefinition | null) => void;
}
export interface UseSignatureUploadReturn {
    inputRef: {
        current: HTMLInputElement | null;
    };
    openFilePicker: () => void;
    processFile: (file: File) => void;
    handleFileInputChange: (e: Event) => void;
    handleDrop: (e: DragEvent) => void;
    handleDragOver: (e: DragEvent) => void;
    handleDragLeave: () => void;
    previewUrl: string | null;
    isDragging: boolean;
    clear: () => void;
    accept: string;
}
export declare function useSignatureUpload({ accept, onResult, }: UseSignatureUploadOptions): UseSignatureUploadReturn;
